import { Module, MiddlewareConsumer, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigMiddleware } from './config.middleware';

@Global()
@Module({
    imports: [],
    providers: [ConfigService],
    controllers: [],
    exports: [ConfigService]
})

export class ConfigModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ConfigMiddleware).forRoutes('*');
    }
}