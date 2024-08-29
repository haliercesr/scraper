const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const server = express();

const PORT = process.env.PORT || 3000;



server.get('/:id', async (req, res) => {
  const cp=req.params.id
  const website = `https://amazon.es/dp/${cp}/`;
  try {
    const { data } = await axios.get(website, { timeout: 20000 }); // Configura un timeout de 10 segundos
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

    res.status(200).json(content);

  } catch (error) {
    console.error('Error al hacer scraping:', error.message);
    res.status(500).json({ error: 'Hubo un problema al obtener los datos.' });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
