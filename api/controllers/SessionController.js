/**
 * SessionController
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
var bcrypt = require('bcrypt'),
    utils = require('../services/utils');

module.exports = {
    login: function(req, res) {
        res.view('session/login');
    },

    create: function(req, res, next) {
        if (!req.param('email') || !req.param('password')) {
            utils.setFlash(req, 'alert-danger', [{
                name: res.i18n('Email and password required.'),
                message: res.i18n('You must enter both username and password.')
            }]);

            return res.redirect('/login');
        }

        User.findOneByEmail(req.param('email'), function foundUser(err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                utils.setFlash(req, 'alert-danger', [{
                    name: 'noAccount',
                    message: res.i18n('The email addres: %s was not found.', req.param('email'))
                }]);

                return res.redirect('/login');
            }

            bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
                if (err) {
                    return next(err);
                }

                if (!valid) {
                    utils.setFlash(req, 'alert-warning', [{
                        name: res.i18n('Invalid data.'),
                        message: res.i18n('Invalid username and password combination.')
                    }]);

                    return res.redirect('/login');
                }

                req.session.authenticated = true;
                req.session.User = user;

                res.redirect('/user/library');
            });
        });
    },

    logout: function(req, res) {
        req.session.destroy();

        res.redirect('/login');
    }


};
