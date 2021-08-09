import { createDefaultDicts } from './handlersDB.js';

const indexedDB =
  window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// const IDBTransaction =
//   window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;

const createDefaultProfile = db => {
  const name = 'Без названия';
  const transaction = db.transaction(window.PROFILESTORE, 'readonly');
  const defaultProfileRequest = transaction.objectStore(window.PROFILESTORE).get(name);
  defaultProfileRequest.onsuccess = () => {
    if (!defaultProfileRequest.result) {
      console.dir(defaultProfileRequest.result);
      const addProfileTransaction = db.transaction(window.PROFILESTORE, 'readwrite');
      const profile = {
        profileName: name,
        profileLangs: new Set(['английский', 'русский'])
      };
      const addRequest = addProfileTransaction.objectStore(window.PROFILESTORE).add(profile);
      addRequest.onsuccess = function() {
        console.log('Создан профиль по умолчанию');
      };
      addRequest.onerror = function() {
        console.log('Не удалось создать профиль по умолчанию');
      };

      createDefaultDicts(name);
    }
  };
};

export default function initDB() {
  const request = indexedDB.open(window.BASENAME, 1);
  return new Promise(function(resolve, reject) {
    request.onerror = function(error) {
      console.log('Работа приложения невозможна: не удалось получить доступ к хранилищу');
      reject(error);
    };
    request.onsuccess = function() {
      createDefaultProfile(request.result);
      resolve();
    };
    request.onupgradeneeded = function(event) {
      const db = event.currentTarget.result;
      if (db.version === 0 || !db.objectStoreNames.contains(window.PROFILESTORE)) {
        db.createObjectStore(window.PROFILESTORE, {
          keyPath: 'profileName'
        });
        db.createObjectStore(window.DICTSTORE, {
          keyPath: 'nameOfDictionaryAsKey'
        });
      }
      initDB();
    };
  });
}
