import { openDB, IDBPDatabase } from 'idb';
import { Regimen } from './types';

const DB_NAME = 'regimen-maker-db';
const STORE_NAME = 'regimens';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'regimen_id' });
      }
    },
  });
};

export const saveRegimenToDB = async (regimen: Regimen) => {
  const db = await initDB();
  await db.put(STORE_NAME, regimen);
};

export const deleteRegimenFromDB = async (regimenId: string) => {
  const db = await initDB();
  await db.delete(STORE_NAME, regimenId);
};

export const getAllRegimensFromDB = async (): Promise<Regimen[]> => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
