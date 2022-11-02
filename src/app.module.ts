import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { I18nMiddleware } from './common/middleware/i18n.middleware';
import { HbsMiddleware } from './common/middleware/hbs.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { DataModule } from './modules/data/data.module';
import { ApiController } from './modules/api/api.controller';

// import { ConfigModule } from '@nestjs/config';
// import configuration from './common/config/configuration';

@Module({
    imports: [
        // ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        AuthModule,
        DataModule
    ],
    controllers: [AuthController, ApiController, AppController],
    providers: [],
})

export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(I18nMiddleware).forRoutes('*');
        consumer.apply(HbsMiddleware).forRoutes('*');
    }
}