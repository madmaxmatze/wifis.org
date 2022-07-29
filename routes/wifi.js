var express = require('express')
    , router = express.Router()
    , utils = require('./helper/utils')
    , MessageService = require('../services/messageService')
    , messageService = new MessageService()

    // https://github.com/pdupavillon/express-recaptcha
    , Recaptcha = require('express-recaptcha').RecaptchaV3
    , recaptcha = new Recaptcha(process.env['RECAPTCHA_SITE_KEY'], process.env['RECAPTCHA_SECRET_KEY'], { callback: 'cb' });


const SINGLE_WIFI_PAGE = /^\/([\w\-]{3,})(.*)/;

/*
 * Single Wifi Page
 * In any case load wifi and redirect if needed
 */
router.all(SINGLE_WIFI_PAGE, async (req, res, next) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params['0'];
    res.locals.wifiIdSuffix = req.params['1'];

    req.wifiRepository.get(res.locals.wifiId)
        .then((wifi) => {
            if (wifi && wifi.label != res.locals.wifiId) {
                res.redirect('/' + wifi.label);
            }
            res.locals.wifi = wifi;
            next();
        })
        .catch((error) => {
            res.locals.error = error;
            res.render(res.locals.viewname);
        });
});


/**
 * Single Wifi Page
 * plain get --> Render
 */
router.get(SINGLE_WIFI_PAGE, recaptcha.middleware.render, async (req, res) => {
    res.locals.captcha = res.recaptcha;
    res.render(res.locals.viewname);
});

/**
 * Single Wifi Page
 * POST --> Handle response
 */
router.post(SINGLE_WIFI_PAGE, recaptcha.middleware.verify, async (req, res, next) => {
    console.log("req.recaptcha", req.recaptcha);
    if (req.recaptcha.error) {
        var err = new Error("Recapttcha error: " + req.recaptcha.error);
        err.status = 401;
        next(err);
    } else {
        // load user
        if (!res.locals.wifi || !res.locals.wifi.user) {
            throw new Error("Invalid Wifi");
        }
        
        // https://zellwk.com/blog/async-await-express/
        var wifiOwner = await req.userRepository.get(res.locals.wifi.user);
        console.log ("wifiOwner", wifiOwner);
        if (!wifiOwner) {
            throw new Error("Unknown Wifi owner");
        }

        if (!req.body.email || !req.body.text) {
            throw new Error("Form data missing");
        }

        messageService
        .sendMessage({
            receiver_mail: wifiOwner.email,
            receiver_name: wifiOwner.name,
            sender_contact: req.body.email,
            sender_text: req.body.text
        })
            .then((result) => {
                console.log("messageService success", result)
            })
            .catch((err) => {
                console.log("messageService error", err)
            }).finally(() => {
                res.render(res.locals.viewname);
            });
    }
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

/* to be added later for non javascript
router.post('/p/wifis/add', utils.blockUnauthorized, async (req, res, next) => {
    req.wifiRepository.insert({
        "id": "test",
        "label": "TesT"
    });

    res.redirect(302, '/p/wifis');
});
*/

module.exports = router;