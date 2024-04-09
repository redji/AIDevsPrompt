import axios from 'axios';
import { config } from 'dotenv';
import { generateEmbeddings } from './embeddings/index.js'
import fs from 'fs';
import JSONStream from 'JSONStream';
import {QdrantClient} from '@qdrant/js-client-rest';
const client = new QdrantClient({url: 'http://127.0.0.1:6333'});

// const jsonDataUrl = 'https://unknow.news/archiwum_aidevs.json';
const jsonDataUrl = 'https://tasks.aidevs.pl/data/people.json';
const embeddingsFilePath = 'embeddings.json';
 
async function fetchJSONData(url) {
    const response = await axios.get(url);
    return response.data;
}
/*
	Generate embeddings with OpenAI and save them to file for future use,
	to not call AI each time when working on generation and processing.
	*/
async function processInBatchesAndSaveToJSON() {
    try {
        const jsonData = await fetchJSONData(jsonDataUrl);
        for (let i = 0; i<jsonData.length; i++) {
			let entry = jsonData[i];
			await generateEmbeddings(entry.imie + ' ' + entry.nazwisko).then(async (response) => {
				fs.appendFileSync(embeddingsFilePath, JSON.stringify({...response}) + '\n');
				console.log('Processed: ' + i + '.');
			})
		}
		
		// const totalEntries = jsonData.length;
        // const batchSize = 10;
		// let k = 0;

        // for (let i = 0; i < totalEntries; i += batchSize) {
		// 	if (k === 10) {
		// 		k = 0;
		// 	}
        //     const startIndex = i;
        //     const endIndex = Math.min(i + batchSize, totalEntries);
        //     const contentData = jsonData.slice(startIndex, endIndex).map(entry => entry.title + ' ' + entry.info);
        //     await generateEmbeddingsForBatch(contentData).then(async (response) => {
		// 		response.forEach(async (embeddedElement, index) => {
		// 			fs.appendFileSync(embeddingsFilePath, JSON.stringify({ id: 'i = ' + i + ';k = ' + k + ';index = ' + index, response }) + '\n');
		// 		})
		// 	});
		// 	k++;
        //     console.log(`Batch ${startIndex / batchSize + 1} saved to ${embeddingsFilePath}`);
        // }
        console.log('Embeddings generation completed.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
async function addToDBFromJSON () {
	try {
        const jsonData = await fetchJSONData(jsonDataUrl);
		const stream = fs.createReadStream(embeddingsFilePath, { encoding: 'utf8' });
		const jsonStream = JSONStream.parse('*');
		stream.pipe(jsonStream);
		let id = 0;
		jsonStream.on('data', async (data) => {
			if(typeof data === 'object' && Array.isArray(data)) {
				const upsertObject = {
					wait: true,
					points: [{
						id,
						vector: data[0].embedding,
						payload: jsonData[id]
					}]
				}
				id++;
				const operation_info = await client.upsert('knowledgeDB', upsertObject)
				console.log(operation_info);
			}
		});
		
		// Handle errors
		stream.on('error', (err) => {
			console.error('Error reading file:', err);
		});
	} catch (error) {
        console.error('An error occurred:', error);
    }
}
	// element.data.map((embedding, index2) => {
					// 	console.log((i * 100) * (index * 10) + index2);
					// });
					// const operation_info = await client.upsert('AIDevsDB00001', {
					// 	wait: true,
					// 	points: embeddedElement.data.map((data, indexOfEmbedding) => {
					// 		const id = i + index
					// 		return {
					// 			id,
					// 			vector: data.embedding,
					// 			payload: jsonData[parseInt(i.toString() + index.toString())]
					// 		}
					// 	})
					// });
					// console.log(operation_info)

			// for (const element in response) {
				// 	const operation_info = await client.upsert('ai_devs_embeddings_search', {
				// 		wait: true,
				// 		points: response.map((embedding, index) => {
				// 			console.log(embedding)
				// 			const id = index + (i * batchSize);
				// 			return {
				// 				id,
				// 				vector: embedding.data[0].embedding,
				// 				payload: jsonData[id]
				// 			}
				// 		})
				// 	});
				// 	console.log(operation_info)
				// }
				// const operation_info = await client.upsert('ai_devs_embeddings_search', {
				// 	wait: true,
				// 	points: response.map((embedding, index) => {
				// 		console.log(embedding)
				// 		const id = index + (i * batchSize);
				// 		return {
				// 			id,
				// 			vector: embedding.data[0].embedding,
				// 			payload: jsonData[id]
				// 		}
				// 	})
				// });
				// console.log(operation_info)
				// const json_to_save = response.map((embedding, index) => {
				// 	console.log(embedding)
				// 	const id = index + (i * batchSize);
				// 	return {
				// 		id,
				// 		vector: embedding.data[0].embedding,
				// 		payload: jsonData[id]
				// 	}
				// });
				// fs.appendFileSync(embeddingsFilePath, JSON.stringify(json_to_save) + '\n');
				




// processInBatchesAndSaveToJSON();
addToDBFromJSON();