var express = require('express')
    , router = express.Router()
    , i18n = require('i18n')
    ;

i18n.configure({
    locales: ["de", "en", "es", "fr", "it", "ms", "nl", "ru"],
    cookie: 'locale',
    defaultLocale: 'en',
    directory: "./locales",
    queryParameter: 'lang',
    objectNotation: true,
});

router.use(
    i18n.init,
    function (req, res, next) {
        res.locals.translations = i18n.getCatalog(req);

        if (req.cookies && req.cookies.locale) {
            // if (i18n.getLocales.includes(req.cookies.locale)) {
            res.setLocale(req.cookies.locale);
            locale = req.cookies.locale;
            // }
        }

        if (req.query.lang !== undefined) {
            // if (i18n.getLocales.includes(req.query.lang)) {
            res.setLocale(req.query.lang);
            res.cookie('locale', req.query.lang);
            // }
        }

        next();
    }
);

module.exports = router;