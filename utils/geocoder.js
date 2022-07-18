const nodeGeocoder = require('node-geocoder');

const options = {
    provider: process.env.GEO_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEO_CODER_API_KEY,
    formatter: null
}

const geoCoder = nodeGeocoder(options);

module.exports = geoCoder;