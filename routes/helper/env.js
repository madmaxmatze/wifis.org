require('dotenv').config();

module.exports = function (req, res, next) {
    res.locals.url = req._parsedUrl;   // var url = require('url'); url.parse(req.url, true);
    res.locals.query = req.query;
    res.locals.service = process.env.K_SERVICE || '???';
    res.locals.revision = process.env.K_REVISION || '???';
    res.locals.env = req.app.get('env');        // wrapper for process.env.NODE_ENV, with "development" fallback if undefined
    next();
};