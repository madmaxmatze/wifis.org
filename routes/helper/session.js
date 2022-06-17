var session = require('express-session');

module.exports = session({
    secret: "session_demo",
    resave: true,
    saveUninitialized: true,   // don't create session until something stored
    cookie: { maxAge: (24 * 60 * 60 * 1000) },
    // store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
});