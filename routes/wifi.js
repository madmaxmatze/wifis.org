var express = require('express')
    , router = express.Router()
    , utils = require('./helper/utils')
    ;

/*
 *  Single Wifi Page
 */
router.get(/^\/([\w\-]{3,})(.*)/, async (req, res) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params['0'];
    res.locals.wifiIdSuffix = req.params['1'];

    req.wifiRepository.get(res.locals.wifiId)
        .then((wifi) => {
            if (wifi && wifi.label != res.locals.wifiId) {
                res.redirect('/' + wifi.label);
            }
            res.locals.wifi = wifi;
            res.render(res.locals.viewname);
        })
        .catch((error) => {
            res.locals.error = error;
            res.render(res.locals.viewname);
        });
});


/*
 *  All Users Wifis Page
 */
router.get('/p/wifis', utils.blockUnauthorized, async (req, res, next) => {
    req.wifiRepository.getAllForUser(req.user.id).then((wifis) => {
        res.locals.viewname = "wifis";
        res.locals.wifis = wifis;
        res.render(res.locals.viewname);
    }).catch(next);
});

/* to be added later
router.post('/p/wifis/add', utils.blockUnauthorized, async (req, res, next) => {
    req.wifiRepository.insert({
        "id": "test",
        "label": "TesT"
    });

    res.redirect(302, '/p/wifis');
});
*/

module.exports = router;