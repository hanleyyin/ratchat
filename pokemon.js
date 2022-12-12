const { rejects } = require('assert');
const { ADDRGETNETWORKPARAMS } = require('dns');
const https = require('https');

async function getPokemonSprite(name) {
    return new Promise((resolve, reject) => {
        try {
            https.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}/`, (response) => {
                let data = '';

                response.on('data', (chunk) => {
                data += chunk;
                });

                response.on('end', () => {
                    if (data == "Not Found")
                        resolve("Not Found");
                    else {
                        const obj = JSON.parse(data);
                        resolve(obj.sprites.other['official-artwork'].front_default);
                    }
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = { getPokemonSprite };