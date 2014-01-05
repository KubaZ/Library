/**
 * BookController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
 var https = require('https');

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to BookController)
   */
  _config: {},

  create: function (req, res) {
    https.get('https://www.googleapis.com/books/v1/volumes?q=ISBN+' +
      req.param('isbn') + '&key=' + sails.config.googleBooksApiKey, function(response) {
      var data = '',
          categories = [];

      response.on('data', function(d) {
        data += d;
      });

      response.on('end', function() {
        var body = JSON.parse(data);

        console.log(body);
        if (body.items) {
          if (body.items[0].volumeInfo.categories) {
                categories = body.items[0].volumeInfo.categories;
            }

          Book.create({
            isbn: req.param('isbn'),
              title: body.items[0].volumeInfo.title,
              authors: body.items[0].volumeInfo.authors,
              categories: categories
          }).done(function (error, book) {
            if (error) {
              res.send(error, 500);
            } else {
              res.json(book);
            }
          });
        } else {
          res.send('Not Found', 404);
        }
      });
    }).on('error', function(e) {
      console.error(e);
      res.json(e);
    });
  }
};