class WifisRepository {
    constructor(db) {
        this.db = db;
    }

    // private
    #getDocRef(id) {
        return this.db.collectionGroup('wifis').doc(id);
    }

    getAll() {
        return this.db.collectionGroup('wifis').get();
    }

    get(wifi) {
        return this.#getDocRef(wifi).get();
    }

    insert(wifi) {
        return this.#getDocRef(wifi.id).set(wifi);
    }
}

module.exports = WifisRepository;