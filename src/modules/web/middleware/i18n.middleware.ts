import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { resolve } from 'path';
import * as i18n from 'i18n';

i18n.configure({
    locales: ["de", "en", "es", "fr", "it", "ms", "nl", "ru"],
    cookie: 'locale',
    defaultLocale: 'en',
    directory: resolve(__dirname, "../locales"),
    queryParameter: 'lang',
    objectNotation: true,
});

@Injectable()
export class I18nMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        i18n.init(req, res);
        res.locals.translations = i18n.getCatalog(req);

        if (req.cookies && req.cookies.locale) {
            // if (i18n.getLocales.includes(req.cookies.locale)) {
            res.setLocale(req.cookies.locale);
            // var locale = req.cookies.locale;
            // }
        }

        if (req.query.lang !== undefined) {
            // if (i18n.getLocales.includes(req.query.lang)) {
            res.setLocale(req.query.lang.toString());
            res.cookie('locale', req.query.lang);
            // }
        }

        next();
    }
}