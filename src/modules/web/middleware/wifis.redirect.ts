/**
 * Wifis Redirect Handler
 * 
 * Source: https://github.com/madmaxmatze/wifis.org/tree/main/src/modules/web/middleware
 * 
 * Should remain classic Javascript, to allow usage in Cloudflare Worker
 * ... which is required to avoid multiple redirects from Cloudflare Page rules (handling subdomain redirects) 
 * and this class (handling path redirects).
 * Background: CloudRun doesn't allow wildcard domain matching with LoadBalancer
 */
export class WifisRedirect {
    // fetch language from url
    static getLang(lang, url) {
        var validLanguages = "de|en|es|fr|it|ms|nl|ru";

        // check if provided lang is valid
        if (!lang || !lang.match(new RegExp(`^(${validLanguages})$`))) {
            lang = "en";
        }

        // check url for lang info
        return [`lang\=(${validLanguages})`, `^\/(${validLanguages})(\/.+)*$`]
            .reduce((lang, regexStr) => {
                var matches = url.match(new RegExp(regexStr));
                return matches ? matches[1] : lang;
            }, lang);
    }

    static getRedirect(options) {
        if (!options.search) {
            options.search = "";
        }
        if (!options.hostname) {
            options.hostname = "";
        }
        
        var redirect = {
            ...{
                protocol: "https:",
                hostname: options.hostname,
                pathname: options.pathname,
                search: options.search,
                initialProtocol: options.protocol || "https:",
                initialHostname: options.hostname || "",
                initialPathname: options.pathname || "",
                initialSearch: options.search || "",
                type : "",
                count : 0,
            }, ...options, ...{
                lastProtocol: options.protocol || "https:",
                lastHostname: options.hostname || "",
                lastPathname: options.pathname || "",
                lastSearch: options.search || "",
            }
        };

        redirect.lang = options.lang || WifisRedirect.getLang("en", redirect.pathname);
   
        // handle subdomain
        if (redirect.hostname) {
            var [_redirectHostname, _subdomainWithDot, subdomain, mainDomain] = redirect.hostname.match(/((.*)\.)*(\w+\.\w+)/);
            if (subdomain) {    // redirect
                if (subdomain == "blog") { return redirect; }
                redirect.type += " > subdomain";
                redirect.hostname = mainDomain;
                subdomain = subdomain
                    .replace(/^(m|s|static|w|ww|www)$/g, "") // get rid of these subdomains
                    .replace(/^.{1,2}$/g, "")                // if shorter then 3 chars
                    ;
                redirect.pathname = (subdomain ? "/" + subdomain : "") + redirect.pathname;
            }
        }

        // fix old subdomains and path structure
        redirect.pathname = redirect.pathname
            .replace(/^\/(s|m|static|w|ww|www)\//g, "/")      // old mobile subdomain (301 redirected via cloudflare )
            .replace(/^\/p\/(about|faq|press|tos|languages|login|wifis)/g, "/" + redirect.lang + "/$1/")
        //    .replace(/\/press/, "/about")
        ;

        // fix old /p/blog url
        if (redirect.pathname.match(/\/p\/blog/)) {
            redirect.type += " > blog";
            redirect.status = 301;
            redirect.url = "https://blog.wifis.org";
            redirect.count++;
            return redirect;
        }

        // handle lang param
        if (redirect.search.match(/lang\=/)) {
            redirect.search = redirect.search.replace(/lang\=(\w{2}).lang\=\w{2}/g, "lang\=$1");      // merge multiple lang params           
            redirect.type += " > ?lang";
            if (redirect.pathname.length <= 1) {
                redirect.pathname =  "/" + (redirect.lang == "en" ? "" : redirect.lang);
                redirect.search = redirect.search.replace(/lang\=\w{2}/g, "");
            }
            if ((redirect.pathname + "/").match(/^\/[a-z]{2}\//)) { // if lang in path, remove lang paramany cms page
                redirect.search = redirect.search.replace(/lang\=\w{2}/g, "");
            }
        }

        // cleanup        
        var cleanupPathname = redirect.pathname
            .replace(/(.+?)\/+/g, "$1/")            // replace multiple "/" by one
            .replace(/(.+?)\/*$/ig, "$1")           // cut of tailing "/" if not en homepage "/"
            ; 
        if (cleanupPathname != redirect.pathname) {
            redirect.type += " > cleanup path";
            redirect.pathname = cleanupPathname;
        }

        var cleanupSearch = redirect.search
            .replace(/[\&]+/ig, "&")                // replace multiple "&" with one
            .replace(/[\?]+/ig, "?")                // replace multiple "?" with one
            .replace(/\?\&/ig, "?")                 // replace "?&" with "?"
            .replace(/[\&\?]+$/ig, "")              // cut of tailing "?"
        ;

        if (cleanupSearch != redirect.search) {
            redirect.type += " > cleanup search";
            redirect.search = cleanupSearch;
        }
    
        // force /cc for all non english language homepages
        if (redirect.pathname.length <= 1 && redirect.lang != "en") {   // can only come from cookie
            redirect.type += " > /CC-Homepage";
            redirect.status = 302;    // 302 because based on session specific language param
            redirect.pathname = "/" + redirect.lang;
        }

        // force naked homepage for all english homepage
        // if (redirect.initialPathname == "/en" && redirect.lang == "en") {   // can only come from cookie
        //    redirect.type += " > /EN-Homepage";
        //    redirect.status = 302;    // 302 because based on session specific language param
        //    redirect.pathname = "/";
        // }

        // check for redirect loops
        if ((redirect.lastProtocol != redirect.protocol
                || redirect.lastHostname != redirect.hostname 
                || redirect.lastPathname != redirect.pathname 
                || redirect.lastSearch != redirect.search
            ) && redirect.count <= 10) {
            console.log (redirect);
            redirect.count++;
            redirect = WifisRedirect.getRedirect(redirect);
        }

        if (redirect.count) {
            redirect.url = (redirect.hostname ? "https://" + redirect.hostname : "") + redirect.pathname + redirect.search;
            redirect.status = redirect.status || 301;
        }
        
        return redirect;
    }
}