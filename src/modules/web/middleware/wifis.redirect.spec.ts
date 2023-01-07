import { WifisRedirect } from './wifis.redirect';

// test in shell via "npm test"
describe('Test Redirect Middleware', () => {
    let testCases: any = [
        {
            name: "Sub Domain static.wifis.org",
            request: { hostname: "static.wifis.org", pathname: "/whatever", search: "?foo=bar" },
            response: { url: "https://wifis.org/whatever?foo=bar", status: 301 }
        },
        {
            name: "Too short subdomain",
            request: { hostname: "x.wifis.org", pathname: "/whatever" },
            response: { url: "https://wifis.org/whatever", status: 301 }
        },
        {
            name: "www subdomain + /p/ + lang param",
            request: { hostname: "www.wifis.org", pathname: "/p/about", search: "?lang=de" },
            response: { url: "https://wifis.org/de/about", status: 301 }
        },
        {
            name: "www subdomain + /p/ + lang from cookie",
            request: { hostname: "www.wifis.org", pathname: "/p/about", lang: "de" },
            response: { url: "https://wifis.org/de/about", status: 301 }
        },
        {
            name: "Sub Domain example.wifis.org",
            request: { hostname: "example.wifis.org", pathname: "/" },
            response: { url: "https://wifis.org/example", status: 301 }
        },
        {
            name: "Blog",
            request: { pathname: "/p/blog" },
            response: { url: "https://blog.wifis.org", status: 301 }
        },
        {
            name: "Blog Domain",
            request: { hostname: "blog.wifis.org", pathname: "/fr/whatever?lang=de", lang: "en" },
            response: {},
        },
        {
            name: "Lang Homepage with tailing /",
            request: { pathname: "/www/", performLive: true },
            response: { url: "/", status: 301 }
        },
        {
            name: "Lang Homepage",
            request: { pathname: "/www/", lang: "fr" },
            response: { url: "/fr", status: 302 }
        },
        {
            name: "Plain EN-Homepage with lang param",
            request: { pathname: "/", search: "?lang=en", performLive: true },
            response: { url: "/", status: 301 }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            request: { pathname: "/", lang: "fr" },
            response: { url: "/fr", status: 302 }
        },
        {
            name: "/-Homepage redirect to lang homepage 2",
            request: { pathname: "/", search: "?lang=it", performLive: true },
            response: { url: "/it", status: 301 }
        },
        {
            name: "/-Homepage redirect to lang homepage 2",
            request: { pathname: "/", search: "?lang=it?lang=en", performLive: true },
            response: { url: "/it", status: 301 }
        },
        {
            name: "/p/",
            request: { pathname: "/p/about", lang: "en", performLive: true },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "/p/ + ?lang",
            request: { pathname: "/www/p/about", search: "?lang=fr", performLive: true },
            response: { url: "/fr/about", status: 301 }
        },
        {
            name: "/www/ + /p/ + ?lang",
            request: { pathname: "/www/p/about", search: "?lang=xx", lang: "en", performLive: true },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "/www/ + wifiname",
            request: { pathname: "/www/wifiname", search: "?lang=xx", lang: "fr" },
            response: { url: "/wifiname?lang=xx", status: 301 }
        },
        {
            name: "/static/p/ + ?lang/",
            request: { pathname: "/static/p/faq", search: "?lang=fr", lang: "fr", performLive: true },
            response: { url: "/fr/faq", status: 301 }
        },
        {
            name: "Old mobile subdomain + parameters",
            request: { pathname: "/m/p/faq", search: "?lang=ms&test=1", lang: "ms", performLive: true },
            response: { url: "/ms/faq?test=1", status: 301 }
        },
        {
            name: "Old static subdomain + ?lang param",
            request: { pathname: "/static/p/faq", search: "?lang=fr", lang: "fr", performLive: true },
            response: { url: "/fr/faq", status: 301 }
        },
        {
            name: "many ///",
            request: { pathname: "/en/////about", search: "?", lang: "en", performLive: true },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "wifiPage + ?lang",
            request: { pathname: "/example", search: "?lang=de", lang: "de" },
            response: {},
        },
        {
            name: "/m/ + wifiPage + ?lang + other param",
            request: { pathname: "/m/example", search: "?lang=de&referer=web" },
            response: { url: "/example?lang=de&referer=web", status: 301 }
        },
        {
            name: "subdomain + /p/ + ?lang",
            request: { hostname: "static.wifis.org", pathname: "/p/about", search: "?lang=ru" },
            response: { url: "https://wifis.org/ru/about", status: 301 }
        },
        {
            name: "multiple ?lang",
            request: { pathname: "/p/languages", search: "?lang=ru?lang=es", lang: "fr" },
            response: { url: "/fr/languages", status: 301 }
        },
        {
            name: "random wrong chars",
            request: { pathname: "/p/test/", search: "??&?lang=de&lang=zu&?", lang: "fr" },
            response: { url: "/p/test?lang=de", status: 301 }
        },
        {
            name: "shell.cloud.google.com specific redirect on app start",
            request: { pathname: "/", search: "?authuser=0&redirectedPreviously=true", lang: "en" },
            response: {},
        },
        {
            name: "search console cases",
            request: { pathname: "/static/example", search: "?lang=en?lang=es", lang: "en", performLive: true },
            response: { url: "/example?lang=en", status: 301 }
        },
        {
            name: "search console cases",
            request: { pathname: "/static/p/languages", search: "?lang=de?lang=de", performLive: true },
            response: { url: "/de/languages", status: 301 }
        },
    ];

    const request = require("supertest");
    testCases.forEach((testCase: any) => {
        it(testCase.name, () => {
            var redirect = WifisRedirect.getRedirect(testCase.request);
            if (testCase.response.url) {
                expect(redirect).toEqual(expect.objectContaining(testCase.response));
            } else {
                expect(redirect.url).toBeUndefined();
            }
        });

        if (false && testCase.request.performLive) {
            it("FETCH " + testCase.name, async () => {
                return request("https://wifis.org")
                    .get(testCase.request.originalUrl)
                    .expect('Location', testCase.expected.url)
                    .expect(testCase.expected.url.status);
            });
        }
    });
});