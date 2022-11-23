import { Injectable, Inject } from '@nestjs/common';
import { User, UserError } from './user.model';
import { Firestore, DocumentSnapshot, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, CollectionReference } from '@google-cloud/firestore';

@Injectable()
export class UserRepo {
    private userCollection: CollectionReference = null;

    constructor(@Inject("FIRESTORE") firestore: Firestore) {
        this.userCollection = firestore.collection('users');
    }

    verifyUserId(userId: string) {
        if (!userId) {
            throw new Error(UserError.invalidId);
        }
    }

    private getDocRef(userId: string): DocumentReference {
        this.verifyUserId(userId);
        return this.userCollection.doc(userId.toLowerCase());
    }

    async get(userId: string): Promise<User> {
        return this.getDocRef(userId).get().then(
            (documentSnapshot: DocumentSnapshot) => {
                var user: User = documentSnapshot.exists ? <User>documentSnapshot.data() : null;
                if (user && !user.maxWifis || user.maxWifis < 3) {
                    user.maxWifis = 3;
                }
                return user;
            }
        );
    }

    /**
     * update or insert
     */
    async upsert(user: User): Promise<User> {
        var documentSnapshot: DocumentSnapshot = await (this.getDocRef(user.id).get());

        if (documentSnapshot.exists) {
            var fieldsToUpdate = this.getFieldsToUpdate(user);
            return this.getDocRef(user.id).update(fieldsToUpdate).then(() => user);
        } else {
            return this.getDocRef(user.id).set(user).then(() => user);
        }
    }

    /**
     *  user exists, update some fields
     */
    private getFieldsToUpdate(user: User) {
        user.lastLoginDate = new Date();
        var fieldsToUpdate: any = {
            lastLoginDate: user.lastLoginDate
        };
        if (user.email) {
            fieldsToUpdate.email = user.email;
        }
        if (user.name) {
            fieldsToUpdate.name = user.name;
        }
        if (user.country) { // always set together!
            fieldsToUpdate.country = user.country;
            fieldsToUpdate.city = user.city || null;
        }
        return fieldsToUpdate
    }

    async getAll(count: number = 100, offset: number = 0): Promise<User[]> {
        return this.userCollection
            .where("provider", "==", "google")
            .limit(count)
            .offset(offset)
            .get()
            .then((querySnapshot: QuerySnapshot) => {
                return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => <User>doc.data());
            });
    }
}