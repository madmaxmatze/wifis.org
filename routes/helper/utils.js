module.exports = {
    "blockUnauthorized": function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        }
        var err = new Error("Not autorized");
        err.status = 401;
        throw err;
    }
};
