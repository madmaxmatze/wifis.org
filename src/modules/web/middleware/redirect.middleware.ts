import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Central class to fix all kinds of redirect - CAREFUL WITH CHANGES!
 */
@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction) {
        var redirect = this.calculateRedirect({
            originalUrl: request.originalUrl,
            lang: request.getLocale()
        });

        if (redirect.url != redirect.originalUrl) {
            console.log(`${redirect.status} REDIRECT (type:'${redirect.type || "general"}') from '${redirect.originalUrl}' to '${redirect.url}'`);
            return response.redirect(redirect.status, redirect.url);
        }

        next();
    }

    protected calculateRedirect(options: any) {
        var redirect = {
            ...{
                url: options.originalUrl || options.url,
                originalUrl: options.originalUrl || options.url,
                status: 301,
                type: '',
                count: 0,
            }, ...options
        };

        // pages can force a redirect (needs to start with "/" to prevent fishing attacks by changing domain)
        /*
        if (redirect.url.match(/redirectUrl\=/) request.query.redirectUrl !== undefined && request.query.redirectUrl.toString().startsWith("/")) {
            return this.redirect(request, response, "?redirectUrl=", 302, request.query.redirectUrl.toString());
        }
        */

        // fix old subdomains and path structure
        redirect.url = redirect.url
            .replace(/^\/(s|m|api|static|www)\//g, "/")      // old mobile subdomain (301 redirected via cloudflare )
            .replace(/^\/p\/(about|faq|press|tos|languages|login)/g, "/" + redirect.lang + "/$1/");

        // force /cc for all non english language homepages
        if (redirect.url.length <= 1 && redirect.lang != "en") {
            redirect.type += " > /CC-Homepage";
            redirect.status = 302;    // 302 because based on session specific language param
            redirect.url = "/" + redirect.lang;
        }

        // "/en" is used to change languge to english on homepage, but afterwards redirect back to plain "/"
        if (redirect.url == "/en" && redirect.lang == "en") {
            redirect.type += " > /EN-Homepage";
            redirect.status = 302;   // 302 because this redirect is needed to properly change language; caching in client needs to be prevented
            redirect.url = "/";
        }

        // in case ?lang was used for wifi page, change redirect to 302
        if (redirect.url.match(/lang\=/)) {
            redirect.url = redirect.url.replace(/lang\=(\w{2}).lang\=\w{2}/g, "lang\=$1");          // merge multiple lang params           
            redirect.type += " > ?lang";
            if (redirect.url.match(/^\/[a-z]{2}\//)) {
                redirect.url = redirect.url.replace(/lang\=\w{2}/g, "");          // remove lang param
            }
        }    

        // cleanup        
        var cleanupUrl = redirect.url
            .replace(/\/+/g, "/")                   // replace multiple "/" by one
            .replace(/[\&]+/ig, "&")                // replace multiple "&" with one
            .replace(/[\?]+/ig, "?")                // replace multiple "?" with one
            .replace(/(.+?)\/\?/ig, "$1?")          // replace "/?" with "?"
            .replace(/\?\&/ig, "?")                 // replace "?&" with "?"
            .replace(/[\&\?]+$/ig, "")              // cut of tailing "?"
            .replace(/(.+?)\/*$/ig, "$1")           // cut of tailing "/" if not en homepage "/"
        ;
        if (cleanupUrl != redirect.url) {
            redirect.type += " > cleanup";
            redirect.url = cleanupUrl;
        }

        // check for redirect loops
        if ((options.url || options.originalUrl) != redirect.url && redirect.count <= 10) {
            redirect.count++;
            redirect = this.calculateRedirect(redirect);
        }

        return redirect;
    }
}