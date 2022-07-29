class UserRepository {
    constructor(db) {
        this.db = db;
    }

    // private
    #getDocRef(userId) {
        return this.db.collection('users').doc(userId.toLowerCase());
    }

    async get(userId) {
        if (!userId) {
            throw new Error("Invalid userId");
        }
        return new Promise((resolve, reject) => {
            this.#getDocRef(userId).get().then(documentSnapshot => {
                resolve(documentSnapshot.exists ? documentSnapshot.data() : null);
            });
        });
    }

    /* not needed for now
    insert(user) {
        return this.getDocRef(user).set(user);
    }

    update(user, data) {
        return this.getDocRef(user).update(data);
    }
    */

    upsert(user) {  // update or insert
        return new Promise((resolve, reject) => {
            this.#getDocRef(user.id).get().then((queryDocumentSnapshot) => {
               if (queryDocumentSnapshot.exists) {
                    // TODO: add other data to merge in
                    var lastLoginDate = new Date();
                    this.#getDocRef(user.id).update({ "lastLoginDate": lastLoginDate }).then((writeResult) => {
                        user.lastLoginDate = lastLoginDate;
                        resolve(user);
                    }).catch(reject);
                } else {
                    this.#getDocRef(user.id).set(user).then((writeResult) => {
                        resolve(user);
                    }).catch(reject);
                }
            }).catch(reject);
        });
    }
}

module.exports = UserRepository;




// const Firestore = require('@google-cloud/firestore');
// const { readFileSync } = require('fs');

/*
        const db = new Firestore({
            projectId: 'node-test-351811',
            keyFilename: 'node-test-firestore.json',
        });
    
        var promise = deleteCollection(db, 'users', 500);

        promise.finally(() => {
            console.log("users collection deleted");

            for (var i = 0; i<100; i++) {
                var rand = Math.random();
                const docRef = db.collection('users').doc('mathias' + rand);
            
                docRef.set({
                    first: 'Mathias' + rand,
                    last: 'Nitzsche',
                    born: 1983 + rand
                });
            }
            console.log("100 users created");
        });
        */

        
/*
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
  
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      // When there are no documents left, we are done
      resolve();
      return;
    }
  
    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  
    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve);
    });
  }
*/
