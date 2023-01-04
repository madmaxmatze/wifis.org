import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { resolve } from 'path';
import * as hbs from 'hbs';
import * as crypto from 'crypto';
import * as i18n from 'i18n';

hbs.registerHelper('assign', function (varName, varValue, options) {
    if (!options.data.root) {
        options.data.root = {};
    }
    options.data.root[varName] = varValue;
});

hbs.registerHelper('and', function (/* any, any, ..., options */) {
    return [...arguments].slice(0, -1).every(Boolean);
});

hbs.registerHelper('or', function (/* any, any, ..., options */) {
    return [...arguments].slice(0, -1).some(Boolean);
});

hbs.registerHelper('stripScripts', function (param) {
    return param.replace(/(<([^>]+)>)/ig, "");
});

hbs.registerHelper('equals', function (val1: any, val2: any) {
    if (arguments.length < 2) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
    }
    if (typeof val1 == "function") {
        val1 = val1();
    }
    if (typeof val2 == "function") {
        val2 = val2();
    }
    return (val1 == val2);
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

hbs.registerHelper('concat', function (...args: any) {
    if (args.length < 2) {
        throw new Error("At least 2 concat values needed");
    }
    var output = args[0];
    // last item is options
    for (var i = 1; i < args.length - 1; i++) {
        output += args[i];
    }

    return output;
});

hbs.registerHelper('json', function (object: any, _options) {
    return JSON.stringify(object);
});

@Injectable()
export class HbsMiddleware implements NestMiddleware {
    use(request: any, response: Response, next: NextFunction) {
        // pass some variables to templates
        response.locals.translations = i18n.getCatalog(request);
        response.locals.urlWithoutQuery = request.originalUrl.replace(/\?.*/, "").replace(/^\/$/, "");
        response.locals.urlWithoutLangAndQuery = response.locals.urlWithoutQuery.replace(/^\/\w{2}$/, "/").replace(/^\/\w{2}\//, "/").replace(/^\/$/, "");
        if (!response.locals.urlWithoutLangAndQuery || response.locals.urlWithoutQuery != response.locals.urlWithoutLangAndQuery) {
            response.locals.pageId = response.locals.urlWithoutLangAndQuery.substr(1) || "home";
        }
        response.locals.queryReferer = request.query.referer || "";
        response.locals.version = crypto.createHash('md5').update(process.env.K_REVISION || '???').digest('hex').substr(0, 8);
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