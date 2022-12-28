import { Injectable, Inject } from '@nestjs/common';
import { User, UserError } from './user.model';
import { Firestore, DocumentSnapshot, DocumentReference, QueryDocumentSnapshot, QuerySnapshot, CollectionReference } from '@google-cloud/firestore';
import { Wifi } from '../wifi/wifi.model';

@Injectable()
export class UserRepo {
    private userCollection: CollectionReference<User> = null;

    constructor(
        @Inject("FIRESTORE") private readonly firestore: Firestore
    ) {
        this.userCollection = <CollectionReference<User>>firestore.collection('users');
    }

    verifyUserId(userId: string) {
        if (!userId) {
            throw new Error(UserError.invalidId);
        }
        userId = userId.toLowerCase();
    }

    private verifyUser(user: User) {
        if (!user) {
            throw new Error(UserError.invalid);
        }
        this.verifyUserId(user.id);
        if (!user.provider) {
            throw new Error(UserError.invalid);
        }
        if (!user.providerId) {
            throw new Error(UserError.invalid);
        }
        if (!user.email) {
            throw new Error(UserError.emailMissing);
        }
        user.email = user.email.toLowerCase();
    }

    private getDocRef(userId: string): DocumentReference<User> {
        this.verifyUserId(userId);
        return this.userCollection.doc(userId.toLowerCase());
    }

    async get(userId: string): Promise<User> {
        this.verifyUserId(userId);

        return this.getDocRef(userId).get().then(
            (documentSnapshot: DocumentSnapshot<User>) => {
                var user: User = documentSnapshot.exists ? documentSnapshot.data() : null;
                if (user && (!user.maxWifis || user.maxWifis < 3)) {
                    user.maxWifis = 3;
                }
                return user;
            }
        );
    }

    private async getByEmailAndProvider(email: string, provider: string): Promise<User> {
        return this.userCollection
            .where("email", "==", email)
            .where("provider", "==", provider)
            .get()
            .then((querySnapshot: QuerySnapshot<User>) => {
                return querySnapshot.docs.map((doc: QueryDocumentSnapshot<User>) => doc.data()).pop();
            });
    }

    /**
     * update or insert
     */
    async upsert(unsavedUser: User): Promise<User> {
        this.verifyUser(unsavedUser);

        var existingUser = await this.get(unsavedUser.id);
        if (existingUser) {
            return this.update(existingUser, unsavedUser);
        }

        return await this.insert_inCaseEmailForThisProviderAlreadyExists(unsavedUser) || this.insert(unsavedUser);
    }

    /**
     *  user exists, update with new information
     */
    private async update(existingUser: User, unsavedUser: User): Promise<User> {
        this.verifyUser(existingUser);
        this.verifyUser(unsavedUser);

        var userToSave = this.copyMergeUserData(existingUser, unsavedUser);
        return this.getDocRef(userToSave.id).update(userToSave).then(() => userToSave);
    }

    private copyMergeUserData(targetUser: User, newUser: User): User {
        if (!targetUser || !newUser) {
            throw Error("copyMergeUserData only allowed with existing user objects");
        }

        var mergedUser = { ...targetUser };
        if (newUser.country) { mergedUser.city = null; }  // needed to keep city and country in sync
        Object.getOwnPropertyNames(newUser).forEach(propertyName => {
            // just protect signupDate from overwriting
            if (newUser[propertyName] && propertyName != "signupDate") {
                mergedUser[propertyName] = newUser[propertyName];
            }
        });

        return mergedUser;
    }

    /**
     * better only publically offer upsert
     * 
     * @param user
     */
    private async insert(unsavedUser: User): Promise<User> {
        this.verifyUser(unsavedUser);

        return this.getDocRef(unsavedUser.id).set(unsavedUser, { merge: false }).then(() => unsavedUser);
    }

    /**
    * Because of not unique UserIDs accross login methods Google  AND Facebook Users need some special attention
    * read more https://stackoverflow.com/questions/74524494
    * @param user 
    */
    private async insert_inCaseEmailForThisProviderAlreadyExists(unsavedUser: User): Promise<User> {
        var existingUserWithSameEmail: User = await this.getByEmailAndProvider(unsavedUser.email, unsavedUser.provider);
        if (existingUserWithSameEmail && existingUserWithSameEmail.id != unsavedUser.id) {
            // at this point it seems that a user with a different UserId, but same Email already exists, so we have to merge

            var unsavedUserWithAllDataFromExistingUser: User = this.copyMergeUserData(existingUserWithSameEmail, unsavedUser);
            await this.insert(unsavedUserWithAllDataFromExistingUser);

            const googleIdMigrationBatch = this.firestore.batch();
            await this.firestore.collection('wifis')
                .where("userId", "==", existingUserWithSameEmail.id).get()
                .then((querySnapshot: QuerySnapshot<Wifi>) => {
                    querySnapshot.docs.forEach((queryDocumentSnapshot: QueryDocumentSnapshot<Wifi>) => {
                        // console.log("Change wifi owner", `owner of wifi '${queryDocumentSnapshot.data().id}' changed to '${unsavedUserWithAllDataFromExistingUser.id}'`);
                        googleIdMigrationBatch.update(queryDocumentSnapshot.ref, { "userId": unsavedUserWithAllDataFromExistingUser.id });
                    })
                });

            // console.log("delete user", `delete user with ID '${existingUserWithSameEmail.id}'`);
            googleIdMigrationBatch.delete(this.getDocRef(existingUserWithSameEmail.id));

            return googleIdMigrationBatch.commit()
                .then(() => unsavedUserWithAllDataFromExistingUser)
                .catch(() => unsavedUserWithAllDataFromExistingUser);
        }

        return null;
    }

    /*
    async getAll(offset: number = 0, count: number = 100): Promise<User[]> {
        return this.userCollection
            // .where("provider", "==", "google")
            .limit(count)
            .offset(offset)
            .get()
            .then((querySnapshot: QuerySnapshot) => {
                return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => <User>doc.data());
            });
    }
    */
}