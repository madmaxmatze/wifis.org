import { Injectable } from '@nestjs/common';
import { DataService } from '../data.service';
import { DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot, CollectionReference } from '@google-cloud/firestore';
import { Wifi, WifiError } from './wifi.model';

@Injectable()
export class WifiService {
    private wifisCollection : CollectionReference = null;

    constructor(dataService: DataService) {
        this.wifisCollection = dataService.getCollection('wifis');
    }

    private verifyValidId(id: string) {
        if (!id) {
            throw new Error(WifiError.noWifiIdDefined);
        }
        if (id.length < 3) {
            throw new Error(WifiError.wifiIdTooShort);
        }
        if (id.length > 20) {
            throw new Error(WifiError.wifiIdTooLong);
        }
        if (["api", "www", "p"].includes(id)) {
            throw new Error(WifiError.wifiIdReserved);
        }
        if (!/^[\w\-]{3,20}$/.test(id.toString())) {
            throw new Error(WifiError.wrongWifiIdChars);
        }
    }

    get(id: string): Promise<Wifi> {
        this.verifyValidId(id);

        return new Promise((resolve, _reject) => {
            this.wifisCollection.doc(id.toLowerCase()).get()
                .then((documentSnapshot: DocumentSnapshot) => {
                    resolve(documentSnapshot.exists ? <Wifi>documentSnapshot.data() : null);
                });
        });
    }

    getAllByUserId(userId: string): Promise<Wifi[]> {
        if (!userId) {
            throw new Error("Invalid userId");
        }
        
        return new Promise((resolve, _reject) => {
            this.wifisCollection
                .where("user", "==", userId).get()
                .then((querySnapshot: QuerySnapshot) => {
                    resolve(querySnapshot.docs.map((doc: QueryDocumentSnapshot) => (<Wifi>{
                        "id": doc.id,
                        "label": doc.data().label
                    })));
                });
        });
    }

    insert(wifi: Wifi): Promise<Wifi> {
        if (!wifi) {
            throw new Error(WifiError.invalid);
        }

        this.verifyValidId(wifi.id);
        wifi.id = wifi.id.toLowerCase();

        if (!wifi.user) {
            throw new Error(WifiError.userIdMissing);
        }

        return new Promise((resolve, _reject) => {
            this.wifisCollection.doc(wifi.id).set(wifi, { merge: false }).then((_writeResult: any) => {
                resolve(wifi);
            });
        });
    }

    delete(userId: string, wifiId: string): Promise<boolean> {
        this.verifyValidId(wifiId);

        if (!userId) {
            throw new Error("No userId provided");
        }

        return new Promise((resolve, _reject) => {
            this.wifisCollection
                .where('id', '==', wifiId.toLowerCase())
                .where('user', '==', userId)
                .get()
                .then((querySnapshot: QuerySnapshot) => {
                    if (querySnapshot.docs.length != 1) { // probably impossible due to unique ID
                        throw new Error(querySnapshot.docs.length + " wifis found to delete. Only 1 expected")
                    }
                    return querySnapshot.docs.pop().ref.delete();
                })
                .then((_writeResult: any) => {
                    // actually not needed, but want to contain db objects to Repo                    
                    resolve(true);
                });
        });
    }

}