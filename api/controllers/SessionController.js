/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
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
var bcrypt = require('bcrypt');

module.exports = {
  new: function (req, res) {
    res.view('session/new');
  },

  create: function (req, res, next) {
    if (!req.param('email') || !req.param('password')) {
      var usernamePasswordRequiredError = [{
        name: 'usernamePasswordRequiredError',
        message: 'You must enter both a username and password.'
      }];

      req.session.flash = {
        err: usernamePasswordRequiredError
      }

      return res.redirect('/session/new');;
    }

    User.findOneByEmail(req.param('email'), function foundUser (err, user) {
      if (err) return next(err);

      if (!user) {
        var noAccountError = [{name: 'noAccount', message: 'The email; addres ' +
        req.param('email') + ' not found.'}];
        req.session.flash = {
          err: noAccountError
        }
        return res.redirect('/session/new');
      }

      bcrypt.compare(req.param('password'), user.encryptedPassword, function (err, valid) {
        if (err) return next(err);

        if (!valid) {
          var invalidPassword = [{name: 'Invalid Password', message: 'Invalid username and password combination'}];
          req.session.flash = {
            err: invalidPassword
          }
          return res.redirect('/session/new');
        }

        req.session.authenticated = true;
        req.session.User = user;

        res.redirect('/book');
      });
    });
  },

  destroy: function (req, res, next) {
    req.session.destroy();

    res.redirect('/session/new');
  }


};
