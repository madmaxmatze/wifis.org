var express = require('express');
var i18n = require('i18n');

var router = express.Router();

i18n.configure({
    locales: ["de", "en", "es", "fr", "it", "ms", "nl", "ru"],
    cookie: 'locale',
    defaultLocale: 'en',
    directory: "./locales",
    // extension: '.json',
    queryParameter: 'lang',
    objectNotation: true,
});

router.use(i18n.init);

// lang middleware
router.use(function (req, res, next) {
    if (!res.data) {
        res.data = {};
    }
    res.data.locale = "en";
    res.data.languages = i18n.getLocales();
    if (req.cookies.locale) {
        res.data.locale = req.cookies.locale;
    }

    if (req.query.lang !== undefined) {
        res.data.locale = req.query.lang;
        res.cookie('locale', req.query.lang);
    }

    res.setLocale(res.data.locale);

    next();
});

module.exports = router;