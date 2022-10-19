module.exports = function (passport, router) {
    // http://www.passportjs.org/tutorials/google/redirect/ : // require('passport-google-oidc');
    var GoogleStrategy = require('passport-google-oauth20').Strategy;

    var callbackDomain = process.env['DOMAIN_' + (process.env.NODE_ENV || "development").toUpperCase()];

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://" + callbackDomain + "/p/login/google/redirect",
        proxy: true,
        passReqToCallback: true,
        scope: ['email'] // not "profile"
    }, (req, accessToken, refreshToken, object0, profile, done) => {
        // function verify(issuer, profile, cb) {
        /*
        console.log("verify");
        console.log("req", req);
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("object0", object0);
        console.log("profile", profile);
        console.log("done", done);
        */

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
            "id": profile.provider + profile.id,
            "provider": profile.provider,
            "providerId": profile.id,
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

        req.userRepository.upsert(user)
            .then(function (user) {
                done(null, user);
            }).catch(function (error) {
                console.log("Error inserting/updating user:", error);
                return done(error);
            });
    }));

    router.get('/p/login/google', passport.authenticate('google', {
        scope: ['email']
    }));

    router.get('/p/login/google/redirect', passport.authenticate('google', {
        successRedirect: '/p/wifis',
        failureRedirect: '/p/login',
        // failureMessage: true
    }));
};






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
