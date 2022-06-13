class UsersRepository {
    constructor(db) {
        this.db = db;
    }

    set(user) {
        const docRef = this.db.collection('users').doc(user.provider + user.id);
        docRef.set(user);
    }
}

module.exports = UsersRepository;