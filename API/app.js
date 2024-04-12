// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
require('dotenv').config();
const { chatCompletion, embedding, transcript } = require('./openAPI/index.js');

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

app.get('/', (req, res) => {
  res.send('Hello, Aiva!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
