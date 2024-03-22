import fetch from 'node-fetch';
//import shouldStringBeAllowed from './openAPI/moderation/moderate'
import { config } from 'dotenv';
import { chatCompletion, moderations } from './openAPI/index.js';
import { makeRequestWithDelay } from './utils/makeRequest.js';
import FormData from 'form-data';
import axios from 'axios'

config();
const APIKey = process.env['API_KEY'];

let moderationAnswer = [];
let blogAnswer = [];
let liarQuestion = "";
let liarAnswer = [];
//helloApi
fetch('https://tasks.aidevs.pl/token/helloapi', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({apikey: APIKey})
})
.then(async (response) => {
    const data = await response.json();
    const token = data.token;
    const url = `https://tasks.aidevs.pl/task/${token}`;
    
    // Second curl command with a delay of 2000 milliseconds (2 seconds)
    const response2 = await makeRequestWithDelay(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, 10);
    const cookie = response2.cookie;
    // Third curl command with a delay of 2000 milliseconds (2 seconds)
    const response3 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answer: cookie})
    }, 10);
    console.log(response3);
})
.catch(error => console.error('Error:', error));
//moderation
fetch('https://tasks.aidevs.pl/token/moderation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({apikey: APIKey})
})
.then(async (response) => {
    const data = await response.json();
    const token = data.token;
    const url = `https://tasks.aidevs.pl/task/${token}`;
    
    // Second curl command with a delay of 2000 milliseconds (2 seconds)
    const response2 = await makeRequestWithDelay(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, 10);
    
    moderationAnswer = []; // Clear previous values
    
    for (const element of response2.input) {
        moderationAnswer.push(shouldStringBeAllowed(element) ? 1 : 0);
    }
    // Third curl command with a delay of 2000 milliseconds (2 seconds)
    const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answer: moderationAnswer})
    }, 10);
    console.log(response4);
})
.catch(error => console.error('Error:', error));

//blogger
fetch('https://tasks.aidevs.pl/token/blogger', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({apikey: APIKey})
})
.then(async (response) => {
    const data = await response.json();
    const token = data.token;
    const url = `https://tasks.aidevs.pl/task/${token}`;

    const response2 = await makeRequestWithDelay(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }, 10);

    blogAnswer = []; // Clear previous values

    for (const element of response2.blog) {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: 'Napisz 4 zdania na temat: ' + element }],
            model: 'gpt-3.5-turbo',
        });
        blogAnswer.push(chatCompletion.choices[0].message.content);

    }
    // Third curl command with a delay of 2000 milliseconds (2 seconds)
    const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answer: blogAnswer})
    }, 10);
})
.catch(error => console.error('Error:', error));

//liar
fetch('https://tasks.aidevs.pl/token/liar', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({apikey: APIKey})
})
.then(async (response) => {
    const data = await response.json();
    const token = data.token;
    const url = `https://tasks.aidevs.pl/task/${token}`;

    await chatCompletion({
        messages: [{ role: 'user', content: 'No chit-chat, ask one question'}],
        model: 'gpt-3.5-turbo',
    }).then(async (response) => {
        liarQuestion = response.choices[0].message.content;
        liarAnswer = []; // Clear previous values
        axios.get(url).then((response)=>{
            console.log(response.data);
            const form = new FormData();
            form.append('question', liarQuestion);
            axios.post(url, form, {
                headers: form.getHeaders()
            })
            .then(async (response) => {
                console.log('Response:', response.data);
                await chatCompletion({
                    messages: [{ role: 'user', content: 'Return YES or NO, uppercase. Is it true that for question: "' + liarQuestion + '" The answer might be: "' + response.data.answer + '".'}],
                    model: 'gpt-3.5-turbo',
                }).then(async (response) => {
                    console.log('Response2', response.choices[0].message.content)
                    const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({answer: response.choices[0].message.content})
                    }, 10);
                    console.log('Answer from API', response4)
                });
            })
            .catch((error) => {
                // Handle error
                console.error('Error:', error);
            });
        });
        });
})
.catch(error => console.error('Error:', error));