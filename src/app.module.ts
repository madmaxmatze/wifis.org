import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { DataModule } from './modules/data/data.module';
import { WebModule } from './modules/web/web.module';
import { ApiModule } from './modules/api/api.module';

// import { ConfigModule } from '@nestjs/config';
// import configuration from './common/config/configuration';

@Module({
    imports: [
        // ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        DataModule,
        AuthModule,
        ApiModule,
        WebModule
    ],
    controllers: [],
    providers: [],
})

export class AppModule {
}