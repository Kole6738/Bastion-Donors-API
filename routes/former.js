const express = require('express');
const request = require('request-promise-native');
const router = express.Router();
const donorsData = require('../data/donorsData.json');

router.get('/', async (req, res, next) => {
  try {
    let options = {
      json: true,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
      }
    };

    for (let donor of donorsData) {
      let url = `https://discordapp.com/api/users/${donor.discord_id}`;
      let response = await request(url, options);

      donor.last_donated = new Date(donor.last_donated).getTime();
      donor.discord_tag = `${response.username}#${response.discriminator}`;
      donor.discord_avatar_url = response.avatar
        ? `https://cdn.discordapp.com/avatars/${donor.discord_id}/${response.avatar}.${response.avatar.startsWith('a_') ? 'gif' : 'png'}?size=2048`
        : `https://cdn.discordapp.com/embed/avatars/${response.discriminator %  5}.png`;
    }

    res.json(donorsData);
  }
  catch (e) {
    if (e.name === 'StatusCodeError') {
      res.json({
        error: '500',
        message: `Internal Error - ${e.statusCode}`
      });
    }
    else {
      next(e);
    }
  }
});

module.exports = router;
