import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { User } from './user.model';
import { DocumentSnapshot, QueryDocumentSnapshot } from '@google-cloud/firestore';

@Injectable()
export class UserService {
    private db = null;

    constructor(dataService: DataService) {
        this.db = dataService.getConnection();
    }

    private getDocRef(userId : String) {
        return this.db.collection('users').doc(userId.toLowerCase());
    }

    async get(userId : String) {
        if (!userId) {
            throw new Error("Invalid userId '${userId}'");
        }
        return new Promise((resolve, _reject) => {
            this.getDocRef(userId).get().then((documentSnapshot: DocumentSnapshot) => {
                resolve(documentSnapshot.exists ? documentSnapshot.data() : null);
            });
        });
    }

    /* not needed for now
    insert(user) {
        return this.getDocRef(user).set(user);
    }

    update(user, data) {
        return this.getDocRef(user).update(data);
    }
    */

    upsert(user : User) {  // update or insert
        return new Promise((resolve, reject) => {
            this.getDocRef(user.id).get().then((queryDocumentSnapshot : QueryDocumentSnapshot) => {
               if (queryDocumentSnapshot.exists) {
                    // TODO: add other data to merge in
                    var lastLoginDate = new Date();
                    this.getDocRef(user.id).update({ "lastLoginDate": lastLoginDate }).then(() => {
                        user.lastLoginDate = lastLoginDate;
                        resolve(user);
                    }).catch(reject);
                } else {
                    this.getDocRef(user.id).set(user).then(() => {
                        resolve(user);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
}




// const Firestore = require('@google-cloud/firestore');
// const { readFileSync } = require('fs');

/*
        const db = new Firestore({
            projectId: 'node-test-351811',
            keyFilename: 'node-test-firestore.json',
        });
    
        var promise = deleteCollection(db, 'users', 500);

        promise.finally(() => {
            console.log("users collection deleted");

            for (var i = 0; i<100; i++) {
                var rand = Math.random();
                const docRef = db.collection('users').doc('mathias' + rand);
            
                docRef.set({
                    first: 'Mathias' + rand,
                    last: 'Nitzsche',
                    born: 1983 + rand
                });
            }
            console.log("100 users created");
        });
        */

