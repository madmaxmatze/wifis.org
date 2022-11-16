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
        var docId = message.creationDate.toISOString() + "|" + message.wifiId;
        return this.messagesCollection.doc(docId).set(message, { merge: false }).then(() => true);
    }
}