import { Module } from '@nestjs/common';
import { CommsService } from './comms.service';
import { DataModule } from '../data/data.module';
import { MailjetModule } from 'nest-mailjet'
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
    imports: [
        DataModule,
        MailjetModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService.INJECTION],
            useFactory: (configService: ConfigService) => ({
                "apiKey": configService.getValue(ConfigService.KEYS.MAILJET_APIKEY),
                "apiSecret": configService.getValue(ConfigService.KEYS.MAILJET_APISECRET)
            })
        })
    ],
    providers: [CommsService],
    exports: [CommsService],
})

export class CommsModule { }