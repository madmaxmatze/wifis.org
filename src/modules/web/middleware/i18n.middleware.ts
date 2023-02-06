import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WifisRedirect } from './wifis.redirect';
import { resolve } from 'path';
import * as i18n from 'i18n';

const LANG_COOKIE = "locale";
export const DEFAULT_LANG = "en";
const LANGUAGES : string[] = ["de", "en", "es", "fr", "it", "ms", "nl", "ru"];
export const LANGUAGES_REGEX : string = LANGUAGES.join("|");

i18n.configure({
    locales: LANGUAGES,
    cookie: LANG_COOKIE,
    retryInDefaultLocale: true,
    defaultLocale: DEFAULT_LANG,
    directory: resolve(__dirname, "../locales"),
    queryParameter: 'lang',
    objectNotation: true,
});

@Injectable()
export class I18nMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction) {
        i18n.init(request, response);
        
        // try to take lang from cookie, potentially overwrite with url (/de/ or ?lang=de)
        var lang = WifisRedirect.getLang(request?.cookies?.locale, request.originalUrl);
        if (lang && lang != response.getLocale()) {
            response.setLocale(lang);
            // TODO: check if this is actually needed, after local has been set on response
            response.cookie(LANG_COOKIE, lang);
        }

        next();
    }
}