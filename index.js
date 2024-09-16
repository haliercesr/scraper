const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const NodeCache = require('node-cache');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Crear una instancia de NodeCache
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // TTL de 1 hora para cada entrada

// Función para rotar User-Agents aleatoriamente
function getRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A5341f Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Función para generar cabeceras aleatorias para cada solicitud
function userAgentsfunction() {
  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7,pt;q=0.5',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': getRandomUserAgent(), // Usamos un User-Agent aleatorio
  };
  return headers;
}

const server = express();
const PORT = process.env.PORT || 3000;
const maxRetries = 5; // Número máximo de reintentos

// Función para hacer scraping con caché y reintento
async function scraper(website, retries = 0) {
  const headers = userAgentsfunction();
  console.log('Headers being sent:', headers);

  // Verificar si el resultado ya está en caché
  const cachedContent = cache.get(website);
  if (cachedContent) {
    console.log(`Cargando desde caché: ${website}`);
    return cachedContent;
  }

  try {
    const delayTime = Math.floor(Math.random() * 3000) + 2000; // Retraso aleatorio entre 2 y 5 segundos
    await delay(delayTime); // Introducimos un retraso aleatorio

    const { data } = await axios.get(website, { headers, timeout: 10000 }); // Timeout de 10 segundos
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

    // Capturar texto adicional y detalles del producto
    $('#aplus .a-spacing-mini, #aplus .a-spacing-base, #aplus p').each(function () {
      const aplusText = $(this).text().trim();
      if (aplusText) {
        content.push({ type: 'more-information', text: aplusText });
      }
    });

    $('#detailBullets_feature_div .a-list-item span').each(function () {
      const detailsText = $(this).text().trim();
      if (detailsText) {
        content.push({ type: 'details-product', text: detailsText });
      }
    });

    // Capturar contenido de la caja
    $('#witb-content-list span').each(function () {
      const contentBoxText = $(this).text().trim();
      if (contentBoxText) {
        content.push({ type: 'content-box', text: contentBoxText });
      }
    });

    // Capturar reviews
    $('#cm-cr-dp-review-list .a-expander-content span').each(function () {
      const reviewText = $(this).text().trim();
      if (reviewText) {
        content.push({ type: 'reviews-product', text: reviewText });
      }
    });

    // Capturar URLs de las imágenes
    const images = [];
    const scriptContent = $('script:contains("colorImages")').html();
    if (scriptContent) {
      const matches = scriptContent.match(/"hiRes":"(https:\/\/[^"]+)"/g);
      if (matches) {
        matches.forEach(match => {
          const hiResUrl = match.split('"')[3];
          if (!images.includes(hiResUrl)) images.push(hiResUrl);
        });
      }
    }
    content.push({ images: images });

    // Guardar el contenido en caché
    cache.set(website, content);
    console.log(`Contenido cacheado para: ${website}`);

    return content;

  } catch (error) {
    // Si es un error 404, no reintentar, devolver error directamente
    if (error.response && error.response.status === 404) {
      console.log('Página no encontrada (404), no se reintentará.');
      return { error: 'Página no encontrada (404)' };
    }

    // Si es otro tipo de error, reintentar
    if (retries < maxRetries) {
      console.log(`Error: ${error.message}. Reintentando (${retries + 1}/${maxRetries})`);
      await delay(3000); // Esperar 3 segundos antes de reintentar
      return scraper(website, retries + 1); // Reintentar
    } else {
      console.log('Se alcanzó el número máximo de reintentos');
      return { error: 'Se alcanzó el número máximo de reintentos', details: error.message };
    }
  }
}

server.get('/agent/user', async (req, res) => {
  const headers = userAgentsfunction();
  try {
    const { data } = await axios("https://httpbin.io/user-agent", { headers });
    res.status(200).json(data);
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }
});

server.get('/:id', async (req, res) => {
  try {
    const cp = req.params.id;
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

server.use((req, res, next) => {
  console.log('Incoming request headers:', req.headers);
  next();
});
