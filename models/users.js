class UsersRepository {
    constructor(db) {
        this.db = db;
    }

    // private
    #getDocRef(user) {
        return this.db.collection('users').doc(user.provider + user.id);
    }

    /* not needed for now
    get(user) {
        return this.getDocRef(user).get();
    }

    insert(user) {
        return this.getDocRef(user).set(user);
    }

    update(user, data) {
        return this.getDocRef(user).update(data);
    }
    */

    upsert(user) {  // update or insert
        return new Promise((resolve, reject) => {
            this.#getDocRef(user).get().then((queryDocumentSnapshot) => {
               if (queryDocumentSnapshot.exists) {
                    // TODO: add other data to merge in
                    var lastLoginDate = new Date();
                    this.#getDocRef(user).update({ "lastLoginDate": lastLoginDate }).then((writeResult) => {
                        user.lastLoginDate = lastLoginDate;
                        resolve(user);
                    }).catch(reject);
                } else {
                    this.#getDocRef(user).set(user).then((writeResult) => {
                        resolve(user);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
}

module.exports = UsersRepository;