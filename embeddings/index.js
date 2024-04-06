import { embedding } from '../openAPI/index.js'
export async function generateEmbeddings(contentData, i) {
    return await embedding ({
        model: 'text-embedding-3-large',
        input: contentData,
        dimensions: 512
    })
}
