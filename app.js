require('dotenv').config();

var express = require('express');
var passport = require('passport');
var expressHandlebars = require('express-hbs');
var session = require('express-session');
var cookieParser = require('cookie-parser');
// var SQLiteStore = require('connect-sqlite3')(session);

var url = require('url')

const app = express();
app.use('/assets', express.static('assets'));


var originalURL = function (req, options) {
    options = options || {};
    var app = req.app;
    if (app && app.get && app.get('trust proxy')) {
        options.proxy = true;
    }
    var trustProxy = options.proxy;

    var proto = (req.headers['x-forwarded-proto'] || '').toLowerCase()
        , tls = req.connection.encrypted || (trustProxy && 'https' == proto.split(/\s*,\s*/)[0])
        , host = (trustProxy && req.headers['x-forwarded-host']) || req.headers.host
        , protocol = tls ? 'https' : 'http'
        , path = req.url || '';
    return protocol + '://' + host + path;
};

app.enable('trust proxy');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
    var callbackURL = url.resolve(originalURL(req, { proxy: true }), "/oauth2/redirect/google");
    // console.log(callbackURL);

    var callbackURL1 = url.resolve(originalURL(req, { proxy: true }), "https://8080-cs-590268403158-default.cs-europe-west4-bhnf.cloudshell.dev/oauth2/redirect/google");
   //  console.log(callbackURL1);
    //console.log(process.env);

    // console.log (req);
    process.env.hostname = req.hostname;
    next();
});


// template -------------------------------------------------------------------------
// https://github.com/TryGhost/express-hbs#usage
expressHandlebars.registerHelper('equals', function (lvalue, rvalue) {
    if (arguments.length < 2) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    if (typeof lvalue == "function") {
        lvalue = lvalue();
    }
    if (typeof rvalue == "function") {
        rvalue = rvalue();
    }
    return (lvalue == rvalue);
});
expressHandlebars.registerHelper('replace', function (...args) {
    if (args.length < 3 || args.length % 2 === 0) {
        throw new Exception("replace1: wrong number of arguments : " + JSON.stringify(args));
    }
    var output = args.pop().fn(this);       // last item is options
    for (var i = 0; i < args.length; i += 2) {
        output = output.replace(args[i], args[i + 1]);
    }
    return output;
});
expressHandlebars.registerHelper('concat', function (val1, val2) {
    return val1 + val2;
});
expressHandlebars.registerHelper('json', function (object) {
    return JSON.stringify(object);
});
app.engine('hbs', expressHandlebars.express4({
    partialsDir: __dirname + '/views/partials',
    defaultLayout: __dirname + "/views/layouts/main.hbs",
    partialsDir: __dirname + '/views/partials',
    beautify: true
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


// others -------------------------------------------------------------------------
// https://github.com/passport/todos-express-password/blob/master/app.js
app.use(cookieParser());
app.use(session({
    secret: "session_demo",
    resave: true,
    saveUninitialized: true,   // don't create session until something stored
    // cookie: { maxAge: 60000 },
    // store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
}));


app.use(function (req, res, next) {
    const Firestore = require('@google-cloud/firestore');
    // https://googleapis.dev/nodejs/firestore/latest/Firestore.html#Firestore
    var db = new Firestore({
        projectId: 'node-test-351811',
        keyFilename: 'node-test-firestore.json',
        ignoreUndefinedProperties: true
    });

    db.settings({ ignoreUndefinedProperties: true })
    
    req.db = db;
    next();
});


var localeRouter = require('./routes/locale');
app.use('/', localeRouter);
var authRouter = require('./routes/auth');
app.use('/', authRouter);
var wifiRouter = require('./routes/wifi');
app.use('/', wifiRouter);
var indexRouter = require('./routes/index');
app.use('/', indexRouter);




const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(
        "App Started - Requests on " + PORT + " - " + (new Date()).toString()
    );
});