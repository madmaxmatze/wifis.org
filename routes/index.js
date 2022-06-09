var express = require('express');

var router = express.Router();


router.use(function (req, res, next) {
    res.locals.service = process.env.K_SERVICE || '???';
    res.locals.revision = process.env.K_REVISION || '???';
    next();
});


router.get('/', async (req, res) => {
    try {
        res.locals.viewname = "home";
        res.render(res.locals.viewname);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/p/:cms_id', async (req, res) => {
    res.locals.viewname = "cms";
    res.locals.cms_id = req.params.cms_id;

    res.render(res.locals.viewname);
});


// catch 404 and forward to error handler
router.use(function (req, res, next) {
    next(createError(404));
});


/*
// error handler
router.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.message = err;
    console.log (err);
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
*/

module.exports = router;