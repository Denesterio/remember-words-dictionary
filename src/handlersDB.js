const connectDB = func => {
  const request = indexedDB.open(window.BASENAME, 1);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const promise = func(request.result);
      if (promise) {
        promise.then(data => resolve(data)).catch(data => reject(data));
      } else {
        resolve(request.result);
      }
    };
    request.onerror = error => {
      reject(error);
    };
  });
};

const getRecord = (rec, store, func) => {
  connectDB(function(db) {
    const request = db
      .transaction([store], 'readonly')
      .objectStore(store)
      .get(rec);
    // request.onerror = logerr;
    request.onsuccess = function() {
      func(request.result ? request.result : -1);
    };
  });
};

const getStore = (store, func) => {
  connectDB(function(db) {
    const storage = db.transaction([store], 'readonly').objectStore(store);
    const cursorRequest = storage.openCursor();
    const allRecords = [];

    cursorRequest.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        allRecords.push(cursor.value);
        cursor.continue();
      } else {
        func(allRecords);
      }
    };

    cursorRequest.onerror = error => {
      console.dir(error);
    };
  });
};

const putRecord = (rec, store) => {
  return connectDB(function(db) {
    return new Promise((resolve, reject) => {
      const request = db
        .transaction([store], 'readwrite')
        .objectStore(store)
        .put(rec);
      request.onsuccess = () => resolve();
      request.onerror = error => reject(error);
    });
  });
};

const getPreparedName = name => name.replaceAll(/( |>|<|(|)|{|}|\$|\^)/g, '');

const createDefaultDicts = profileName => {
  const preparedName = getPreparedName(profileName);
  putRecord(
    {
      nameOfDictionaryAsKey: `${preparedName}русскийанглийский`
    },
    window.DICTSTORE
  );
  putRecord(
    {
      nameOfDictionaryAsKey: `${preparedName}английскийрусский`
    },
    window.DICTSTORE
  );
};

export { getRecord, putRecord, getStore, connectDB, getPreparedName, createDefaultDicts };
