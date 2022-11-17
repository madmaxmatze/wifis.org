import { Injectable, Inject } from '@nestjs/common';
import { Firestore, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, CollectionReference, WriteResult } from '@google-cloud/firestore';
import { Wifi, WifiError } from './wifi.model';
import { User, UserError } from '../user/user.model';
import { UserRepo } from '../user/user.repo';

@Injectable()
export class WifiRepo {
    private wifiCollection: CollectionReference;
    private userRepo: UserRepo;

    constructor(@Inject("FIRESTORE") firestore: Firestore, userRepo: UserRepo) {
        this.wifiCollection = firestore.collection('wifis');
        this.userRepo = userRepo;
    }

    private verifyWifiId(id: string) {
        if (!id) {
            throw new Error(WifiError.noWifiIdDefined);
        }
        if (id.length < 3) {
            throw new Error(WifiError.wifiIdTooShort);
        }
        if (id.length > 20) {
            throw new Error(WifiError.wifiIdTooLong);
        }
        if (["api", "www", "p", "mail", "app"].includes(id)) {
            throw new Error(WifiError.wifiIdReserved);
        }
        if (!/^[\w\-]{3,20}$/.test(id.toString())) {
            throw new Error(WifiError.wrongWifiIdChars);
        }
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
            (documentSnapshot: DocumentSnapshot) => {
                var wifi = documentSnapshot.exists ? <Wifi>documentSnapshot.data() : null;
                if (wifi && userId && userId !== wifi.user) {
                    wifi = null;
                }
                return wifi;
            }
        );
    }

    async getAllByUserId(userId: string): Promise<Wifi[]> {
        this.userRepo.verifyUserId(userId);

        return this.wifiCollection
            .where("user", "==", userId).get()
            .then((querySnapshot: QuerySnapshot) => {
                return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => <Wifi>doc.data());
            });
    }

    async insert(wifi: Wifi): Promise<boolean> {
        if (!wifi) { throw new Error(WifiError.invalid); }

        var existingWifi: Wifi = await this.get(wifi.id)
        if (existingWifi) {
            throw new Error(WifiError.wifiIdReserved);
        }

        var user: User = await this.userRepo.get(wifi.user);
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

        wifi.id = wifi.id.toLowerCase();
        return this.wifiCollection.doc(wifi.id).set(wifi, { merge: false }).then(() => true);
    }

    async delete(wifiId: string, userId: string): Promise<boolean> {
        this.verifyWifiId(wifiId);
        this.userRepo.verifyUserId(userId);

        return this.wifiCollection
            .where('id', '==', wifiId.toLowerCase())
            .where('user', '==', userId)
            .get()
            .then((querySnapshot: QuerySnapshot) => {
                if (querySnapshot.docs.length != 1) {
                    throw new Error(WifiError.whileWifiDelete);
                }
                return querySnapshot.docs.pop().ref.delete();
            })
            .then(() => true);
    }
}