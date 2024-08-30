const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const server = express();
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
};
const PORT = process.env.PORT || 3000;

const website = 'https://www.amazon.es/dp/B0CGRQ2C11/';

try {
  axios(website,{headers,}).then((res) => {
    const data = res.data;
    const $ = cheerio.load(data);

    let content = [];

    $('#feature-bullets .a-list-item', data).each(function () {
      const title = $(this).text();
      const url = $(this).find('a').attr('href');

      content.push({
        title,
        url,
      });

      server.get('/', (req, res) => {
        res.json(content);
      });
    });
  });
} catch (error) {
  console.log(error, error.message);
}

server.listen(PORT, () => {
  console.log(`server is running on PORT:${PORT}`);
});
