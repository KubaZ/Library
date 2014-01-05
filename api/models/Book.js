/**
 * Book
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var https = require('https');

module.exports = {

  attributes: {
    title: 'string',

    authors: 'array',

    isbn: 'string',

    categories: 'array'
  }
};
