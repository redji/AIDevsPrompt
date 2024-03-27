import { config } from 'dotenv';
import OpenAI from 'openai';
import { makeRequestWithDelay } from "../utils/makeRequest.js"
config();
const OpenAIKey = process.env['OPENAI_API_KEY'];


const openai = new OpenAI({
    apiKey: OpenAIKey // This is the default and can be omitted
  });

export async function chatCompletion(createObject) {
    return await openai.chat.completions.create(createObject);
}
export async function moderations (input) {
    return await makeRequestWithDelay(`https://api.openai.com/v1/moderations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OpenAIKey}`
        },
        body: JSON.stringify({ input })
    });
}
export async function embedding(createObject) {
    return await openai.embeddings.create(createObject);
}
export default {
    moderations,
    chatCompletion,
    embedding
}