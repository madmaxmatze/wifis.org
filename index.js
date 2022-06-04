// const Firestore = require('@google-cloud/firestore');
// const { readFileSync } = require('fs');

var express = require('express');
const app = express();
app.use('/assets', express.static('assets'));

var hbs = require('express-hbs');


hbs.registerHelper('equals', function (lvalue, rvalue) {
    if (arguments.length < 2) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    return (lvalue === rvalue);
});

hbs.registerHelper('concat', function(string1, string2) {
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


app.get('(.*)\?lang=(\w{2})', async (req, res) => {
    
    console.log (res);
    res.render('home', data);
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

        data.locale = i18n.getLocale();
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




app.get('/p/:pagename', async (req, res) => {
    data.locale = i18n.getLocale();
    
    data.viewname = "MorePages";
    data.pagename = req.params.pagename;
    
    res.render(data.viewname, data);
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(
        `Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`
    );
});
