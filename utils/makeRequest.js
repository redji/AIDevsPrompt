// Function to make a request with a delay
export async function makeRequestWithDelay(url, options, delay) {
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

export default {
    makeRequestWithDelay
}