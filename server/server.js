const express = require('express');
const morgan = require('morgan');
const path = require('path');
const router = require('./router.js');
require('dotenv').config();

const port = process.env.PORT;
const app = express();
app.use(express.json());
// app.use(morgan('combined'));
// app.use(express.static(path.join))
app.use('/', router);
app.get('/users', (request, response) => {
  console.log('hello');
  response.json('hello');
});
app.listen(3000, () => {
  console.log('Running on: ', port);
});
