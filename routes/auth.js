var express = require('express');

var router = express.Router();

// var LocalStrategy = require('passport-local');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
// http://www.passportjs.org/tutorials/google/redirect/ 
// var GoogleStrategy = require('passport-google-oidc');


router.use(passport.authenticate('session'));


// app.get('/login/federated/google', passport.authenticate('google'));


// https://github.com/jaredhanson/passport-local
passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = {id: "2", username : username, provider : 'delete'};
        return done(null, user);
    }
));


passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username, provider: user.provider });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


router.use(passport.initialize());
router.use(passport.session());


router.get('/p/login', function (req, res, next) {
    // console.log("from session: " + req.session.test);
    // req.session.test = "Hallo";
    
    res.locals.viewname = "login";
    res.render(res.locals.viewname);
});


/*
// DEBUG from https://dmitryrogozhny.com/blog/easy-way-to-debug-passport-authentication-in-express
router.post('/p/login',
    function (req, res, next) {
        // call passport authentication passing the "local" strategy name and a callback function
        passport.authenticate('local', function (error, user, info) {
            // this will execute in any case, even if a passport strategy will find an error
            // log everything to console
            console.log("request");
            console.log(req.params);
            //        console.log(res);

            console.log(error);
            console.log(user);
            console.log(info);

            if (error) {
                res.status(401).send(error);
            } else if (!user) {
                res.status(401).send(info);
            } else {
                next();
            }

            // res.status(401).send(info);
        })(req, res);
    },

    // function to call once successfully authenticated
    function (req, res, next) {
        next();
    }
);
*/


router.post('/p/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/p/login',
    // failureMessage: true
}));

router.get('/p/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


router.use(function (req, res, next) {
    //if (req.isAuthenticated()) {
    res.locals.user = req.user;
    console.log (req.user);
    //}
    next();
});


module.exports = router;