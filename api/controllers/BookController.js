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
    index: function(req, res) {
        res.redirect('/user/library');
    },

    create: function(req, res) {
        if (req.param('isbn').length === 0) {
            req.session.flash = {
                type: 'alert-danger',
                content: [{
                    name: res.i18n('Field can\'t be blank.')
                }]
            };
            return res.redirect('/user/library');
        }

        Book.findOne({
            isbn: req.param('isbn')
        }).done(function(err, book) {
            if (err) {
                req.session.flash = {
                    type: 'alert-danger',
                    content: err
                };
                return res.redirect('/user/library');
            }

            if (!book) {
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
                                }).done(function(err) {
                                    if (err) {
                                        req.session.flash = {
                                            type: 'alert-danger',
                                            content: err
                                        };

                                        return res.redirect('/user/library');
                                    }

                                    req.session.flash = {
                                        type: 'alert-success',
                                        content: [{
                                            message: res.i18n('Book added to collection.')
                                        }]
                                    };
                                    return res.redirect('/user/library');
                                });
                            } else {
                                req.session.flash = {
                                    type: 'alert-danger',
                                    content: [{
                                        message: res.i18n('Book not found.')
                                    }]
                                };

                                return res.redirect('/user/library');
                            }
                        });
                    }).on('error', function(err) {
                    req.session.flash = {
                        type: 'alert-danger',
                        content: [{
                            message: err
                        }]
                    };

                    return res.redirect('/user/library');
                });
            } else {
                if (_.indexOf(book.user, req.session.User.email) === -1) {
                    book.user.push(req.session.User.email);
                    book.save(function(err) {
                        if (err) {
                            req.session.flash = {
                                type: 'alert-danger',
                                content: err
                            };

                            return res.redirect('/user/library');
                        }

                        req.session.flash = {
                            type: 'alert-success',
                            content: [{
                                message: res.i18n('Book added to collection.')
                            }]
                        };

                        return res.redirect('/user/library');
                    });
                } else {
                    req.session.flash = {
                        type: 'alert-info',
                        content: [{
                            message: res.i18n('Book already in collection.')
                        }]
                    };

                    return res.redirect('/user/library');
                }
            }
        });
    },

    destroy: function(req, res) {
        Book.findOne({
            isbn: req.param('isbn'),
            user: req.session.User.email
        }).done(function(err, book) {
            if (err) {
                req.session.flash = {
                    type: 'alert-warning',
                    content: err
                };
                return res.redirect('/user/library');
            }

            if (book.user.length > 1) {
                book.user = _.without(book.user, req.session.User.email);
                book.save(function(err) {
                    if (err) {
                        req.session.flash = {
                            type: 'alert-danger',
                            content: err
                        };

                        return res.redirect('/user/library');
                    }

                    req.session.flash = {
                        type: 'alert-success',
                        content: [{
                            message: res.i18n('Book removed from collection.')
                        }]
                    };

                    return res.redirect('/user/library');
                });
            } else {
                book.destroy(function(err) {
                    if (err) {
                        req.session.flash = {
                            type: 'alert-danger',
                            content: err
                        };

                        return res.redirect('/user/library');
                    }
                });

                req.session.flash = {
                    type: 'alert-success',
                    content: [{
                        message: res.i18n('Book removed from collection.')
                    }]
                };

                res.redirect('/user/library');
            }
        });
    }
};
