/*
import { Firestore } from '@google-cloud/firestore';

export const datastoreProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
        const dataSource = new Firestore({
            "projectId": process.env['GCP_FIRESTORE_PROJECT_ID'],
            "credentials": {
                "client_email" : process.env['GCP_FIRESTORE_CLIENT_EMAIL'],
                "private_key" : process.env['GCP_FIRESTORE_PRIVATE_KEY']
            },
            // keyFilename: 'node-test-firestore.json',
            "ignoreUndefinedProperties": true
        });

        return dataSource;
    },
  },
];

*/