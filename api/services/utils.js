module.exports = {
    setFlash: function (req, type, message) {
        req.session.flash = {
            type: type,
            content: message
        };
    }
};
