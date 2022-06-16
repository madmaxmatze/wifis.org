var express = require('express')
    , router = express.Router();

router.get('/', async (req, res) => {
    res.locals.viewname = "home";
    res.render(res.locals.viewname);
});

router.get('/p/:cms_id', async (req, res) => {
    res.locals.viewname = req.params.cms_id;
    if (["faq", "about", "tos", "press"].includes(req.params.cms_id)) {
        res.locals.cms_id = req.params.cms_id;
    }

    res.render(res.locals.viewname);
});

// catch 404 and forward to error handler
router.use(function (req, res, next) {
    var err = new Error("Not found")
    err.status = 404;
    return next(err);
});

// error handler
router.use((err, req, res, next) => {
    /*
    if (res.headersSent) {
        return next(err);
    }
    */
    console.log("Error handler: " + err);
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.locals.layout = false;
    if (!err.status) {
        err.status = 500;
    }
    res.status(err.status);
    res.render("layouts/main");
});

module.exports = router;