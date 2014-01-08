var https = require('https');

module.exports = {
    getBookData: function (isbn, userEmail, callback) {
        var book = null;

        https.get('https://www.googleapis.com/books/v1/volumes?q=ISBN+' +
            isbn + '&key=' + sails.config.googleBooksApiKey, function(response) {
            var data = '';

            response.on('data', function(d) {
                data += d;
            });

            response.on('end', function() {
                var body = JSON.parse(data),
                    categories = [];

                if (body.items) {
                    if (body.items[0].volumeInfo.categories) {
                        categories = body.items[0].volumeInfo.categories;
                    }

                    book = {
                        isbn: isbn,
                        title: body.items[0].volumeInfo.title,
                        authors: body.items[0].volumeInfo.authors,
                        categories: categories,
                        user: [userEmail]
                    };

                    callback(undefined, book);
                }

                callback(404, book);
            });
        }).on('error', function(err) {
            callback(err, book);
        });
    }
};
