import fetch from 'node-fetch';

const APIKey = '';

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
    console.log(data);
    const token = data.token;
    const url = `https://tasks.aidevs.pl/task/${token}`;
    console.log(token);
    console.log(url);
    
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