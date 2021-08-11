import { connectDB } from './handlersDB.js';

const handleExportToJson = idbDatabase => {
  return new Promise((resolve, reject) => {
    const exportObject = {};
    if (idbDatabase.objectStoreNames.length === 0) {
      resolve(JSON.stringify(exportObject));
    } else {
      const transaction = idbDatabase.transaction(idbDatabase.objectStoreNames, 'readonly');

      transaction.addEventListener('error', reject);

      for (const storeName of idbDatabase.objectStoreNames) {
        const allObjects = [];
        transaction
          .objectStore(storeName)
          .openCursor()
          .addEventListener('success', event => {
            const cursor = event.target.result;
            if (cursor) {
              allObjects.push(cursor.value);
              cursor.continue();
            } else {
              exportObject[storeName] = allObjects;

              if (idbDatabase.objectStoreNames.length === Object.keys(exportObject).length) {
                resolve(JSON.stringify(exportObject));
              }
            }
          });
      }
    }
  });
};

const handleImportFromJson = (idbDatabase, json) => {
  return new Promise((resolve, reject) => {
    const transaction = idbDatabase.transaction(idbDatabase.objectStoreNames, 'readwrite');
    transaction.addEventListener('error', reject);

    const prepared = JSON.parse(json);
    const importObject = JSON.parse(prepared);
    for (const storeName of idbDatabase.objectStoreNames) {
      let count = 0;
      for (const toAdd of importObject[storeName]) {
        const request = transaction.objectStore(storeName).put(toAdd);
        request.addEventListener('success', () => {
          count++;
          if (count === importObject[storeName].length) {
            delete importObject[storeName];
            if (Object.keys(importObject).length === 0) {
              resolve();
            }
          }
        });
      }
    }
  });
};

const exportToJson = () => {
  return connectDB(handleExportToJson);
};

const importFromJson = json => {
  return connectDB(handleImportFromJson, json);
};

export { exportToJson, importFromJson };
