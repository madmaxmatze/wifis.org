import { Injectable } from '@nestjs/common';
import { DataService } from '../data.service';
import { Message } from './message.model';
import { CollectionReference } from '@google-cloud/firestore';

@Injectable()
export class MessageRepo {
    private messagesCollection: CollectionReference = null;

    constructor(dataService: DataService) {
        this.messagesCollection = dataService.getMessagesCollection();
    }

    async insert(message: Message) {  // update or insert
        return new Promise((resolve, _reject) => {
            this.messagesCollection.add(message).then(() => {
                resolve(message);
            });
        });
    }
}