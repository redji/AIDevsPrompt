import fetch from 'node-fetch';

const APIKey = '';
const OpenAIKey = '';
let moderationAnswer = [];

// Function to make a request with a delay
async function makeRequestWithDelay(url, options, delay) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const response = await fetch(url, options);
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        }, delay);
    });
}

// First curl command
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

// Second curl command
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
        const response3 = await makeRequestWithDelay(`https://api.openai.com/v1/moderations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OpenAIKey}`
            },
            body: JSON.stringify({ input: element })
        });
        moderationAnswer.push(response3.results[0].flagged ? 1 : 0);
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