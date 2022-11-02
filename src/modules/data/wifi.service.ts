import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot } from '@google-cloud/firestore';
import { Wifi } from './wifi.model';

@Injectable()
export class WifiService {
    private db = null;

    constructor(dataService: DataService) {
        this.db = dataService.getConnection();
    }

    isIdValid(id : String) {
        return /^[\w\-]{3,20}$/.test(id.toString());
    }

    get(id : String) {
        // throw new Error("test");

        if (!this.isIdValid(id)) {
            throw new Error("Invalid wifiId");
        }
        return new Promise((resolve, _reject) => {
            this.db.collection('wifis').doc(id.toLowerCase()).get().then((documentSnapshot : DocumentSnapshot) => {
                resolve(documentSnapshot.exists ? documentSnapshot.data() : null);
            });
        });
    }

    getAllForUser(userId : String) {
        return new Promise((resolve, _reject) => {
            this.db.collection('wifis')
                .where("user", "==", userId).get()
                .then((querySnapshot : QuerySnapshot ) => {
                    resolve(querySnapshot.docs.map((doc : QueryDocumentSnapshot) => ({
                        "id": doc.id,
                        "label": doc.data().label
                    })));
                });
        });
    }

    insert(wifi : Wifi) {
        if (!wifi || !wifi.id || !this.isIdValid(wifi.id)) {
            throw new Error("Invalid wifiId");
        }
        if (!wifi.user) {
            throw new Error("Invalid userId");
        }

        wifi.id = wifi.id.toLowerCase();
        return new Promise((resolve, _reject) => {
            wifi.creationDate = new Date();
            this.db.collection('wifis').doc(wifi.id).set(wifi).then((_writeResult : any) => {
                resolve(wifi);
            });
        });
    }

    delete(userId : String, wifiId : String) {
        if (!wifiId) {
            throw new Error("Invalid wifiId '${wifiId}'");
        }
        if (!userId) {
            throw new Error("Invalid userId '${userId}'");
        }

        return new Promise((resolve, _reject) => {
            this.db.collection('wifis')
                .where('id', '==', wifiId.toLowerCase())
                .where('user', '==', userId)
                .get()
                .then((querySnapshot : QuerySnapshot) => {
                    if (querySnapshot.docs.length != 1) {
                        throw new Error(querySnapshot.docs.length + " wifi to delete found. Only 1 expected")
                    }
                    return querySnapshot.docs.pop().ref.delete();
                }).then((_writeResult : any) => {
                    // actually not needed, but want to contain db objects to Repo                    
                    resolve(true);
                });
        });
    }

}