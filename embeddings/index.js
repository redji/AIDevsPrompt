import fs from 'fs';
import tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export async function saveEmbeddingsToFile(embeddings, filePath) {
    // Convert TensorFlow tensors to arrays
    const embeddingsArrays = await Promise.all(embeddings.map(embedding => embedding.array()));

    // Serialize embeddings to JSON
    const serializedEmbeddings = JSON.stringify(embeddingsArrays);

    // Write serialized embeddings to file
    fs.writeFileSync(filePath, serializedEmbeddings);
}
export async function loadEmbeddingsFromFile(filePath) {
    // Read serialized embeddings from file
    const serializedEmbeddings = fs.readFileSync(filePath, 'utf8');

    // Parse serialized embeddings from JSON
    const embeddingsArrays = JSON.parse(serializedEmbeddings);

    // Convert arrays to TensorFlow tensors
    const embeddings = embeddingsArrays.map(array => tf.tensor(array));

    return embeddings;
}
export async function generateEmbeddings(contentData) {
    // Example: Dummy function to generate embeddings
    const embeddings = [];
    for (const content of contentData) {
        const embedding = await embedTextData(content);
        embeddings.push(embedding);
    }
    return embeddings;
}
export async function embedTextData(text) {
	const model = await use.load();
    // Assume text is a string
	const embeddings = await model.embed(text);
    return embeddings;
}
export function findSimilar(embeddingsTensor, queryEmbedding, contentData, k) {
    const cosineSimilarities = [];
    // Compute cosine similarity between query embedding and each content embedding
    for (let i = 0; i < contentData.length; i++) {
        const contentEmbedding = embeddingsTensor.gather([i]); // Gather the i-th embedding

        // Ensure query embedding has at least 2 dimensions
        const queryExpanded = tf.expandDims(queryEmbedding, 0);

        // Ensure content embedding has at least 2 dimensions
        const contentExpanded = tf.expandDims(contentEmbedding, 0);

        // Log shapes for debugging
        console.log('Query embedding shape:', queryExpanded.shape);
        console.log('Content embedding shape:', contentExpanded.shape);

        // Calculate cosine similarity
        const similarity = tf.tidy(() => {
            const dotProduct = tf.matMul(queryExpanded, contentExpanded, true, false);
            console.log('Dot product:', dotProduct.dataSync());
            
            const queryMagnitude = tf.norm(queryExpanded);
            console.log('Query magnitude:', queryMagnitude.dataSync());

            const contentMagnitude = tf.norm(contentExpanded);
            console.log('Content magnitude:', contentMagnitude.dataSync());

            return dotProduct.div(queryMagnitude.mul(contentMagnitude)).dataSync()[0];
        });

        // Store the similarity score along with the index
        cosineSimilarities.push({ index: i, similarity });

        // Log computed similarity for debugging
        console.log(`Computed similarity for index ${i}: ${similarity}`);
    }

    // Sort similarities in descending order
    cosineSimilarities.sort((a, b) => b.similarity - a.similarity);

    // Return top k most similar indices
    const topIndices = cosineSimilarities.slice(0, k).map(item => item.index);
    console.log('Top indices:', topIndices);
    return topIndices;
}