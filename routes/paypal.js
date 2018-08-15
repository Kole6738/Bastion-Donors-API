const express = require('express');
const Discord = require('discord.js');
const request = require('request-promise-native');
const router = express.Router();
const client = new Discord.Client();
const donorsData = require('../data/donorsData.json');

router.get('/', async (req, res, next) => {
  try {
    let options = {
      json: true,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    };

    let donors = [];
    for (let donor of donorsData) {
      let url = `https://discordapp.com/api/users/${donor.discord_id}`;
      let response = await request(url, options);

      donor.usertag = `${response.username}#${response.discriminator}`
    }

    res.json(donorsData);
  }
  catch (e) {
    console.error(e);
  }
});

module.exports = router;
