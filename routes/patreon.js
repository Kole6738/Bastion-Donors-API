const express = require('express');
const request = require('request-promise-native');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    let options = {
      headers: {
        'Authorization': `Bearer ${process.env.PATREON_ACCESS_TOKEN}`
      },
      json: true
    };
    let url = 'https://www.patreon.com/api/oauth2/api/current_user/campaigns';
    let response = await request(url, options);

    if (response && response.data && response.data.length) {
      url = `https://www.patreon.com/api/oauth2/api/campaigns/${response.data[0].id}/pledges`;
      response = await request(url, options);

      let data = response.data;
      let included = response.included;

      let pledges = data.filter(data => data.type === 'pledge');
      let users = included.filter(inc => inc.type === 'user');

      let patrons = pledges.map(pledge => {
        let id = pledge.relationships.patron.data.id;
        let user = users.filter(user => user.id === pledge.relationships.patron.data.id)[0];

        return {
          name: user.attributes.full_name,
          pledge_amount: pledge.attributes.amount_cents / 100,
          patron_since: pledge.attributes.created_at,
          declined_since: pledge.attributes.declined_since,
          image_url: user.attributes.image_url,
          discord_id: user.attributes.social_connections.discord ? user.attributes.social_connections.discord.user_id : null,
        };
      });

      options.headers.Authorization = `Bot ${process.env.DISCORD_BOT_TOKEN}`;
      for (let patron of patrons) {
        let discord_tag = null;
        let discord_avatar_url = null;

        if (patron.discord_id) {
          let url = `https://discordapp.com/api/users/${patron.discord_id}`;
          let response = await request(url, options);

          discord_tag = `${response.username}#${response.discriminator}`;
          discord_avatar_url = response.avatar
            ? `https://cdn.discordapp.com/avatars/${patron.discord_id}/${response.avatar}.${response.avatar.startsWith('a_') ? 'gif' : 'png'}?size=2048`
            : `https://cdn.discordapp.com/embed/avatars/${response.discriminator %  5}.png`;
        }

        patron.patron_since = patron.patron_since ? new Date(patron.patron_since).getTime() : null;
        patron.declined_since = patron.declined_since ? new Date(patron.declined_since).getTime() : null;
        patron.discord_tag = discord_tag;
        patron.discord_avatar_url = discord_avatar_url;
      }

      res.json(patrons);
    }
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
