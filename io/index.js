import axios from 'axios'

export async function fetchJSONData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching JSON data:', error);
        throw error;
    }
}

export default {
	fetchJSONData
}