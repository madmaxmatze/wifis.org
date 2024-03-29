import { Module } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { DataModule } from './modules/data/data.module';
import { CommsModule } from './modules/comms/comms.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApiModule } from './modules/api/api.module';
import { WebModule } from './modules/web/web.module';

@Module({
    imports: [
        ConfigModule,
        DataModule,
        CommsModule,
        AuthModule,
        ApiModule,
        WebModule
    ],
    controllers: [],
    providers: [],
})

export class AppModule { }