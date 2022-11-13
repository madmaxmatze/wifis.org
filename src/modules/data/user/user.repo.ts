import { Injectable, Inject } from '@nestjs/common';
import { User, UserError } from './user.model';
import { Firestore, DocumentSnapshot, QueryDocumentSnapshot, CollectionReference } from '@google-cloud/firestore';

@Injectable()
export class UserRepo {
    private userCollection: CollectionReference = null;

    constructor(@Inject('FIRESTORE') firestore: Firestore) {
        this.userCollection = firestore.collection('users');
    }

    private getDocRef(userId: string) {
        if (!userId) {
            throw new Error(UserError.invalidId);
        }
        return this.userCollection.doc(userId.toLowerCase());
    }

    async get(userId: string): Promise<User> {
        return new Promise((resolve, _reject) => {
            this.getDocRef(userId).get().then((documentSnapshot: DocumentSnapshot) => {
                var user: User = documentSnapshot.exists ? <User>documentSnapshot.data() : null;
                if (user) {
                    if (!user.maxWifis) {
                        user.maxWifis = 3;
                    }
                }
                resolve(user);
            });
        });
    }

    upsert(user: User) {  // update or insert
        return new Promise((resolve, reject) => {
            this.getDocRef(user.id).get().then((queryDocumentSnapshot: QueryDocumentSnapshot) => {
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