var express = require('express');
var router = express.Router();
var WifisRepository = require('../models/wifis');

router.get('/:wifiId', async (req, res) => {
    res.locals.viewname = "wifi";
    res.locals.wifiId = req.params.wifiId;

    res.render(res.locals.viewname);
});


router.all('/ajax/wifis/validate', async (req, res) => {
    res.json({"valid":true});
});   

router.all('/p/wifis/add', async (req, res) => {
    var wifisRepository = new WifisRepository(req.db);

    wifisRepository.insert({
        "id": "test",
        "label" : "TesT"
    });

    res.redirect(302, '/p/wifis');
});   



router.post('/ajax/wifi/add', async (req, res) => {
    
    
    if (req.isAuthenticated()) {
        

        /*
        res.locals.user.wifis = {
            "lucy" : {
                label : "LuCy"
            }
        };
        */
    } else {
        res.send(401);
    }
});

router.get('/p/wifis', async (req, res) => {
    res.locals.viewname = "wifis";


    var wifisRepository = new WifisRepository(req.db);

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