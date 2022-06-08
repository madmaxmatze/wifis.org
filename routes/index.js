var express = require('express');

var router = express.Router();


router.get('/', async (req, res) => {
    try {
        res.data.pagename = "Homepage";
        res.data.viewname = "Homepage";
        res.render(res.data.viewname, res.data);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/p/:pagename', async (req, res) => {
    console.log("MorePages: " + req.params.pagename);

    res.data.viewname = "MorePages";
    res.data.pagename = req.params.pagename;

    res.render(res.data.viewname, res.data);
});



// The HTML content is produced by rendering a handlebars template.
// The template values are stored in global state for reuse.
/*
const data = {
    service: process.env.K_SERVICE || '???',
    revision: process.env.K_REVISION || '???',
    title: 'Home',
    name: 'world',
    locale: i18n.getLocale(),
    languages: i18n.getLocales(),
};
let template;
*/


/*
app.use(function (req, res, next) {
    res.getLocale(),
    next();
});
*/



// catch 404 and forward to error handler
router.use(function (req, res, next) {
    next(createError(404));
});


// error handler
router.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = router;