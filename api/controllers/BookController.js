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
var GoogleBookApi = require('../services/GoogleBookApi');
var utils = require('../services/utils');

module.exports = {
    index: function(req, res) {
        res.redirect('/user/library');
    },

    create: function(req, res) {
        var userEmail = req.session.User.email;

        if (req.param('isbn').length === 0) {
            utils.setFlash(req, 'alert-danger', res.i18n('Field can\'t be blank.'));

            return res.json(req.session.flash);
        }

        Book.findOne({
            isbn: req.param('isbn')
        }).done(function(err, book) {
            if (err) {
                utils.setFlash(req, 'alert-danger', err);

                return res.json(req.session.flash);
            }

            if (!book) {
                GoogleBookApi.getBookData(req.param('isbn'), req.session.User.email, function (err, newBook) {
                    if (err) {
                        if (err === 404) {
                            utils.setFlash(req, 'alert-danger', res.i18n('Book not found.'));
                        } else {
                            utils.setFlash(req, 'alert-danger', err);
                        }

                        return res.redirect('/user/library');
                    }

                    Book.create(newBook).done(function(error) {
                        if (error) {
                            utils.setFlash(req, 'alert-danger', error);
                            return res.redirect('/user/library');
                        }

                        utils.setFlash(req, 'alert-success', res.i18n('Book added to collection.'));
                        return res.redirect('/user/library');
                    });
                });
            }

            utils.setFlash(req, 'alert-info', res.i18n('Book already in collection.'));
            return res.redirect('/user/library');
        });
    },

    destroy: function(req, res) {
        Book.findOne({
            isbn: req.param('isbn'),
            user: req.session.User.email
        }).done(function(err, book) {
            if (err) {
                utils.setFlash(req, 'alert-warning', err);

                return res.redirect('/user/library');
            }

            if (book.user.length > 1) {
                book.removeUser(req.session.User.email, function (err) {
                    if (err) {
                        utils.setFlash(req, 'alert-danger', err);

                        return res.redirect('/user/library');
                    }

                    utils.setFlash(req, 'alert-success', res.i18n('Book removed from collection.'));

                    return res.redirect('/user/library');
                });
            } else {
                book.destroy(function(err) {
                    if (err) {
                        utils.setFlash(req, 'alert-danger', err);

                        return res.redirect('/user/library');
                    }
                });

                utils.setFlash(req, 'alert-success', res.i18n('Book removed from collection.'));

                res.redirect('/user/library');
            }
        });
    }
};
