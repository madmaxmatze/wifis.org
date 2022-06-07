// const Firestore = require('@google-cloud/firestore');
// const { readFileSync } = require('fs');


var express = require('express');
const app = express();
app.use('/assets', express.static('assets'));


var LocalStrategy = require('passport-local');

// var router = express.Router();



var hbs = require('express-hbs');
hbs.registerHelper('equals', function (lvalue, rvalue) {
    if (arguments.length < 2) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    return (lvalue === rvalue);
});

hbs.registerHelper('concat', function (string1, string2) {
    return string1 + string2;
});



// https://github.com/TryGhost/express-hbs#usage
app.engine('hbs', hbs.express4({
    // partialsDir: __dirname + '/views/partials'
    defaultLayout: "./views/layouts/main.hbs",
    beautify: true
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');





var session = require('express-session');
// var SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
    secret: "session_demo",
    // resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
    //     store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' }),
}));


var cookieParser = require('cookie-parser');
app.use(cookieParser());


var i18n = require('i18n');
// minimal config
i18n.configure({
    locales: ["de", "en", "es", "fr", "it", "ms", "nl", "ru"],
    cookie: 'locale',
    defaultLocale: 'en',
    directory: "./locales",
    queryParameter: 'lang',
    objectNotation: true,
});

// init i18n module
app.use(i18n.init);



// http://www.passportjs.org/tutorials/google/redirect/ 
var passport = require('passport');
// var GoogleStrategy = require('passport-google-oidc');


// app.get('/login/federated/google', passport.authenticate('google'));
console.log ("test");

passport.use(new LocalStrategy({}, function verify(username, password, doneCallback) {
    console.log ("username" + username);
    console.log ("password" + password);
    
    doneCallback(null, { id: "123", username: "mathias" });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});






/*
app.locals.data = {
  site: 'Example'
};
*/

// The HTML content is produced by rendering a handlebars template.
// The template values are stored in global state for reuse.
const data = {
    service: process.env.K_SERVICE || '???',
    revision: process.env.K_REVISION || '???',
    title: 'Home',
    name: 'world',
    locale: i18n.getLocale(),
    languages: i18n.getLocales(),
};
let template;


/*
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }
*/



/*
app.use(function (req, res, next) {
    res.getLocale(),
    next();
});
*/


// lang middleware
app.use(function (req, res, next) {
    data.locale = "en";

    if (req.cookies.locale) {
        data.locale = req.cookies.locale;
    }

    if (req.query.lang !== undefined) {
        data.locale = req.query.lang;
        res.cookie('locale', req.query.lang);
    }

    next();
});



app.get('/', async (req, res) => {
    // The handlebars template is stored in global state so this will only once.
    /*
    if (!template) {
        // Load Handlebars template from filesystem and compile for use.
        try {

            template = handlebars.compile(readFileSync('index.html.hbs', 'utf8'));
        } catch (e) {
            console.error(e);
            res.status(500).send('Internal Server Error');
        }
    }
    */


    // Apply the template to the parameters to generate an HTML string.
    try {
        /*
        const db = new Firestore({
            projectId: 'node-test-351811',
            keyFilename: 'node-test-firestore.json',
        });
    
        var promise = deleteCollection(db, 'users', 500);

        promise.finally(() => {
            console.log("users collection deleted");

            for (var i = 0; i<100; i++) {
                var rand = Math.random();
                const docRef = db.collection('users').doc('mathias' + rand);
            
                docRef.set({
                    first: 'Mathias' + rand,
                    last: 'Nitzsche',
                    born: 1983 + rand
                });
            }
            console.log("100 users created");
        });
        */



        data.pagename = "Homepage";
        data.viewname = "Homepage";
        res.render(data.viewname, data);

        // const output = template(data);
        // res.status(200).send(output);
    } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
    }
});

/* change lang
app.get('/p/:pagename', async (req, res) => {
// res.cookie('locale', 'en', { maxAge: 900000, httpOnly: true })
});
*/


app.get('/p/login', function (req, res, next) {
    //console.log(req);
    //console.log(res);

    data.pagename = "Homepage";
    data.viewname = "Login";
    data.user = req.user;
    
    res.render(data.viewname, data);
});


app.post('/p/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/p/login'
}));


app.use(passport.authenticate('session'));


app.get('/p/:pagename', async (req, res) => {
    data.viewname = "MorePages";
    data.pagename = req.params.pagename;

    res.render(data.viewname, data);
});


// module.exports = router;


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(
        `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
    );
});


