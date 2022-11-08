import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DataModule } from '../data/data.module';
import { I18nMiddleware } from './middleware/i18n.middleware';
import { HbsMiddleware } from './middleware/hbs.middleware';
import { WebController } from './web.controller';
import { HttpExceptionFilter } from './filter/http-exception.filter';

@Module({
    imports: [DataModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        }
    ],
    controllers: [WebController],
})

export class WebModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware, HbsMiddleware).forRoutes('*');
    }
}