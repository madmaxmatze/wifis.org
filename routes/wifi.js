var express = require('express');
var router = express.Router();


router.get('/:wifiId', async (req, res) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params.wifiId;

    res.render(res.locals.viewname);
});


router.get('/p/wifis', async (req, res) => {
    res.locals.viewname = "wifis";
    
    if (req.isAuthenticated()) {
        res.locals.user.wifis = {
            "lucy" : {
                label : "LuCy"
            }
        };
    } else {
        res.status(401);
        res.locals.message = "Not autorized";
        res.render('error');
    }

    res.render(res.locals.viewname);
});


module.exports = router;