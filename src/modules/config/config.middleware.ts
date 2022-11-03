import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from './config.service';

@Injectable()
export class ConfigMiddleware implements NestMiddleware {
    private configService = null;

    constructor(configService: ConfigService) {
        this.configService = configService;
    }
   
    async use(request: Request, response: Response, next: NextFunction) {
        console.log("ConfigModule Middleware");
        await this.configService.init();
        next();
    }
}