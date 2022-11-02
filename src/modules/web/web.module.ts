import { Module, MiddlewareConsumer } from '@nestjs/common';
import { WebController } from './web.controller';
import { DataModule } from '../data/data.module';
import { I18nMiddleware } from './middleware/i18n.middleware';
import { HbsMiddleware } from './middleware/hbs.middleware';

@Module({
    imports: [DataModule],
    providers: [],
    controllers: [WebController],
})

export class WebModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware).forRoutes('*');
        consumer.apply(HbsMiddleware).forRoutes('*');
    }
}