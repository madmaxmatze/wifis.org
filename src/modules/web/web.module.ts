import { Module, MiddlewareConsumer } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { I18nMiddleware } from './middleware/i18n.middleware';
import { HbsMiddleware } from './middleware/hbs.middleware';
import { WebController } from './web.controller';

@Module({
    imports: [DataModule],
    providers: [],
    controllers: [WebController],
})

export class WebModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware, HbsMiddleware).forRoutes('*');
    }
}