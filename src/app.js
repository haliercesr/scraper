const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const server = express();

const PORT = process.env.PORT || 3000;

const website = 'https://amazon.es/dp/B07M98CL6Y/';

try {

  async function scraper() {
    await axios(website).then((res) => {
      const data = res.data;
      const $ = cheerio.load(data);
      console.log("valor de cherio"+$)
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

      server.get('/', (req, res) => {
        res.status(200).json(content);
      });

    });
  }

  scraper();
} catch (error) {
  console.log(error, error.message);
}

module.exports = server;
