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
        var [, pathname, search] = request.originalUrl.match(/^(.*?)(\?.+)*$/);
        var options : any = {
            pathname: pathname,
            search: search,            
            lang: response.getLocale(),
        };
        if (!this.configService.isDevEnv()) {
            options.protocol = request.protocol;
            options.hostname = this.configService.getHostname();
        }
        console.log (options);
        var redirect = WifisRedirect.getRedirect(options);
        if (redirect.url) {
            console.log(`${redirect.status} REDIRECT (type:'${redirect.type || "general"}') from '${request.originalUrl}' to '${redirect.url}'`);
            return response.redirect(redirect.status, redirect.url);
        }

        next();
    }
}