const express = require('express');
const morgan = require('morgan');
const path = require('path');
const router = require('./router.js');
require('dotenv').config();

const port = process.env.PORT;
const app = express();
app.use(express.json());
// app.use(morgan('combined'));
app.use('/', router);
app.use(express.static(path.join(__dirname, '.././loader')));
app.listen(port, () => {
  console.log('Running on: ', port);
});
