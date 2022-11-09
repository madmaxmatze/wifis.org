import { Injectable } from '@nestjs/common';
import { Firestore, CollectionReference } from '@google-cloud/firestore';
import { ConfigService, ConfigKey } from '../config/config.service';

@Injectable()
export class DataService {
    private firestore : Firestore = null;

    constructor(configService: ConfigService) {
        this.firestore = new Firestore({
            "projectId": configService.getValue(ConfigKey.GCP_FIRESTORE_PROJECT_ID),
            "credentials": {
                "client_email": configService.getValue(ConfigKey.GCP_FIRESTORE_CLIENT_EMAIL),
                "private_key": configService.getValue(ConfigKey.GCP_FIRESTORE_PRIVATE_KEY)
            },
            "ignoreUndefinedProperties": true
        });
    }

    getCollection(collectionName : string) : CollectionReference {
        return this.firestore.collection(collectionName);
    }
}