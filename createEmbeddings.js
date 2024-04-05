import { saveEmbeddingsToFile, generateEmbeddings } from './embeddings/index.js';
import { fetchJSONData } from './io/index.js';
const jsonDataUrl = 'https://unknow.news/archiwum_aidevs.json';
try {
	// Step 1: Fetch JSON data from the provided URL
	const jsonData = await fetchJSONData(jsonDataUrl);

	// Step 2: Extract content from JSON data
	const contentData = jsonData.map(entry => entry.info);

	// Step 3: Generate embeddings for the content using a pre-trained model
	const embeddings = await generateEmbeddings(contentData);
	const embeddingsFilePath = 'embeddings.json';
	saveEmbeddingsToFile(embeddings, embeddingsFilePath);
} catch (error) {
	console.error('An error occurred:', error);
}