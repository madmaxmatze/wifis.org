var express = require('express');
require('express-async-errors');

express() // = app
    .use('/assets', express.static('assets'))
    .use(
        express.json()
        , express.urlencoded({ extended: false })
        , require('cookie-parser')()
        , require('./routes/helper/env')
        , require('./routes/helper/session')
        , require('./routes/helper/i18n')
        , require('./routes/helper/hbs')
        , require('./routes/helper/db')
        , require('./routes/authentication')
        , require('./routes/api')
        , require('./routes/wifi')
        , require('./routes/pages')
        , require('./routes/fallback')
    )
    .listen(process.env.PORT || 8080);