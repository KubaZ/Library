/**
 * Book
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
    schema: true,

    attributes: {
        title: {
            type: 'string',
            required: true
        },

        authors: {
            type: 'array',
            required: true
        },

        isbn: {
            type: 'string',
            required: true
        },

        categories: {
            type: 'array'
        },

        user: {
            type: 'array',
            required: true
        }
    }
};
