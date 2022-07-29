class WifiRepository {
    constructor(db) {
        this.db = db;
    }

    isIdValid(id) {
        return /^[\w\-]{3,20}$/.test(id);
    }

    get(id) {
        throw new Error("test");

        if (!this.isIdValid(id)) {
            throw new Error("Invalid wifiId");
        }
        return new Promise((resolve, reject) => {
            this.db.collection('wifis').doc(id.toLowerCase()).get().then(documentSnapshot => {
                resolve(documentSnapshot.exists ? documentSnapshot.data() : null);
            });
        });
    }

    getAllForUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.collection('wifis')
                .where("user", "==", userId).get()
                .then((querySnapshot) => {
                    resolve(querySnapshot.docs.map((doc) => ({
                        "id": doc.id,
                        "label": doc.data().label
                    })));
                });
        });
    }

    insert(wifi) {
        if (!wifi || !wifi.id || !this.isIdValid(wifi.id)) {
            throw new Error("Invalid wifiId");
        }
        if (!wifi.user) {
            throw new Error("Invalid userId");
        }

        wifi.id = wifi.id.toLowerCase();
        return new Promise((resolve, reject) => {
            wifi.creationDate = new Date();
            this.db.collection('wifis').doc(wifi.id).set(wifi).then((writeResult) => {
                resolve(wifi);
            });
        });
    }

    delete(userId, wifiId) {
        if (!wifiId) {
            throw new Error("Invalid wifiId");
        }

        return new Promise((resolve, reject) => {
            this.db.collection('wifis')
                .where('id', '==', wifiId.toLowerCase())
                .where('user', '==', userId)
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.docs.length != 1) {
                        throw new Error(querySnapshot.docs.length + " wifi to delete found. Only 1 expected")
                    }
                    return querySnapshot.docs.pop().ref.delete();
                }).then((writeResult) => {
                    // actually not needed, but want to contain db objects to Repo                    
                    resolve(true);
                });
        });
    }
}

module.exports = WifiRepository;