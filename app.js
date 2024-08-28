const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();

const PORT = process.env.PORT || 3000;

const website = 'https://www.amazon.es/dp/B09TP2B11R/';

try {
  
  axios(website).then((res) => {
    const data = res.data;
    const $ = cheerio.load(data);

    let content = [];

      $('.a-size-large', data).each(function () {
      const title = $(this).text();
      const url = $(this).find('a').attr('href');
      content.push({
        title,
      });
    });

    $('.a-list-item', data).each(function () {
      const features = $(this).text();
      content.push({
        features,
      });
    });

    app.get('/', (req, res) => {
      res.status(200).json(content);
    });

  });
} catch (error) {
  console.log(error, error.message);
}

app.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
});

