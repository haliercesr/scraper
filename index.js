const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
};

const server = express();

const PORT = process.env.PORT || 3000;
const maxRetries = 0; // Número máximo de reintentos

// Función para hacer scraping con reintento
async function scraper(website, retries = 0) {
  try {
    const { data } = await axios.get(website, { headers, timeout: 30000 }); // Configura un header y un timeout de 10 segundos
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
    if (retries < maxRetries) {
      console.log(`Reintentando... (${retries + 1}/${maxRetries})`);
      return scraper(retries + 1); // Reintentar la función
    } else {
      throw new Error('Error al hacer scraping después de varios intentos.');
    }
  }
}

server.get('/agent/user', async (req, res) => {
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

