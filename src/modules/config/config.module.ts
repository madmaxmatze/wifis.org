import { Module, Global, Inject, MiddlewareConsumer } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from './config.service';

@Global()
@Module({
    imports: [],
    providers: [
        ConfigService,
        {
            provide: ConfigService.INJECTION,
            // dynamic async module: https://github.com/nestjs/nest/issues/2762
            useFactory: async (configService) => (await configService.init()),
            inject: [ConfigService],
        },
    ],
    controllers: [],
    exports: [ConfigService, ConfigService.INJECTION]
})

export class ConfigModule {
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.configService = configService;
    }
    
    configure(consumer: MiddlewareConsumer) {
        consumer.apply((req: Request, _res: Response, next: NextFunction) => {
            this.configService.saveRequestHostname(req.hostname);  // save hostname via middleware from first request 
            next();
        }).forRoutes('*')
    }
 }