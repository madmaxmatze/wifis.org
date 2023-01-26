import { WifisRedirect } from './wifis.redirect';

// test in shell via "npm test"
describe('Test Redirect Middleware', () => {
    let testCases: any = [
        {
            name: "Sub Domain static.wifis.org",
            request: { protocol: "http:", hostname: "static.wifis.org", pathname: "/whatever", search: "?foo=bar" },
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
            request: { protocol: "http:", hostname: "example.wifis.org", pathname: "/" },
            response: { url: "https://wifis.org/example", status: 301 }
        },
        {
            name: "Blog",
            request: { pathname: "/p/blog" },
            response: { url: "https://blog.wifis.org", status: 301 }
        },
        {
            name: "Blog Domain",
            request: { hostname: "blog.wifis.org", pathname: "/fr/whatever?lang=de" },
            response: { count: 0 },
        },
        {
            name: "Lang Homepage with tailing /",
            request: { pathname: "/www/" },
            response: { url: "/", status: 301 }
        },
        {
            name: "Lang Homepage",
            request: { pathname: "/www/", lang: "fr" },
            response: { url: "/fr", status: 302 }
        },
        {
            name: "Plain EN-Homepage with lang param",
            request: { pathname: "/", search: "?lang=en" },
            response: { url: "/", status: 301 }
        },
        {
            name: "/-Homepage redirect to naked homepage",
            request: { pathname: "/en", lang: "en" },
            response: { url: "/", status: 302 }
        },
        {
            name: "/-Homepage redirect to lang homepage",
            request: { pathname: "/", lang: "fr" },
            response: { url: "/fr", status: 302 }
        },
        {
            name: "/-Homepage redirect to lang homepage 2",
            request: { pathname: "/", search: "?lang=it" },
            response: { url: "/it", status: 301 }
        },
        {
            name: "/-Homepage redirect to lang homepage 3",
            request: { pathname: "/", search: "?lang=it?lang=en" },
            response: { url: "/it", status: 301 }
        },
        {
            name: "/p/",
            request: { pathname: "/p/about" },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "/p/ + ?lang",
            request: { pathname: "/www/p/about", search: "?lang=fr" },
            response: { url: "/fr/about", status: 301 }
        },
        {
            name: "/www/ + /p/ + ?lang",
            request: { pathname: "/www/p/about", search: "?lang=xx" },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "/www/ + wifiname",
            request: { pathname: "/www/wifiname", search: "?lang=xx" },
            response: { url: "/wifiname?lang=xx", status: 301 }
        },
        {
            name: "/static/p/ + ?lang/",
            request: { pathname: "/static/p/faq", search: "?lang=fr" },
            response: { url: "/fr/faq", status: 301 }
        },
        {
            name: "Old mobile subdomain + parameters",
            request: { pathname: "/m/p/faq", search: "?lang=ms&test=1" },
            response: { url: "/ms/faq?test=1", status: 301 }
        },
        {
            name: "Old static subdomain + ?lang param",
            request: { pathname: "/static/p/faq", search: "?lang=fr" },
            response: { url: "/fr/faq", status: 301 }
        },
        {
            name: "many ///",
            request: { pathname: "/en/////about", search: "?" },
            response: { url: "/en/about", status: 301 }
        },
        {
            name: "wifiPage + ?lang",
            request: { pathname: "/example", search: "?lang=de" },
            response: { count: 0 },
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
            response: { url: "/ru/languages", status: 301 }
        },
        {
            name: "random wrong chars",
            request: { pathname: "/p/test/", search: "??&?lang=de&lang=zu&?", lang: "fr" },
            response: { url: "/p/test?lang=de", status: 301 }
        },
        {
            name: "shell.cloud.google.com specific redirect on app start",
            request: { pathname: "/", search: "?authuser=0&redirectedPreviously=true" },
            response: { count: 0 },
        },
        {
            name: "search console cases",
            request: { pathname: "/static/example", search: "?lang=de?lang=es", lang: "fr" },
            response: { url: "/example?lang=de", status: 301 }
        },
        {
            name: "search console cases",
            request: { pathname: "/static/p/languages", search: "?lang=de?lang=de" },
            response: { url: "/de/languages", status: 301 }
        },
    ];

    const request = require("supertest");
    testCases.forEach((testCase: any) => {
        var performLive = (testCase.request.lang == undefined);

        it(testCase.name, () => {
            Object.assign(testCase.request, {
                search: testCase.request.search || "",
                lang: WifisRedirect.getLang(testCase.request.lang, testCase.request.pathname + testCase.request.search),
            });
            var redirect = WifisRedirect.getRedirect(testCase.request);
            expect(redirect).toEqual(expect.objectContaining(testCase.response));
            if (!redirect.count) {
                expect(redirect.url).toBeUndefined();
            }
        });

        if (false && performLive && testCase.response.url) {
            it("FETCH " + testCase.name, async () => {
                request((testCase.request.protocol || "https:") + "//" + (testCase.request.hostname || "wifis.org"))
                    .get(testCase.request.pathname + (testCase.request.search || ""))
                    .expect('Location', testCase.response.url);
            });
        }
    });
});