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

    insert(wifi) {
        return this.#getDocRef(wifi.id).set(wifi);
    }
}

module.exports = WifisRepository;