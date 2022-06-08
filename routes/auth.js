var express = require('express');

var router = express.Router();

var crypto = require('crypto');
var db = require('../db');
// var LocalStrategy = require('passport-local');
var LocalStrategy = require('passport-local').Strategy;

// http://www.passportjs.org/tutorials/google/redirect/ 
var passport = require('passport');
// var GoogleStrategy = require('passport-google-oidc');


// app.get('/login/federated/google', passport.authenticate('google'));

// https://dmitryrogozhny.com/blog/easy-way-to-debug-passport-authentication-in-express

passport.use(new LocalStrategy(
    // your verification logic goes here
    // this test verification function always succeeds and returns a hard-coded user
    function (username, password, done) {
        console.log("username" + username);
        console.log("password" + password);
        
        console.log("Verification function called");
        return done(null, { username, id: "1" });
    }
));

// https://github.com/jaredhanson/passport-local
/*
passport.use(new LocalStrategy(function verify(username, password, cb) {
    console.log("username" + username);
    console.log("password" + password);

    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }
            return cb(null, row);
        });
    });
}));
*/

/*
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
*/

// serialize user object
passport.serializeUser(function (user, done) {
    done(null, user);
  });
  
  // deserialize user object
  passport.deserializeUser(function (user, done) {
    done(err, user);
  });


router.get('/p/login', function (req, res, next) {
    console.log("from session: " + req.session.test);
    req.session.test = "Hallo";

    res.data.pagename = "Homepage";
    res.data.viewname = "Login";
    res.data.user = req.user;

    res.render(res.data.viewname, res.data);
});

/*

router.post('/p/login', function(req, res, next) {
    res.data.pagename = "Homepage";
    res.data.viewname = "Login";
    res.data.user = req.user;
    
    res.render(res.data.viewname, res.data);
});
*/

router.post('/p/login', function (req, res, next) {
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
    function (req, res) {
        res.status(200).send('logged in!');
    }
);

/*passport.authenticate('local'), 
function (req, res) {
    res.status(200).send('logged in!');
}*/
/*{
    successRedirect: '/',
    failureRedirect: '/p/login',
    failureMessage: true
}*/


router.use(passport.initialize());
router.use(passport.session());


module.exports = router;