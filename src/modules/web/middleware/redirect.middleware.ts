import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { json } from 'stream/consumers';

/**
 * Central class to fix all kinds of redirect - CAREFUL WITH CHANGES!
 */
@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction) {
        this.runTest();

        var redirectObj = this.calculateRedirect({
            originalUrl: request.originalUrl,
            lang: request.getLocale()
        });

        if (redirectObj.url != redirectObj.originalUrl) {
            console.log(`${redirectObj.status} REDIRECT (type:'${redirectObj.type || "general"}') from '${redirectObj.originalUrl}' to '${redirectObj.url}'`);
            return response.redirect(redirectObj.status, redirectObj.url);
        }

        next();
    }

    calculateRedirect(options: any) {
        var redirect = {
            ...{
                url: options.originalUrl,
                status: 301,
                type: 'general',
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
            redirect.type = "/CC-Homepage";
            redirect.status = 302;    // 302 because based on session specific language param
            redirect.url = "/" + redirect.lang;
        }

        // "/en" is used to change languge to english on homepage, but afterwards redirect back to plain "/"
        if (redirect.url == "/en" && redirect.lang == "en") {
            redirect.type = "/EN-Homepage";
            redirect.status = 302;   // 302 because this redirect is needed to properly change language; caching in client needs to be prevented
            redirect.url = "/";
        }

        // in case ?lang was used for wifi page, change redirect to 302
        if (redirect.url.match(/lang\=/) && !redirect.url.match(/^\/[a-z]{2}\//) && !redirect.url.match(/^\/p\//)) {
            redirect.type = "?lang";
            redirect.status = 302;
        }

        // cleanup
        redirect.url = redirect.url
            .replace(/lang\=\w{2}/g, "")                    // remove lang param
            // .concat("/")                                 // add slash for easier regexes (will be fixed at the end)
            .replace(/\/+/g, "/")                           // replace multiple "/" by one
            .replace(/[\&]+/ig, "&")                        // replace multiple "&" with one
            .replace(/[\?]+/ig, "?")                        // replace multiple "?" with one
            .replace(/\/\?/ig, "?")                         // replace "/?" with "?"
            .replace(/\?\&/ig, "?")                         // replace "?&" with "?"
            .replace(/[\&\?]+$/ig, "")                      // cut of tailing "?"
            .replace(/(.+?)\/*$/ig, "$1")                   // cut of tailing "/" if not en homepage "/"
            ;

        if (options.url != redirect.url) {
            if (redirect.count++ == 5) {
                throw new Error("redirect loop for " + redirect.toString());
            }
            redirect = this.calculateRedirect(redirect);
        }

        return redirect;
    }

    // TODO: move to proper nest.js test
    runTest() {
        var testCases = [
            {
                input: { url: "/www/", lang: "fr" },
                expected: { url: "/fr", status: 302, count: 1 }
            },
            {
                input: { url: "/www/", lang: "en" },
                expected: { url: "/", status: 301, count: 1 }
            },
            {
                input: { url: "/", lang: "fr" },
                expected: { url: "/fr", status: 302, count: 1 }
            },
            {
                input: { url: "/p/about", lang: "fr" },
                expected: { url: "/fr/about", status: 301, count: 1 }
            },
            {
                input: { url: "/www/p/about?lang=fr", lang: "fr" },
                expected: { url: "/fr/about", status: 301, count: 1 }
            },
            {
                input: { url: "/www/p/about?lang=xx", lang: "fr" },
                expected: { url: "/fr/about", status: 301, count: 1 }
            },
            {
                input: { url: "/www/wifiname?lang=xx", lang: "fr" },
                expected: { url: "/wifiname", status: 302, count: 1 }
            },
            {
                input: { url: "/static/p/faq?lang=xx", lang: "fr" },
                expected: { url: "/fr/faq", status: 301, count: 1 }
            },
            {
                input: { url: "/m/p/faq?lang=ms&test=1", lang: "fr" },
                expected: { url: "/fr/faq?test=1", status: 301, count: 1 }
            },
            {
                input: { url: "/static/p/faq?lang=ms", lang: "fr" },
                expected: { url: "/fr/faq", status: 301, count: 1 }
            },
            {
                input: { url: "/en/////about?", lang: "fr" },
                expected: { url: "/en/about", status: 301, count: 1 }
            },
            {
                input: { url: "/example?lang=de", lang: "fr" },
                expected: { url: "/example", status: 302, count: 1 }
            },
            {
                input: { url: "/m/example?lang=de&referer=web", lang: "fr" },
                expected: { url: "/example?referer=web", status: 302, count: 1 }
            },
            {
                input: { url: "/p/languages?lang=ru?lang=es", lang: "fr" },
                expected: { url: "/fr/languages", status: 301, count: 1 }
            },
            {
                input: { url: "/p/test/??&?lang=de&lang=zu&?", lang: "fr" },
                expected: { url: "/p/test", status: 301, count: 1 }
            },
            // is not possible because /en would already lead to local = "fr"
            // "/en": {url : "/fr", status : 301},
        ];

        testCases.forEach(testCase => {
            var redirectObj = this.calculateRedirect(testCase.input);
            // console.log ("Perform test case:", redirectObj);

            if (
                (testCase.expected.url != redirectObj.url)
                || (testCase.expected.status && testCase.expected.status != redirectObj.status)
                || (testCase.expected.count && testCase.expected.count != redirectObj.count)
            ) {
                console.error(`${testCase.input.url}
                  redirect: ${redirectObj.url} (${redirectObj.status}, type: ${redirectObj.type}, count: ${redirectObj.count})
                  expected: ${testCase.expected.url} (${testCase.expected.status || ""}, count: ${testCase.expected.count})`);
            }
        });
    }
}