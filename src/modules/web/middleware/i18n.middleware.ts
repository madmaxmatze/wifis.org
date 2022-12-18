import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
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
    use(request: Request, response: Response, next: NextFunction) {
        i18n.init(request, response);
        response.locals.translations = i18n.getCatalog(request);

        // take language from cookie, if valid
        if (request.cookies
            && request.cookies.locale 
            && i18n.getLocales().includes(request.cookies.locale)) {
            response.setLocale(request.cookies.locale);
        }

        if (request.query.lang !== undefined) {
            var lang = request.query.lang.toString();
            if (i18n.getLocales().includes(lang)) {
                response.setLocale(request.query.lang.toString());
                response.cookie('locale', request.query.lang);
            }
        }

        // any url with a lang path inside
        var matches = request.baseUrl.match(/^\/([a-z]{2})(\/.+)*$/);
        if (matches) {
            var lang = matches[1];
            if (!i18n.getLocales().includes(lang)) {
                throw new NotFoundException();
            }
            response.setLocale(lang);

            // TODO: check if this is actually needed, after local has been set on response
            response.cookie('locale', lang);
        }

        next();
    }
}