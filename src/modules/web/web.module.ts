import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DataModule } from '../data/data.module';
import { ConfigModule } from '../config/config.module';
import { CommsModule } from '../comms/comms.module';
import { ConfigService, ConfigKey } from '../config/config.service';
import { RedirectMiddleware } from './middleware/redirect.middleware';
import { I18nMiddleware } from './middleware/i18n.middleware';
import { HbsMiddleware } from './middleware/hbs.middleware';
import { WebController } from './web.controller';
import { WebExceptionFilter } from './filter/web.exception.filter';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { Request, Response, NextFunction } from 'express';

@Module({
    imports: [
        DataModule,
        GoogleRecaptchaModule.forRootAsync({    // https://github.com/chvarkov/google-recaptcha
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                debug: true,
                secretKey: configService.getValue(ConfigKey.RECAPTCHA_SECRET_KEY),
                response: (req => {return req.body["g-recaptcha-response"]}),
                score: 0.6
            }),
            inject: [ConfigService]
        }),
        CommsModule
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: WebExceptionFilter,
        }
    ],
    controllers: [WebController],
})

export class WebModule {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    configure(consumer: MiddlewareConsumer) {
        consumer.apply((req: Request, res: Response, next: NextFunction) => {
            this.configService.setRequestHostname(req.hostname);
            next();
        }).forRoutes('*')
        consumer.apply(I18nMiddleware, HbsMiddleware, RedirectMiddleware).forRoutes('*');
    }
}