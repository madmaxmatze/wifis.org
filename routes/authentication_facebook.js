module.exports = function (passport, router) {
    // http://www.passportjs.org/packages/passport-facebook/
    var FacebookStrategy = require('passport-facebook').Strategy;

    var callbackDomain = process.env['DOMAIN_' + (process.env.NODE_ENV || "development").toUpperCase()];

    passport.use(new FacebookStrategy({
        // app see https://developers.facebook.com/apps
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "https://" + callbackDomain + "/p/login/facebook/redirect",
        profileFields: ['id', 'displayName', 'email'],
        enableProof: true,
        passReqToCallback: true,
    },
        function (req, accessToken, refreshToken, profile, done) {
            var user = {
                "id": profile.provider + profile.id,
                "provider": profile.provider,
                "providerId": profile.id,
                "email": profile._json.email,
                "displayName": profile.displayName,
                "lastLoginDate": new Date(),
                "signupDate": new Date(),
            };

            req.userRepository.upsert(user)
                .then(function (user) {
                    done(null, user);
                }).catch(function (error) {
                    console.log("Error inserting/updating user:", error);
                    return done(error);
                });
        }
    ));

    router.get('/p/login/facebook', passport.authenticate('facebook', {
        scope: ["email"]
    }));

    // auth/facebook/callback
    router.get('/p/login/facebook/redirect', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/p/login',
    }));
};
