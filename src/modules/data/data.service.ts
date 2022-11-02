import { Injectable } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class DataService {
    connection = null;

    firestoreConfig = {
        "projectId": process.env.GCP_FIRESTORE_PROJECT_ID,
        "credentials": {
            "client_email": process.env.GCP_FIRESTORE_CLIENT_EMAIL,
            "private_key": process.env.GCP_FIRESTORE_PRIVATE_KEY
        },
        // keyFilename: 'node-test-firestore.json',
        "ignoreUndefinedProperties": true
    };

    constructor() {
        this.connection = new Firestore(this.firestoreConfig);
    }

    getConnection() {
        return this.connection;
    }
}