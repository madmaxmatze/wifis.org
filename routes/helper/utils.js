module.exports = {
    "blockUnauthorized": function (req, res, next) {
        if (!req.isAuthenticated()) {
            var err = new Error("Not autorized")
            err.status = 401;
            return next(err);
        }
        next();
    }
};
