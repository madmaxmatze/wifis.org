var express = require('express');

var router = express.Router();
var passport = require('passport');

var UsersRepository = require('../models/users');

// var LocalStrategy = require('passport-local');
var LocalStrategy = require('passport-local').Strategy;

// http://www.passportjs.org/tutorials/google/redirect/ : // require('passport-google-oidc');
var GoogleStrategy = require('passport-google-oauth20').Strategy;


var googleCallbackDomain = "https://wifis.mathiasnitzsche.de";
if (process.env['K_REVISION'] == "local") {
    googleCallbackDomain = "https://8080-cs-590268403158-default.cs-europe-west4-bhnf.cloudshell.dev";
}

// GOOGLE ------------------------------------------------------------
passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: googleCallbackDomain + '/oauth2/redirect/google',
    proxy: true,
    passReqToCallback: true,
    scope: ['email'] // not "profile"
}, (req, accessToken, refreshToken, object0, profile, done) => {
    // function verify(issuer, profile, cb) {
    console.log("verify");
    console.log("req" + req);
    console.log("accessToken" + accessToken);
    console.log("refreshToken" + refreshToken);
    console.log("object0" + object0);
    console.log(profile);

    /*
    var "profile" example from Google = {
        id: '101308901782656878176',
        displayName: undefined,
        emails: [{ value: 'mathiasnitzsche@gmail.com', verified: true }],
        photos: [
            {
                value: 'https://lh3.googleusercontent.com/a-/AOh14Gi8wn3F03PSxo5qFmvdQM_Q8H_I9MZWUuZS0tcKxyU=s96-c'
            }
        ],
        provider: 'google',
        _raw: '{\n' +
            '  "sub": "101308901782656878176",\n' +
            '  "picture": "https://lh3.googleusercontent.com/a-/AOh14Gi8wn3F03PSxo5qFmvdQM_Q8H_I9MZWUuZS0tcKxyU\\u003ds96-c",\n' +
            '  "email": "mathiasnitzsche@gmail.com",\n' +
            '  "email_verified": true\n' +
            '}',
        _json: {
            sub: '101308901782656878176',
            picture: 'https://lh3.googleusercontent.com/a-/AOh14Gi8wn3F03PSxo5qFmvdQM_Q8H_I9MZWUuZS0tcKxyU=s96-c',
            email: 'mathiasnitzsche@gmail.com',
            email_verified: true
        }
    };
    */

    // https://www.passportjs.org/reference/normalized-profile/
    var user = {
        "provider": profile.provider,
        "id": profile.id,
        "email": profile._json.email,
        "displayName": profile.displayName,
        "lastLoginDate": new Date(),
        "signupDate": new Date(),
    };

    /* missing
        maxWifis
        cc
        city
    */

   var usersRepository = new UsersRepository(req.db);
   
   usersRepository.upsert(user)
    .then(function(user) {
       done(null, user);
    }).catch(function(error) {
        console.log("Error inserting/updating user:", error);
    });    
}));

router.use(passport.authenticate('session'));





// https://github.com/jaredhanson/passport-local
passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = { id: "local", username: username, provider: 'delete' };
        return done(null, user);
    }
));


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



router.use(passport.initialize());
router.use(passport.session());


router.get('/p/login/federated/google', passport.authenticate('google', {
    scope: ['email']
}));
router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/p/login'
}));


router.get('/p/login', function (req, res, next) {
    res.locals.viewname = "login";
    res.render(res.locals.viewname);
});
router.post('/p/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/p/login',
    // failureMessage: true
}));




// DEBUG from https://dmitryrogozhny.com/blog/easy-way-to-debug-passport-authentication-in-express
/*
router.get('/oauth2/redirect/google',
    function (req, res, next) {
        // call passport authentication passing the "local" strategy name and a callback function
        passport.authenticate('google', function (error, user, info) {
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
        console.log("user:" + req.user);
    }
    next();
});


module.exports = router;