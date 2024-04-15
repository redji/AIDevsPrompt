const axios = require('axios');

async function fetchJSONData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    fetchJSONData
};