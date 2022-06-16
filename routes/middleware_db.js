// https://googleapis.dev/nodejs/firestore/latest/Firestore.html#Firestore
var Firestore = require('@google-cloud/firestore');

module.exports = function (req, res, next) {
    req.db = new Firestore({
        projectId: 'node-test-351811',
        keyFilename: 'node-test-firestore.json',
        ignoreUndefinedProperties: true
    });
    next();
}
