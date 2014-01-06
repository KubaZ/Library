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
  add: function (req, res, next) {
    Book.find({isbn: req.param('isbn')}).done(function (err, book) {
      if (err) {

      }

      if (book.length === 0) {
        https.get('https://www.googleapis.com/books/v1/volumes?q=ISBN+' +
          req.param('isbn') + '&key=' + sails.config.googleBooksApiKey, function(response) {
          var data = '',
              categories = [];

          response.on('data', function(d) {
            data += d;
          });

          response.on('end', function() {
            var body = JSON.parse(data);

            if (body.items) {
              if (body.items[0].volumeInfo.categories) {
                    categories = body.items[0].volumeInfo.categories;
                }

              Book.create({
                isbn: req.param('isbn'),
                title: body.items[0].volumeInfo.title,
                authors: body.items[0].volumeInfo.authors,
                categories: categories,
                user: [req.session.User.email]
              }).done(function (err, volume) {
                if (err) {
                  req.session.flash = {
                    err: err
                  };
                }
                res.redirect('/book');
                next();
              });
            } else {
              req.session.flash = {
                err: [{message: 'Book not Found.'}]
              };
              res.redirect('/book');
              next();
            }
          });
        }).on('error', function(e) {
          res.json(e);
        });
      } else {
        console.log(book);
        if (_.indexOf(book.user, req.session.User.email) !== -1) {
          book.user.push(req.session.User.email);
          req.session.flash = {
            err: [{message: 'Book added to collection.'}]
          };
          res.redirect('/book');
          next();
        } else {
          req.session.flash = {
            err: [{message: 'Book already in collection.'}]
          };
          res.redirect('/book');
          next();
        }
      }
    });
  },

  index: function (req, res) {
    Book.find({user: req.session.User.email}).done(function(err, books) {
      if (err) {
        req.session.flash = {
          err: err
        };

        return res.view({
          flash: req.session.flash,
          books: books
        });
      }
      res.view({
        books: books
      });
    });
  },

  remove: function (req, res) {
    Book.destroy({isbn: req.param('isbn'), user: req.session.User.email}).done(function(err, book) {
      if (err) {
        req.session.flash = {
          err: err
        };
        return res.redirect('/book');
      } else {
        res.redirect('/book');
      }
    });
  }
};
