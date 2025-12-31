// indexedDB.js
const DB_NAME = "patrol_point_db";
const DB_VERSION = 2;
const STORE_NAME = "report_images";

// * OPEN DB
export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      let store;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      } else {
        store = event.target.transaction.objectStore(STORE_NAME);
      }

      if (!store.indexNames.contains("reportId")) {
        store.createIndex("reportId", "reportId", { unique: false });
      }

      if (!store.indexNames.contains("createdAt")) {
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// * SAVE IMAGES
export const saveImagesToIndexedDB = async (files, reportId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const savedImageKeys = [];

    files.forEach((file) => {
      const imageLocalKey = crypto.randomUUID();

      store.add({
        id: imageLocalKey,
        reportId,
        fileName: file.name,
        blob: file,
        createdAt: Date.now(),
      });

      savedImageKeys.push(imageLocalKey);
    });

    tx.oncomplete = () => resolve(savedImageKeys);
    tx.onerror = () => reject(tx.error);
  });
};

// * GET IMAGES BY REPORT TEMP ID
export const getImagesByReportId = async (reportId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("reportId");

    const request = index.getAll(reportId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// * DELETE IMAGES BY REPORT TEMP ID
export const deleteImagesByReportId = async (reportId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("report_images", "readwrite");
    const store = tx.objectStore("report_images");
    const index = store.index("reportId");

    const request = index.getAllKeys(reportId);

    request.onsuccess = () => {
      request.result.forEach((key) => store.delete(key));
      resolve(true);
    };

    request.onerror = () => reject(request.error);
  });
};
