const express = require('express');
const cors = require('cors')
const logger = require('morgan');
require('dotenv').config();

const patreonRouter = require('./routes/patreon');
const formerRouter = require('./routes/former');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/patreon', patreonRouter);
app.use('/former', formerRouter);

// Catch 404
app.use((req, res, next) => {
  res.json({
    error: '404',
    message: 'Not Found'
  });
});

module.exports = app;
