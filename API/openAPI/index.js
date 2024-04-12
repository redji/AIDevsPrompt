const { config } = require('dotenv');
const OpenAI = require('openai');
const { makeRequestWithDelay } = require("../utils/makeRequest.js");

config();

const OpenAIKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OpenAIKey // This is the default and can be omitted
});

async function chatCompletion(createObject) {
    return await openai.chat.completions.create(createObject);
}

async function moderations(input) {
    return await makeRequestWithDelay(`https://api.openai.com/v1/moderations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OpenAIKey}`
        },
        body: JSON.stringify({ input })
    });
}

async function embedding(createObject) {
    return await openai.embeddings.create(createObject);
}

async function transcript(createObject) {
    return await openai.audio.transcriptions.create(createObject);
}

module.exports = {
    moderations,
    chatCompletion,
    embedding,
    transcript
};
