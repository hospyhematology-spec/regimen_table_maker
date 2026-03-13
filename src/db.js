"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRegimensFromDB = exports.deleteRegimenFromDB = exports.saveRegimenToDB = exports.initDB = void 0;
const idb_1 = require("idb");
const types_1 = require("./types");
const DB_NAME = 'regimen-maker-db';
const STORE_NAME = 'regimens';
const DB_VERSION = 1;
const initDB = async () => {
    return (0, idb_1.openDB)(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'regimen_id' });
            }
        },
    });
};
exports.initDB = initDB;
const saveRegimenToDB = async (regimen) => {
    const db = await (0, exports.initDB)();
    await db.put(STORE_NAME, regimen);
};
exports.saveRegimenToDB = saveRegimenToDB;
const deleteRegimenFromDB = async (regimenId) => {
    const db = await (0, exports.initDB)();
    await db.delete(STORE_NAME, regimenId);
};
exports.deleteRegimenFromDB = deleteRegimenFromDB;
const getAllRegimensFromDB = async () => {
    const db = await (0, exports.initDB)();
    return db.getAll(STORE_NAME);
};
exports.getAllRegimensFromDB = getAllRegimensFromDB;
//# sourceMappingURL=db.js.map