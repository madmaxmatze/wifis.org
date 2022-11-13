import { Injectable, Inject } from '@nestjs/common';
import { Message } from './message.model';
import { Firestore, CollectionReference } from '@google-cloud/firestore';

@Injectable()
export class MessageRepo {
    private messagesCollection: CollectionReference = null;

    constructor(@Inject('FIRESTORE') firestore: Firestore) {
        this.messagesCollection = firestore.collection('messages');
    }

    async insert(message: Message) {
        return new Promise((resolve, _reject) => {
            this.messagesCollection.add(message).then(() => {
                resolve(message);
            });
        });
    }
}