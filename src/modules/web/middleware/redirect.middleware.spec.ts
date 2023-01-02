import { RedirectMiddleware } from './redirect.middleware';

/* 
 * TODO find a nicer way to directly test recursive private methods
 * so far protected seems best: https://www.danywalls.com/how-to-test-private-methods-in-typescript) 
 */
class RedirectMiddlewareExtendedForTesting extends RedirectMiddleware {
    calculateRedirectExtendedForTesting(options: any): string {
        return this.calculateRedirect(options);
    }
}

// test in shell via "npm test"
describe('Test Redirect Middleware', () => {
    let testCases: any = [
        {
            name: "Blog",
            input: { originalUrl: "/p/blog", lang: "de" },
            expected: { url: "//blog.wifis.org", status: 301, count: 1, "type": " > blog" }
        },
        {
            name: "Lang Homepage",
            input: { originalUrl: "/www/", lang: "fr" },
            expected: { url: "/fr", status: 302, count: 1, type: " > /CC-Homepage" }
        },
        {
            name: "Lang Homepage with tailing /",
            input: { originalUrl: "/www/", lang: "en", performLive: true },
            expected: { url: "/", status: 301, count: 1, "type": "" }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            input: { originalUrl: "/", lang: "fr" },
            expected: { url: "/fr", status: 302, count: 1, "type": " > /CC-Homepage" }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            input: { originalUrl: "/?lang=it", lang: "it", performLive: true },
            expected: { url: "/it", status: 302, count: 1, "type": " > /CC-Homepage" }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            input: { originalUrl: "/?lang=it?lang=en", lang: "it", performLive: true },
            expected: { url: "/it", status: 302, count: 1, "type": " > /CC-Homepage" }
        },
        {
            name: "/p/",
            input: { originalUrl: "/p/about", lang: "en", performLive: true },
            expected: { url: "/en/about", status: 301, count: 1, "type": " > cleanup" }
        },
        {
            name: "/p/ + ?lang",
            input: { originalUrl: "/www/p/about?lang=fr", lang: "fr", performLive: true },
            expected: { url: "/fr/about", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "/www/ + /p/ + ?lang",
            input: { originalUrl: "/www/p/about?lang=xx", lang: "en", performLive: true },
            expected: { url: "/en/about", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "/www/ + wifiname",
            input: { originalUrl: "/www/wifiname?lang=xx", lang: "fr" },
            expected: { url: "/wifiname?lang=xx", status: 301, count: 1, "type": " > ?lang > ?lang" }
        },
        {
            name: "/static/p/ + ?lang/",
            input: { originalUrl: "/static/p/faq?lang=fr", lang: "fr", performLive: true },
            expected: { url: "/fr/faq", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "Old mobile subdomain + parameters",
            input: { originalUrl: "/m/p/faq?lang=ms&test=1", lang: "ms", performLive: true },
            expected: { url: "/ms/faq?test=1", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "Old static subdomain + ?lang param",
            input: { originalUrl: "/static/p/faq?lang=fr", lang: "fr", performLive: true },
            expected: { url: "/fr/faq", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "many ///",
            input: { originalUrl: "/en/////about?", lang: "en", performLive: true },
            expected: { url: "/en/about", status: 301, count: 1, "type": " > cleanup" }
        },
        {
            name: "wifiPage + ?lang",
            input: { originalUrl: "/example?lang=de", lang: "fr" },
            expected: { url: "/example?lang=de", status: 301, count: 0, "type": " > ?lang" }
        },
        {
            name: "/m/ + wifiPage + ?lang + other param",
            input: { originalUrl: "/m/example?lang=de&referer=web", lang: "fr" },
            expected: { url: "/example?lang=de&referer=web", status: 301, count: 1, "type": " > ?lang > ?lang" }
        },
        {
            name: "multiple ?lang",
            input: { originalUrl: "/p/languages?lang=ru?lang=es", lang: "fr" },
            expected: { url: "/fr/languages", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
        {
            name: "random wrong chars",
            input: { originalUrl: "/p/test/??&?lang=de&lang=zu&?", lang: "fr" },
            expected: { url: "/p/test?lang=de", status: 301, count: 2, "type": " > ?lang > cleanup > ?lang > cleanup > ?lang" }
        },
        {
            name: "shell.cloud.google.com specific redirect on app start",
            input: { originalUrl: "/?authuser=0&redirectedPreviously=true", lang: "en" },
            expected: { url: "/?authuser=0&redirectedPreviously=true", status: 301, count: 0, "type": "" }
        },
        {
            name: "search console cases",
            input: { originalUrl: "/static/example?lang=en?lang=es", lang: "en", performLive: true },
            expected: { url: "/example?lang=en", status: 301, count: 1, "type": " > ?lang > ?lang" }
        },
        {
            name: "search console cases",
            input: { originalUrl: "/static/p/languages?lang=de?lang=de", lang: "de", performLive: true },
            expected: { url: "/de/languages", status: 301, count: 1, "type": " > ?lang > cleanup" }
        },
    ];

    const request = require("supertest");
    
    var middleware = new RedirectMiddlewareExtendedForTesting();
    testCases.forEach((testCase : any) => {
        it(testCase.name, () => {
            expect(middleware.calculateRedirectExtendedForTesting(testCase.input))
                .toStrictEqual({ ...testCase.input, ...testCase.expected });
        });

        if (false && testCase.input.performLive) {
            it("FETCH " + testCase.name, async () => {
                return request("https://wifis.org")
                        .get(testCase.input.originalUrl)
                        .expect('Location', testCase.expected.url)
                        .expect(testCase.expected.url.status);
            });
        }
    });
});