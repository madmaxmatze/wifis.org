import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { resolve } from 'path';
import * as hbs from 'hbs';

/*
expressHandlebars.registerHelper('viewname_new', function(options) {  
    console.log ("", options);
    return options.data.viewname;
});
*/

hbs.registerHelper('equals', function (lvalue: any, rvalue: any) {
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

hbs.registerHelper('replace', function (...args: any) {
    if (args.length < 3 || args.length % 2 === 0) {
        throw new Error("replace1: wrong number of arguments : " + JSON.stringify(args));
    }
    var output = args.pop().fn(this);       // last item is options
    for (var i = 0; i < args.length; i += 2) {
        output = output.replace(args[i], args[i + 1]);
    }
    return output;
});

hbs.registerHelper('concat', function (val1: any, val2: any) {
    return val1 + val2;
});

hbs.registerHelper('json', function (object: any) {
    return JSON.stringify(object);
});

@Injectable()
export class HbsMiddleware implements NestMiddleware {
    use(request: any, response: Response, next: NextFunction) {
        // pass some variables to templates
        // res.locals.url = req.
        response.locals.query = request.query;
        response.locals.service = process.env.K_SERVICE || '???';
        response.locals.revision = process.env.K_REVISION || '???';
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = request.app.get('env');
        }
        response.locals.env = process.env.NODE_ENV;
        response.locals.user = request.session.user;

        hbs.registerPartials(resolve(__dirname, "../views/partials"));

        request.app
            .set('view engine', 'hbs')
            .set('views', resolve(__dirname, "../views"))
            .set('view options', { layout: "layouts/main.hbs" });

        next();
    }
}