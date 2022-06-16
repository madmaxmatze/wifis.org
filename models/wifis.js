class WifisRepository {
    constructor(db) {
        this.db = db;
    }

    // private
    #getDocRef(id) {
        return this.db.collection('wifis').doc(id);
    }

    getAll() {
        return this.db.collection('wifis').get();
    }

    get(id) {
        return this.#getDocRef(id).get();
    }

    getAllForUser(userId) {
        return this.db.collection('wifis').where("user", "==", userId).get();
    }

    delete(wifi) {
        let query = this.db.collection('wifis').where('id', '==', wifi.id).where('user', '==', wifi.user);
        query.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                doc.ref.delete();
            });
        });

        return this.#getDocRef(wifi.id).delete();
    }

    insert(wifi) {
        return this.#getDocRef(wifi.id).set(wifi);
    }
}

module.exports = WifisRepository;