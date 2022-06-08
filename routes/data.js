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
