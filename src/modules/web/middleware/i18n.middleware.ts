import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WifisRedirect } from './wifis.redirect';
import { resolve } from 'path';
import * as i18n from 'i18n';

@Injectable()
export class I18nMiddleware implements NestMiddleware {
    static LANG_COOKIE = "locale";
    static DEFAULT_LANG = "en";
    static LANGUAGES : string[] = ["de", "en", "es", "fr", "it", "ms", "nl", "ru"];

    /*
     * Replace i18n tags like {{__label.title}} which are left in the response HTML
     * That happens in case such a tag is used within the actual lang file
     */
    static tagsReplacement(err: Error, html: string, next: NextFunction, response: Response) {
        if (err) {
            return next(err);
        }
    
        var matches, preventLoop = 5;
        while ((matches = [...html.matchAll(/\{\_\_\s*(.+?)\s*\}/gi)]) && preventLoop-- > 0) {
            matches.forEach(match => {
                var replacement = i18n.__(match[1]);
                if (typeof replacement != "string") {
                    replacement = Array.from(replacement).join(" ");
                }
                html = html.replace(match[0], replacement);
            });
        }
        response.send(html);
    }

    use(request: Request, response: Response, next: NextFunction) {
        i18n.configure({
            locales: I18nMiddleware.LANGUAGES,
            cookie: I18nMiddleware.LANG_COOKIE,
            retryInDefaultLocale: true,
            defaultLocale: I18nMiddleware.DEFAULT_LANG,
            directory: resolve(__dirname, "../locales"),
            queryParameter: 'lang',
            objectNotation: true,
        });

        i18n.init(request, response);

        // try to take lang from cookie, potentially overwrite with url (/de/ or ?lang=de)
        var lang = WifisRedirect.getLang(request?.cookies?.locale, request.originalUrl);
        if (lang && lang != response.getLocale()) {
            response.setLocale(lang);
            // TODO: check if this is actually needed, after local has been set on response
            response.cookie(I18nMiddleware.LANG_COOKIE, lang);
        }

        i18n.setLocale(response.getLocale());
    
        next();
    }
}