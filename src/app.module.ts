import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { I18nMiddleware } from './common/middleware/i18n.middleware';
import { HbsMiddleware } from './common/middleware/hbs.middleware';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule
    ],
    controllers: [AppController],
    providers: [],
})

export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware).forRoutes('*');
        consumer.apply(HbsMiddleware).forRoutes('*');
    }
}