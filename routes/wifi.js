var express = require('express');
var router = express.Router();
var WifisRepository = require('../models/wifis');

router.get('/:wifiId', async (req, res) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params.wifiId;

    res.render(res.locals.viewname);
});


router.all('/api/wifi/validate', async (req, res) => {
    res.json({ "valid": true });
});

router.post('/api/wifi/add', function (req, res, next) {
    if (!req.isAuthenticated()) {
        var err = new Error("Not autorized")
        err.status = 401;
        return next(err);
    }

    var wifisRepository = new WifisRepository(req.db);
    var newWifi = {
        "id": req.body.id
        , "label": req.body.id
        , "user": req.user.id
    };

    wifisRepository.insert(newWifi)
        .then((createdWifi) => {
            res.json({"newWifi": newWifi});
        })
        .catch((error) => {
            next(error);
        });
});

router.all('/p/wifis/add', async (req, res) => {
    var wifisRepository = new WifisRepository(req.db);

    wifisRepository.insert({
        "id": "test",
        "label": "TesT"
    });

    res.redirect(302, '/p/wifis');
});


router.get('/p/wifis', async (req, res, next) => {
    if (!req.isAuthenticated()) {
        var err = new Error("Not autorized");
        err.status = 401;
        next(err);
        return;
    }

    /*
    
    var querySnapshot1 = await req.db.collectionGroup('wifis').where('id', '==', 'test').get();
    querySnapshot1.forEach(queryDocumentSnapshot => {

        console.log(queryDocumentSnapshot.id);
        console.log(queryDocumentSnapshot.data());

        const documentReference = queryDocumentSnapshot.ref; // DocumentReference
        const documentParent = documentReference.parent.parent.id;

        console.log(documentParent);

    });


    var querySnapshot = await wifisRepository.getAll();
    // https://codingshower.com/query-and-fetch-documents-from-sub-collections-in-firebase-firestore/
    querySnapshot.forEach(queryDocumentSnapshot => {

        console.log(queryDocumentSnapshot.id);
        console.log(queryDocumentSnapshot.data());

        const documentReference = queryDocumentSnapshot.ref; // DocumentReference
        const documentParent = documentReference.parent.parent.id;

        console.log(documentParent);

    });

    // documentReference.path - Reference path of this (comment) document
    //
    // documentParent.id - Parent (comment) collection's ID
    // documentParent.path - Path of the parent (comment) collection
    // documentParent.parent (DocumentReference) - Parent (post) document of parent (comment) collection (grand-parent)


    */
    var wifisRepository = new WifisRepository(req.db);

    wifisRepository.getAllForUser(req.user.id).then((querySnapshot) => {
        var wifis = [];
        querySnapshot.forEach(doc => {
            wifis[doc.id] = doc.data();
        });   
        console.log (wifis);
        res.locals.user.wifis = wifis;
        res.locals.viewname = "wifis";
        res.render(res.locals.viewname);    
    }).catch(next);
});


module.exports = router;