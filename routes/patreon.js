const express = require('express');
const request = require('request-promise-native');
const router = express.Router();

/* GET home page. */
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
      options = {
        headers: {
          'Authorization': `Bearer ${process.env.PATREON_ACCESS_TOKEN}`
        },
        json: true
      };
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
          id: id,
          full_name: user.attributes.full_name,
          vanity: user.attributes.vanity,
          // email: user.attributes.email,
          discord_id: user.attributes.social_connections.discord ? user.attributes.social_connections.discord.user_id : null,
          amount_cents: pledge.attributes.amount_cents,
          created_at: pledge.attributes.created_at,
          declined_since: pledge.attributes.declined_since,
          patron_pays_fees: pledge.attributes.patron_pays_fees,
          pledge_cap_cents: pledge.attributes.pledge_cap_cents,
          image_url: user.attributes.image_url
        };
      });

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
