// https://github.com/jaredhanson/passport-local
module.exports = function (passport, router) {
    var LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(
        function (username, password, done) {
            var user = { id: "local", displayName: username, email: 'dummy@example.com', provider: 'local' };
            return done(null, user);
        }
    ));

    router.post('/p/login/local',
        function (req, res, next) {
            if (req.app.get('env') == "development") {
                next();
            }

            var err = new Error("Not autorized")
            err.status = 401;
            return next(err);
        }
        , passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/p/login',
            failureMessage: true
        })
    );
};