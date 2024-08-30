const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
function userAgentsfunction(){
  const userAgents = [
    // Google Chrome
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Android 13; Mobile; rv:116.0) Gecko/116.0 Firefox/116.0",
  
    // Mozilla Firefox
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0",
    "Mozilla/5.0 (Android 13; Mobile; rv:116.0) Gecko/116.0 Firefox/116.0",
  
    // Safari
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/605.1",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1",
  
    // Microsoft Edge
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.0.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0 Edg/116.0.0.0",
  
    // Opera
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 OPR/100.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 OPR/100.0.0.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:116.0) Gecko/20100101 Firefox/116.0 OPR/100.0.0.0",
  
    // Internet Explorer
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; Trident/7.0; AS; rv:11.0) like Gecko",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
    
    // Android Browsers
    "Mozilla/5.0 (Linux; Android 13; Pixel 7 XL Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 13; Samsung Galaxy S22 Build/SQ1A.230205.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  
    // iOS Browsers
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/605.1",
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1",
  
    // Opera Mini
    "Opera/9.80 (Android 6.0; Linux; Opera Mini/38.0.2254/123.45; U; en) Presto/2.12.423 Version/12.16",
    "Opera/9.80 (Android 8.0; Linux; Opera Mini/49.0.2254/123.45; U; en) Presto/2.12.423 Version/12.16",
  
    // Brave Browser
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Brave/116.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Brave/116.0",
  
    // Vivaldi
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Vivaldi/6.1.3035.102",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Vivaldi/6.1.3035.102"
  ];
  
  // select a random user agent from the list
  const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  // set the user agent in the headers and make a get request
  const header = {
    "User-Agent": ua,
  };
  
  return header
  }
const server = express();

const PORT = process.env.PORT || 3000;
const maxRetries = 5; // Número máximo de reintentos

// Función para hacer scraping con reintento
async function scraper(website, retries = 0) {
  const headers=userAgentsfunction();
  try {
    const { data } = await axios.get(website, { headers, timeout: 5000 }); // Configura un header y un timeout de 5 segundos
    const $ = cheerio.load(data);

    let content = [];

    // Selector optimizado para capturar el título
    const title = $('#productTitle').text().trim();
    if (title) {
      content.push({ title });
    }

    // Selector optimizado para capturar las características
    $('#feature-bullets .a-list-item').each(function () {
      const feature = $(this).text().trim();
      if (feature) {
        content.push({ feature });
      }
    });

    return content;

  } catch (error) {
    console.log(error.message)
    return error
  }
}

server.get('/agent/user', async (req, res) => {
  const headers=userAgentsfunction();
  try {
    await axios("https://httpbin.io/user-agent", {
      headers,
    })
      .then(({ data }) => {
        res.status(200).json(data);
        console.log(data)
      });
  } catch (error) {
    console.log(error.message)
  }
});

server.get('/:id', async (req, res) => {
  try {
    const cp = req.params.id
    const website = `https://amazon.es/dp/${cp}/`;
    const content = await scraper(website);
    res.status(200).json(content);
  } catch (error) {
    console.error('Error al hacer scraping:', error.message);
    res.status(500).json({ error: 'Hubo un problema al obtener los datos después de varios intentos.' });
  }
});



server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

