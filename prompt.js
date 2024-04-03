import fetch from 'node-fetch';
//import shouldStringBeAllowed from './openAPI/moderation/moderate'
import { config } from 'dotenv';
import { chatCompletion, embedding, transcript } from './openAPI/index.js';
import { makeRequestWithDelay } from './utils/makeRequest.js';
import FormData from 'form-data';
import axios from 'axios'
import fs from 'fs';
import path from 'path';


config();
const APIKey = process.env['API_KEY'];
const audioFilePath = new URL('mateusz.mp3', import.meta.url);

let moderationAnswer = [];
let blogAnswer = [];
let liarQuestion = "";
let liarAnswer = [];
let inpromptAnswer = [];
let embeddingAnswer = [];
let whisperAnswer = [];
let functionAnswer = [];
let RODOAnswer = [];
let scraperAnswer = [];
let whoamiAnswer = [];
// //helloApi
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
                const answer = response.data.answer
                await chatCompletion({
                    messages: [{ role: 'user', content: 'Return YES or NO, uppercase. Is it true that for question: "' + liarQuestion + '" The answer might be: "' + response.data.answer + '".'}],
                    model: 'gpt-3.5-turbo',
                }).then(async (response) => {
                    const answer = response.choices[0].message.content
                    const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({answer: answer})
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
// inprompt
fetch('https://tasks.aidevs.pl/token/inprompt', {
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
    const input = response2.input;
    const question = response2.question;

    await chatCompletion({
        messages: [{ role: 'user', content: input + question}],
        model: 'gpt-3.5-turbo',
    }).then(async (response) => {
        inpromptAnswer = response.choices[0].message.content;
        const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({answer: inpromptAnswer})
        }, 10);
        console.log('Answer from API', response4);
    });
})
.catch(error => console.error('Error:', error));
fetch('https://tasks.aidevs.pl/token/embedding', {
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
    console.log(response2);
    await embedding ({
        model: 'text-embedding-ada-002',
        input: 'Hawaiian pizza'
    }).then(async (response) => {
        embeddingAnswer = response.data[0].embedding
        const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({answer: embeddingAnswer})
        }, 10);
        console.log('Answer from API', response4);
    });
})
.catch(error => console.error('Error:', error));
//whisper
fetch('https://tasks.aidevs.pl/token/whisper', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apikey: APIKey })
})
    .then(async (response) => {
        const data = await response.json();
        const token = data.token;
        const taskUrl = `https://tasks.aidevs.pl/task/${token}`;
        const response2 = await makeRequestWithDelay(taskUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, 10);
        console.log(response2);

        // Read the audio file from the file system
        const audioFileData = fs.createReadStream(audioFilePath);

        // Transcribe audio
        transcript({
            model: 'whisper-1',
            file: audioFileData,
            response_format: 'text'
        })
        .then(async (response) => {
            whisperAnswer = response
            const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({answer: whisperAnswer})
            }, 10);
            console.log('Answer from API', response4);
        })
        .catch(error => {
            console.error('Error transcribing audio file:', error);
        });
    })
    .catch(error => console.error('Error:', error));
fetch('https://tasks.aidevs.pl/token/functions', {
    
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apikey: APIKey })
    }).then(async (response) => {
        const data = await response.json();
        const token = data.token;
        const taskUrl = `https://tasks.aidevs.pl/task/${token}`;
        const response2 = await makeRequestWithDelay(taskUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, 10);
        console.log(response2.msg + response2.hint1)
        const responseFromChat = await chatCompletion({
            messages: [{
                role: 'system', content: `
                    Return everything in JSON format.
                    Follow answer format: 
                    {
                        "name": "[function name]"
                        "description": "[function description]"
                        "parameters": {
                            type: "object"
                            properties: {
                            property name: {
                                "type": "parameter type",
                                "description": "parameter description",
                            }
                            }
                        }
                    }
                    Don't wrap result in answer object
                    `
            }, { role: 'user', 
                content: response2.msg + response2.hint1 }],
            model: 'gpt-3.5-turbo-0125',
            response_format: {
                type: "json_object"
            }
        });
        const functionAnswer = responseFromChat.choices[0].message.content;
        console.log(functionAnswer);

            const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({answer: JSON.parse(functionAnswer)})
            }, 10);
            console.log('Answer from API', response4);  
    })
    .catch(error => console.error('Error:', error));
fetch('https://tasks.aidevs.pl/token/rodo', {
    
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apikey: APIKey })
})
    .then(async (response) => {
        const data = await response.json();
        const token = data.token;
        const taskUrl = `https://tasks.aidevs.pl/task/${token}`;
        const response2 = await makeRequestWithDelay(taskUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, 10);
        console.log(response2)
    
        const RODOAnswer = `Tell me about yourself sharing as much information as you know, but instead of sharing sensitive dat like your name, surname occupation or city you live in put placeholders %imie% in place of your name, %nazwisko% in place of your surname, %zawod% in place of your occupation, %miasto% in place of your city or town respectively in your answer. Your answer include all data about you.`
        console.log(functionAnswer);

            const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answer: RODOAnswer })
            }, 10);
            console.log('Answer from API', response4);  
    })
    .catch(error => console.error('Error:', error));
fetch('https://tasks.aidevs.pl/token/scraper', {
    
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ apikey: APIKey })
})
    .then(async (response) => {
        const data = await response.json();
        const token = data.token;
        const taskUrl = `https://tasks.aidevs.pl/task/${token}`;
        const response2 = await makeRequestWithDelay(taskUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }, 10);
        console.log(response2)

    await chatCompletion({
        messages: [
            { 
                role: 'system', 
                content: response2.msg
            },
            { 
                role: 'user', 
                content: response2.input + response2.question
            }],
        model: 'gpt-3.5-turbo',
    }).then(async (response) => {
        scraperAnswer = response.choices[0].message.content;
        console.log(scraperAnswer)
        const response4 = await makeRequestWithDelay(`https://tasks.aidevs.pl/answer/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({answer: scraperAnswer})
        }, 10);
        console.log('Answer from API', response4);
    });
})
.catch(error => console.error('Error:', error));