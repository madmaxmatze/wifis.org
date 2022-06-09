var express = require('express');
var router = express.Router();


router.get('/:wifiId', async (req, res) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params.wifiId;

    res.render(res.locals.viewname);
});


module.exports = router;