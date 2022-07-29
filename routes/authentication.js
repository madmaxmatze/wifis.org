var express = require('express')
    , router = express.Router()
    , passport = require('passport');

/**
 * not sure if needed, doesnt work anyway
 */
router.use(function (req, res, next) {
    req.app.enable('trust proxy');
    next();
});

require('./authentication_google')(passport, router);
require('./authentication_facebook')(passport, router);
require('./authentication_local')(passport, router);

passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        done(null, user);
    });
});

passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, user);
    });
});

router.use(
    passport.authenticate('session')
    , passport.initialize()             // connect passport to express
    , passport.session()                // create user object
);

router.get('/p/login', function (req, res, next) {
    res.locals.viewname = "login";
    res.locals.errormessage = req.session.messages;
    res.render(res.locals.viewname);
});

router.get('/p/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

router.use(function (req, res, next) {
    res.locals.user = req.user;
    if (req.isAuthenticated()) {
        res.locals.user.maxWifis = 3;
    }
    next();
});

module.exports = router;