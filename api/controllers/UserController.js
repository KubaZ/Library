/**
 * UserController
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

module.exports = {
    register: function(req, res) {
        res.view();
    },

    create: function(req, res) {
        if (req.params.all().length < 1) {
            return res.redirect('/user/register');
        }

        User.create(req.params.all(), function userCreated(err) {
            if (err) {
                req.session.flash = {
                    type: 'alert-danger',
                    content: err
                };

                return res.redirect('/user/register');
            }

            return res.redirect('/login');
        });
    },

    library: function(req, res) {
        Book.find({
            user: req.session.User.email
        }).done(function(err, books) {
            if (err) {
                req.session.flash = {
                    type: 'alert-warning',
                    content: err
                };
            }

            res.locals.books = books;

            res.view();
        });
    },
};
