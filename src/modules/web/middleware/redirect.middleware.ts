import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WifisRedirect } from './wifis.redirect';
import { ConfigService } from '../../config/config.service';

/**
 * Central class to fix all kinds of redirect - CAREFUL WITH CHANGES!
 */
@Injectable()
export class RedirectMiddleware implements NestMiddleware {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    use(request: Request, response: Response, next: NextFunction) {
        var redirect = WifisRedirect.getRedirect({
            hostname: this.configService.getHostname(),
            pathname: request.baseUrl + request.path,
            search: request.originalUrl.replace(/^.*?(\?.*)$/, "$1"),            
            lang: response.getLocale(),
        });
        if (redirect.url) {
            console.log(`${redirect.status} REDIRECT (type:'${redirect.type || "general"}') from '${redirect.requestUrl}' to '${redirect.url}'`);
            return response.redirect(redirect.status, redirect.url);
        }

        // only cases to handle outsite of redirect class, otherwise lang cannot be swicthed on homepage
        if ((request.baseUrl + request.path) == "/en" && redirect.lang == "en") {
            return response.redirect(302, "");
        }

        next();
    }
}