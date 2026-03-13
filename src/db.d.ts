import { IDBPDatabase } from 'idb';
import { Regimen } from './types';
export declare const initDB: () => Promise<IDBPDatabase>;
export declare const saveRegimenToDB: (regimen: Regimen) => Promise<void>;
export declare const deleteRegimenFromDB: (regimenId: string) => Promise<void>;
export declare const getAllRegimensFromDB: () => Promise<Regimen[]>;
//# sourceMappingURL=db.d.ts.map