// const Firestore = require('@google-cloud/firestore');
// const { readFileSync } = require('fs');


var express = require('express');
var passport = require('passport');
var expressHandlebars = require('express-hbs');
var session = require('express-session');
var cookieParser = require('cookie-parser');
// var SQLiteStore = require('connect-sqlite3')(session);

const app = express();
app.use('/assets', express.static('assets'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    console.log ("equals: " + lvalue + " " + rvalue);
    return (lvalue == rvalue);
});
expressHandlebars.registerHelper('replace', function(to_replace, replacement, options) {
    return options.fn(this).replace(to_replace, replacement);
});
expressHandlebars.registerHelper('concat', function (val1, val2) {
    return val1 + val2;
});
expressHandlebars.registerHelper('json', function(object) {
    return JSON.stringify(object);
});
app.engine('hbs', expressHandlebars.express4({
    // partialsDir: __dirname + '/views/partials'
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
    cookie: { maxAge: 60000 },
    // store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
}));

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
