var express = require('express');

express() // = app
    .use('/assets', express.static('assets'))
    .use(
        express.json()
        , express.urlencoded({ extended: false })
        , require('cookie-parser')()
        , require('./routes/middleware_env')
        , require('./routes/middleware_session')
        , require('./routes/middleware_i18n')
        , require('./routes/middleware_hbs')
        , require('./routes/middleware_db')
        , require('./routes/authentication')
        , require('./routes/wifi')
        , require('./routes/index')
    )
    .listen(process.env.PORT || 8080);