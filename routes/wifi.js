var express = require('express');
var router = express.Router();

var blockUnauthorized = function (req, res, next) {
    if (!req.isAuthenticated()) {
        var err = new Error("Not autorized")
        err.status = 401;
        return next(err);
    }
    next();
};

// single Wifi
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


// all wifis
router.get('/p/wifis', blockUnauthorized, async (req, res, next) => {
    req.wifiRepository.getAllForUser(req.user.id).then((wifis) => {
        res.locals.viewname = "wifis";
        res.locals.wifis = wifis;
        res.render(res.locals.viewname);
    }).catch(next);
});


// API
router.post('/api/wifi/validate', async (req, res) => {
    req.wifiRepository.get(req.body.id)
        .then((wifi) => {
            res.json({ "valid": true });
        })
        .catch((error) => {
            res.json({ "valid": false, "error": error.message });
        });
});

router.post('/api/wifi/add', blockUnauthorized, function (req, res) {
    var newWifi = {
        "id": req.body.id
        , "label": req.body.id
        , "user": req.user.id
    };

    req.wifiRepository.insert(newWifi)
        .then((createdWifi) => {
            res.json({ "newWifi": newWifi });
        })
        .catch((error) => {
            console.error(error);
            res.json({ "error": error.message });
        });
});

router.post('/api/wifi/delete', blockUnauthorized, function (req, res) {
    req.wifiRepository.delete(req.user.id, req.body.id)
        .then((createdWifi) => {
            res.json({ "deleted": true });
        })
        .catch((error) => {
            console.error(error);
            res.json({ "deleted": false, "error": error.message });
        });
});

/*
router.post('/p/wifis/add', blockUnauthorized, async (req, res, next) => {
    req.wifiRepository.insert({
        "id": "test",
        "label": "TesT"
    });

    res.redirect(302, '/p/wifis');
});
*/

module.exports = router;