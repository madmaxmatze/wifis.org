import { RedirectMiddleware } from './redirect.middleware';

/* TODO find a nicer way to directly test recursive private methods
 * so far protected seems best: https://www.danywalls.com/how-to-test-private-methods-in-typescript) 
 */
class RedirectMiddlewareExtendedForTesting extends RedirectMiddleware {
    calculateRedirectExtendedForTesting(options: any): string {
        return this.calculateRedirect(options);
    }
}

describe('Test Redirect Middleware', () => {
    let testCases: any = [
        {
            name: "Lang Homepage",
            input: { originalUrl: "/www/", lang: "fr" },
            expected: { url: "/fr", status: 302, count: 1, type: "/CC-Homepage" }
        },
        {
            name: "Lang Homepage with tailing /",
            input: { originalUrl: "/www/", lang: "en" },
            expected: { url: "/", status: 301, count: 1, "type": "general" }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            input: { originalUrl: "/", lang: "fr" },
            expected: { url: "/fr", status: 302, count: 1, "type": "/CC-Homepage" }
        },
        {
            name: "/p/",
            input: { originalUrl: "/p/about", lang: "fr" },
            expected: { url: "/fr/about", status: 301, count: 1, "type": "general" }
        },
        {
            name: "/p/ + ?lang",
            input: { originalUrl: "/www/p/about?lang=fr", lang: "fr" },
            expected: { url: "/fr/about", status: 301, count: 1, "type": "general" }
        },
        {
            name: "/www/ + /p/ + ?lang",
            input: { originalUrl: "/www/p/about?lang=xx", lang: "fr" },
            expected: { url: "/fr/about", status: 301, count: 1, "type": "general" }
        },
        {
            name: "/www/ + wifiname",
            input: { originalUrl: "/www/wifiname?lang=xx", lang: "fr" },
            expected: { url: "/wifiname", status: 302, count: 1, "type": "?lang" }
        },
        {
            name: "/static/p/ + ?lang/",
            input: { originalUrl: "/static/p/faq?lang=xx", lang: "fr" },
            expected: { url: "/fr/faq", status: 301, count: 1, "type": "general" }
        },
        {
            name: "Old mobile subdomain + parameters",
            input: { originalUrl: "/m/p/faq?lang=ms&test=1", lang: "fr" },
            expected: { url: "/fr/faq?test=1", status: 301, count: 1, "type": "general" }
        },
        {
            name: "Old static subdomain + ?lang param",
            input: { originalUrl: "/static/p/faq?lang=ms", lang: "fr" },
            expected: { url: "/fr/faq", status: 301, count: 1, "type": "general" }
        },
        {
            name: "many ///",
            input: { originalUrl: "/en/////about?", lang: "fr" },
            expected: { url: "/en/about", status: 301, count: 1, "type": "general" }
        },
        {
            name: "wifiPage + ?lang",
            input: { originalUrl: "/example?lang=de", lang: "fr" },
            expected: { url: "/example", status: 302, count: 1, "type": "?lang" }
        },
        {
            name: "/m/ + wifiPage + ?lang + other param",
            input: { originalUrl: "/m/example?lang=de&referer=web", lang: "fr" },
            expected: { url: "/example?referer=web", status: 302, count: 1, "type": "?lang" }
        },
        {
            name: "multiple ?lang",
            input: { originalUrl: "/p/languages?lang=ru?lang=es", lang: "fr" },
            expected: { url: "/fr/languages", status: 301, count: 1, "type": "general" }
        },
        {
            name: "random wrong chars",
            input: { originalUrl: "/p/test/??&?lang=de&lang=zu&?", lang: "fr" },
            expected: { url: "/p/test", status: 301, count: 1, "type": "general" }
        },
        {
            name: "shell.cloud.google.com specific redirect on app start",
            input: { originalUrl: "/?authuser=0&redirectedPreviously=true", lang: "en" },
            expected: { url: "/?authuser=0&redirectedPreviously=true", status: 301, count: 5, "type": "general" }
        },
    ];
    
    var middleware = new RedirectMiddlewareExtendedForTesting();
    testCases.forEach(testCase => {
        it(testCase.name, () => {
            expect(middleware.calculateRedirectExtendedForTesting(testCase.input))
                .toStrictEqual({ ...testCase.input, ...testCase.expected });
        });
    });
});