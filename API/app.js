// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
require('dotenv').config();
const { generateEmbeddings } = require('./embeddings/index.js');
const { fetchJSONData } = require('./io/index.js');
const { chatCompletion } = require('./openAPI/index.js');
const JSONStream = require('JSONStream');
const fs = require('fs');

const chatFilePath = 'chat.json';

const APIKey = process.env['API_KEY'];

app.use(bodyParser.json());
app.post('/answer/', async (req, res) => {
	// Access JSON data from the request body
	const jsonData = req.body;
  
	// Do something with the JSON data
	//console.log('Received JSON data:', jsonData);
  
	// Send a response
	await chatCompletion({
		messages: [
			{ 
				role: 'system', 
				content: ''
			},
			{ 
				role: 'user', 
				content: jsonData.question
			}],
		model: 'gpt-3.5-turbo'
	}).then(async (response) => {
		res.json({ reply: response.choices[0].message.content });
	});
  });
  app.post('/chat/', async (req, res) => {
	let previousChat = '[';
	setTimeout(async () => {
	try {
		const stream = fs.createReadStream(chatFilePath, { encoding: 'utf8' });
		const jsonStream = JSONStream.parse('*');
		stream.pipe(jsonStream);
		jsonStream.on('data', async (data) => {
			console.log('Data: ' + data);
			previousChat += '{"' + data + '"},';
		});
		
		// Handle errors
		stream.on('error', (err) => {
			console.error('Error reading file:', err);
		});
		stream.on('end', async () => {
				previousChat += '].'
				console.log('Previous chat in end function (' + previousChat.length  +'): ' + previousChat)
				const jsonData = req.body;
				// Do something with the JSON data
				//console.log('Received JSON data:', jsonData);
				fs.appendFileSync(chatFilePath, JSON.stringify({ question: jsonData.question }) + '\n');
				const systemPrompt = `Anwser all user questions.
					Parse user question for answer or find it in previous user prompts.
					This are previous prompts from user use it as context for answers: ` + previousChat + '. This is current question:' +
					'Dont elaborate just provide anwsers based on data you have without extra chit chat';
					console.log('System prompt: ' + systemPrompt)
				await chatCompletion({
					messages: [
						{ 
							role: 'system', 
							content: systemPrompt
						},
						{ 
							role: 'user', 
							content: jsonData.question
						}],
					model: 'gpt-3.5-turbo'
				}).then(async (response) => {
					res.json({ reply: response.choices[0].message.content });
				});
        });
	} catch (error) {
        console.error('An error occurred:', error);
    }
}, 5000);  // Resolve the promise with the accumulated data

	// Access JSON data from the request body
	

	// await generateEmbeddings(jsonData.question).then(async (response) => {
		// console.log(response);
		// const upsertObject = {
		// 	wait: true,
		// 	points: [{
		// 		id,
		// 		vector: {response},
		// 		payload: jsonData[id]
		// 	}]
		// }
	// })

	// await chatCompletion({
	// 	messages: [
	// 		{ 
	// 			role: 'system', 
	// 			content: `Find shared details about the user and return JSON with it.`
	// 		},
	// 		{ 
	// 			role: 'user', 
	// 			content: jsonData.question
	// 		}],
	// 	model: 'gpt-3.5-turbo'
	// }).then(async (response) => {
	// 	res.json({ reply: response.choices[0].message.content });
	// });
	
  
	// // Send a response
	// await chatCompletion({
	// 	messages: [
	// 		{ 
	// 			role: 'system', 
	// 			content: information.toString()
	// 		},
	// 		{ 
	// 			role: 'user', 
	// 			content: jsonData.question
	// 		}],
	// 	model: 'gpt-3.5-turbo'
	// }).then(async (response) => {
	// 	res.json({ reply: response.choices[0].message.content });
	// });
  });

app.get('/', (req, res) => {
  res.send('Hello, Aiva!');
});
app.get('/clearJSON', (req, res) => {
	fs.writeFileSync(chatFilePath, '');
	res.send('JSon Cleared!');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
