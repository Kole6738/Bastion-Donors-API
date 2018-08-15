const express = require('express');
const request = require('request-promise-native');
const router = express.Router();
const donorsData = require('../data/donorsData.json');

router.get('/', (req, res, next) => {
  res.json(donorsData);
});

module.exports = router;
