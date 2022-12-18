import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Central class to fix all kinds of redirect - CAREFUL WITH CHANGES!
 */
@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    sanatizeUrl (url : string) {
        return url
            .replace(/\/+/g, "/")           // replace multiple "/" by one
            .replace(/(.+?)\/*$/ig, "$1")   // cut of tailing "/" if not en homepage "/"
            .replace(/\?+$/ig, "");
    }

    redirect(request: Request, response: Response, type: string, redirectStatus: number, redirectUrl : string) {
        redirectUrl = this.sanatizeUrl(redirectUrl);
        console.log (`${redirectStatus} REDIRECT (type:'${type}') from '${request.originalUrl}' to '${redirectUrl}'`);
        return response.redirect(redirectStatus, redirectUrl);
    }
    
    use(request: Request, response: Response, next: NextFunction) {
        // language setting already happened in i18n middleware
        // now lets just get rid of the ?lang=cc param
        if (request.query.lang !== undefined) {
            var redirectUrl = request.originalUrl.replace(/^\/p\/(.*)$/, "/" + request.query.lang + "/$1") || "/";
            var redirectStatus = redirectUrl == request.originalUrl ? 302 : 301;
            redirectUrl = redirectUrl.replace(/lang\=\w{2}/, "");
            return this.redirect(request, response, "lang Param", redirectStatus, redirectUrl);
        }

        if (request.query.redirectUrl !== undefined) {
            return this.redirect(request, response, "redirectUrl Param", 302, request.query.redirectUrl.toString());
        }

        // force /cc for all non english language homepages
        if (request.baseUrl == "" && response.getLocale() != "en") {
            // 302 because based on session specific language param
            return this.redirect(request, response, "/CC Homepage", 302, "/" + response.getLocale());
        }

        // "/en" is used to change languge to english on homepage, 
        // but afterwards redirect back to plain "/"
        if (request.baseUrl == "/en") {
            // 302 because this redirect is needed to properly change language; caching in client needs to be prevented
            return this.redirect(request, response, "/ EN-Homepage", 302, "/");
        }
        
        // handly Lagacy Paths
        if (request.originalUrl) {
            var redirectUrl = request.originalUrl
                .concat("/")                    // add slash for easier regexes (will be fixed at the end)
                .replace("/m/", "/")            // old mobile subdomain
                .replace("/www/", "/")          // old www subdomain
                .replace(/\/p\/(about|faq|press|tos|languages|login)$/g, "/en/$1");  // old /p/ url for pages
            redirectUrl = this.sanatizeUrl(redirectUrl);

            if (redirectUrl != request.originalUrl) {
                return this.redirect(request, response, "Lagacy Paths", 301, redirectUrl);
            }
        }

        next();
    }
}

