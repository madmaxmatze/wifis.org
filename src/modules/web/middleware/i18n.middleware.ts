import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { resolve } from 'path';
import * as i18n from 'i18n';

const LANGUAGES : string[] = ["de", "en", "es", "fr", "it", "ms", "nl", "ru"];
export const LANGUAGES_REGEX : string = LANGUAGES.join("|");

i18n.configure({
    locales: LANGUAGES,
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
        if (request?.cookies?.locale && i18n.getLocales().includes(request.cookies.locale)) {
            response.setLocale(request.cookies.locale);
        }

        if (request?.query?.lang) {
            var lang = request.query.lang.toString().substr(0, 2);  // handle ?lang=en?lang=de
            if (i18n.getLocales().includes(lang)) {
                response.setLocale(lang);
                response.cookie('locale', lang);
            }
        }

        // any url with a lang path inside
        var pathLangRegex = new RegExp(`^\/(${LANGUAGES_REGEX})(\/.+)*$`);
        var matches = request.baseUrl.match(pathLangRegex);
        if (matches) {
            response.setLocale(matches[1]);
            // TODO: check if this is actually needed, after local has been set on response
            response.cookie('locale', matches[1]);
        }

        next();
    }
}