// https://github.com/TryGhost/express-hbs#usage
var expressHandlebars = require('express-hbs');

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

module.exports = function (req, res, next) {
    res.app
        .engine('hbs', expressHandlebars.express4({
            partialsDir: __dirname + '/../../views/partials'
            , defaultLayout: __dirname + "/../../views/layouts/main.hbs"
            , partialsDir: __dirname + '/../../views/partials'
            , beautify: true
        }))
        .set('view engine', 'hbs')
        .set('views', __dirname + '/../../views');
    next();
}