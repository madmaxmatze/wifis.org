var express = require('express')
    , router = express.Router()
    , utils = require('./helper/utils')
    ;

/*
 *  API: Validate wifi id
 */
router.post('/api/wifi/exists', async (req, res) => {
    req.wifiRepository.get(req.body.id)
        .then((wifi) => {
            res.json({ "exists": (wifi === null) });
        })
        .catch((error) => {
            res.json({ "exists": false, "error": error.message });
        });
});

/*
 *  API: Create new Wifi
 */
router.post('/api/wifi/add', utils.blockUnauthorized, async (req, res) => {
    var newWifi = {
        "id": req.body.id
        , "label": req.body.id
        , "user": req.user.id
    };

    var userWifis = await req.wifiRepository.getAllForUser(req.user.id);

    if (userWifis.length >= res.locals.user.maxWifis) {
        req.wifiRepository.insert(newWifi)
            .then((createdWifi) => {
                res.json({ "newWifi": newWifi });
            })
            .catch((error) => {
                console.error(error);
                res.json({ "error": error.message });
            });
    } else {
        console.error(userWifis);
        res.json({ "error": "maxWifiCountReached" });
    }
});

/*
 *  API: Delete Wifi
 */
router.post('/api/wifi/delete', utils.blockUnauthorized, function (req, res) {
    req.wifiRepository.delete(req.user.id, req.body.id)
        .then((createdWifi) => {
            res.json({ "deleted": true });
        })
        .catch((error) => {
            console.error(error);
            res.json({ "deleted": false, "error": error.message });
        });
});

module.exports = router;