import { Module } from '@nestjs/common';
import { WifiRepo } from './wifi/wifi.repo';
import { UserRepo } from './user/user.repo';
import { MessageRepo } from './message/message.repo';
import { ConfigService } from '../config/config.service';
import { Firestore } from '@google-cloud/firestore';

@Module({
    imports: [],
    providers: [
        {
            provide: "FIRESTORE",
            inject: [ConfigService.INJECTION],
            useFactory: (configService: ConfigService) => {
                return new Firestore({
                    "projectId": configService.getValue(ConfigService.KEYS.GCP_FIRESTORE_PROJECT_ID),
                    "credentials": {
                        "client_email": configService.getValue(ConfigService.KEYS.GCP_FIRESTORE_CLIENT_EMAIL),
                        "private_key": configService.getValue(ConfigService.KEYS.GCP_FIRESTORE_PRIVATE_KEY)
                    },
                    "ignoreUndefinedProperties": true
                });
            }
        },
        WifiRepo, UserRepo, MessageRepo],
    exports: [WifiRepo, UserRepo, MessageRepo],
})

export class DataModule { }