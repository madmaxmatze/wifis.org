// https://googleapis.dev/nodejs/firestore/latest/Firestore.html#Firestore
var Firestore = require('@google-cloud/firestore')
    , WifiRepository = require('../../models/wifiRepo')
    , UserRepository = require('../../models/userRepo');

module.exports = function (req, res, next) {
    req.db = new Firestore({
        "projectId": process.env['GCP_FIRESTORE_PROJECT_ID'],
        "credentials": {
            "client_email" : process.env['GCP_FIRESTORE_CLIENT_EMAIL'],
            "private_key" : process.env['GCP_FIRESTORE_PRIVATE_KEY']
        },
        // keyFilename: 'node-test-firestore.json',
        "ignoreUndefinedProperties": true
    });
    req.wifiRepository = new WifiRepository(req.db);
    req.userRepository = new UserRepository(req.db);
    next();
}
