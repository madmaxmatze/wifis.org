import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        var domain = req.hostname;
        var url = req.baseUrl;

        // fix any redirect to wifis.org/www...
        if (url == "/www") { return res.redirect("/", 301); }
        if (url.startsWith("/www/")) { return res.redirect(url.substr(4), 301); }

        // dont perform DOMAIN redirects on PROD
        /*
        if (["127.0.0.1", "localhost"].includes(req.hostname)) {
            return next();
        }
        */

        next();
    }
}

