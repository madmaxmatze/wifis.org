import { Injectable, Inject } from '@nestjs/common';
import { Firestore, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, CollectionReference } from '@google-cloud/firestore';
import { Wifi, WifiError } from './wifi.model';
import { User, UserError } from '../user/user.model';
import { UserRepo } from '../user/user.repo';

@Injectable()
export class WifiRepo {
    private wifiCollection: CollectionReference<Wifi>;

    constructor(
        private readonly userRepo: UserRepo,
        @Inject("FIRESTORE") firestore: Firestore
    ) {
        this.wifiCollection = <CollectionReference<Wifi>>firestore.collection('wifis');
    }

    private verifyWifiId(id: string) {
        if (!id) {
            throw new Error(WifiError.valueMissing);
        }
        if (id.length < 3) {
            throw new Error(WifiError.tooShort);
        }
        // TODO: Allow longer IDs ?
        if (id.length > 20) {
            throw new Error(WifiError.tooLong);
        }
        if (["api", "www", "p", "mail", "app"].includes(id.toLocaleLowerCase())) {
            throw new Error(WifiError.wifiIdReserved);
        }
        if (!/^[\w\-]+$/.test(id)) {
            throw new Error(WifiError.patternMismatch);
        }
    }

    private sanatizeWifi(wifi: Wifi): Wifi {
        if (wifi && !wifi.label) {
            wifi.label = wifi.id;
        }
        return wifi;
    }

    async get(wifiId: string): Promise<Wifi> {
        return this.getByIdAndUser(wifiId);
    }

    async getForUser(wifiId: string, userId: string): Promise<Wifi> {
        this.userRepo.verifyUserId(userId);
        return this.getByIdAndUser(wifiId, userId);
    }

    private async getByIdAndUser(wifiId: string, userId: string = ""): Promise<Wifi> {
        this.verifyWifiId(wifiId);

        return this.wifiCollection.doc(wifiId.toLowerCase()).get().then(
            (documentSnapshot: DocumentSnapshot<Wifi>) => {
                var wifi = documentSnapshot.exists ? documentSnapshot.data() : null;
                if (wifi && userId && userId !== wifi.userId) {
                    wifi = null;
                }
                return this.sanatizeWifi(wifi);
            }
        );
    }

    async getAllByUserId(userId: string): Promise<Wifi[]> {
        this.userRepo.verifyUserId(userId);
        return this.wifiCollection
            .where("userId", "==", userId).get()
            .then((querySnapshot: QuerySnapshot<Wifi>) => {
                return querySnapshot.docs.map((doc: QueryDocumentSnapshot<Wifi>) => this.sanatizeWifi(doc.data()));
            });
    }

    async insert(wifi: Wifi): Promise<boolean> {
        if (!wifi) { throw new Error(WifiError.invalid); }

        this.verifyWifiId(wifi.id);
 
        if (wifi.label && wifi.label.toLowerCase() != wifi.id.toLowerCase()) {
            throw new Error(WifiError.labelMismatch);
        }
        
        if (wifi.id != wifi.id.toLowerCase()) {
            wifi.label = wifi.id;
        }
        wifi.id = wifi.id.toLowerCase();

        var existingWifi: Wifi = await this.get(wifi.id)
        if (existingWifi) {
            throw new Error(WifiError.wifiIdReserved);
        }

        var user: User = await this.userRepo.get(wifi.userId);
        if (!user) {
            throw new Error(UserError.notFound);
        }
        if (!user.email) {
            throw new Error(UserError.emailMissing);
        }

        var userWifis: Wifi[] = await this.getAllByUserId(user.id);
        if (userWifis.length >= user.maxWifis) {
            throw new Error(WifiError.maxWifiCountReached);
        }

        return this.wifiCollection.doc(wifi.id).set(wifi, { merge: false }).then(() => true);
    }

    async delete(wifiId: string, userId: string): Promise<boolean> {
        this.verifyWifiId(wifiId);
        this.userRepo.verifyUserId(userId);

        return this.get(wifiId).then(wifi => {
            if (!wifi) { throw new Error(WifiError.invalid); }
            if (wifi.userId != userId) { throw new Error(WifiError.otherUsersWifi); }
            this.wifiCollection.doc(wifiId.toLowerCase()).delete();
            return true;
        });
    }
}