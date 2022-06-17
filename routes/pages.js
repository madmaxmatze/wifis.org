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

module.exports = router;