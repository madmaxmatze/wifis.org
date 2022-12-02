import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(request: Request, response: Response, next: NextFunction) {
        var domain = request.hostname;

        if (request.baseUrl) {
            var url = request.baseUrl
                .concat("/")                    // add slash for easier regexes (will be fixed at the end)
                .replace("/m/", "/")            // old mobile subdomain
                .replace("/www/", "/")          // old www subdomain
                .replace(/\/+/g, "/")           // replace multiple "/" by one
                .replace(/(.+?)\/*$/ig, "$1")   // cut of tailing "/" if not homepage
            
            if (url != request.baseUrl) {
                console.log ("url rewriting", `from '${request.baseUrl}' to '${url}'`);
                return response.redirect(url, 301);
            }
        }
 
        // dont perform DOMAIN redirects on PROD
        /*
        if (["127.0.0.1", "localhost"].includes(req.hostname)) {
            return next();
        }
        */

        next();
    }
}

