const axios = require('axios');

const getCountryGDP = async (countryCode = 'IND') => {
    try {
        const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&date=2023`;
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout
        });
        // World Bank returns [metadata, data_array]
        if (response.data && response.data[1] && response.data[1].length > 0) {
            return response.data[1][0].value;
        }
        return null;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error("GDP Fetch Error: Request timeout");
        } else if (error.response) {
            console.error("GDP Fetch Error: HTTP", error.response.status, error.response.statusText);
        } else {
            console.error("GDP Fetch Error:", error.message);
        }
        return null;
    }
};

module.exports = { getCountryGDP };