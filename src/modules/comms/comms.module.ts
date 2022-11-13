import { Module } from '@nestjs/common';
import { CommsService } from './comms.service';
import { DataModule } from '../data/data.module';
import { MailjetModule } from 'nest-mailjet'
import { ConfigService, ConfigKey } from '../config/config.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [
        DataModule,
        MailjetModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                "apiKey": configService.getValue(ConfigKey.MAILJET_APIKEY),
                "apiSecret": configService.getValue(ConfigKey.MAILJET_APISECRET)
            })
        })
    ],
    providers: [CommsService],
    exports: [CommsService],
})

export class CommsModule { }