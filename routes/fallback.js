var express = require('express')
    , router = express.Router();

// catch 404 and forward to error handler
/*
router.use(function (req, res, next) {
    var err = new Error("Not found")
    err.status = 404;
    return next(err);
});
*/

// error handler
router.use(function (err, req, res, next) {
    /*
    if (res.headersSent) {
        return next(err);
    }
    */

    console.log("Error handler: " + err);
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // res.locals.layout = false;
    if (!err.status) {
        err.status = 500;
    }
    res.status(err.status);
    res.render("home");
});

module.exports = router;