import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import { ConfigService, ConfigKey } from '../config/config.service';

@Injectable()
export class DataService {
    private connection = null;

    constructor(configService: ConfigService) {
        this.connection = new Firestore({
            "projectId": configService.getValue(ConfigKey.GCP_FIRESTORE_PROJECT_ID),
            "credentials": {
                "client_email": configService.getValue(ConfigKey.GCP_FIRESTORE_CLIENT_EMAIL),
                "private_key": configService.getValue(ConfigKey.GCP_FIRESTORE_PRIVATE_KEY)
            },
            "ignoreUndefinedProperties": true
        });
    }

    getConnection() {
        return this.connection;
    }
}