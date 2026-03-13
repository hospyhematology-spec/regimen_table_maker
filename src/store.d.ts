import { Regimen, Course, Group, Item } from './types';
interface RegimenState {
    currentRegimen: Regimen | null;
    regimens: Regimen[];
    setRegimens: (regimens: Regimen[]) => void;
    setCurrentRegimen: (regimen: Regimen | null) => void;
    createNewRegimen: () => void;
    updateRegimenCore: (core: Partial<Regimen['regimen_core']>) => void;
    updateSupportInfo: (info: Partial<Regimen['regimen_support_info']>) => void;
    addCourse: () => void;
    cloneCourse: (courseId: string) => void;
    deleteCourse: (courseId: string) => void;
    updateCourse: (courseId: string, updates: Partial<Course>) => void;
    addGroup: (courseId: string) => void;
    deleteGroup: (courseId: string, groupId: string) => void;
    updateGroup: (courseId: string, groupId: string, updates: Partial<Group>) => void;
    reorderGroups: (courseId: string, groups: Group[]) => void;
    addItem: (courseId: string, groupId: string) => void;
    deleteItem: (courseId: string, groupId: string, itemId: string) => void;
    updateItem: (courseId: string, groupId: string, itemId: string, updates: Partial<Item>) => void;
}
export declare const useRegimenStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RegimenState>>;
export {};
//# sourceMappingURL=store.d.ts.map