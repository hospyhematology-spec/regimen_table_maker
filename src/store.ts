import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Regimen, Course, Group, Item } from './types';

interface RegimenState {
  currentRegimen: Regimen | null;
  regimens: Regimen[];
  setRegimens: (regimens: Regimen[]) => void;
  setCurrentRegimen: (regimen: Regimen | null) => void;
  
  // Actions
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
  reorderItems: (courseId: string, groupId: string, items: Item[]) => void;
}

const createInitialRegimen = (): Regimen => ({
  schema_version: '1.0',
  app_version: '1.0.0',
  regimen_id: uuidv4(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  regimen_core: {
    regimen_name: '',
    cancer_type: '',
    treatment_purpose: '',
    inpatient_outpatient: '外来',
    interval_days: 21,
    reference_sources: '',
    courses: []
  },
  regimen_support_info: {
    basic_info: '',
    indications: '',
    contraindications: '',
    start_criteria: '',
    stop_dose_reduction: '',
    adverse_effects_and_management: '',
    references: ''
  }
});

export const useRegimenStore = create<RegimenState>((set) => ({
  currentRegimen: null,
  regimens: [],
  setRegimens: (regimens) => set({ regimens }),
  setCurrentRegimen: (regimen) => set({ currentRegimen: regimen }),
  
  createNewRegimen: () => {
    const newRegimen = createInitialRegimen();
    set((state) => ({ 
      currentRegimen: newRegimen,
      regimens: [...state.regimens, newRegimen]
    }));
  },
  
  updateRegimenCore: (updates) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      updated_at: new Date().toISOString(),
      regimen_core: { ...state.currentRegimen.regimen_core, ...updates }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  updateSupportInfo: (updates) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      updated_at: new Date().toISOString(),
      regimen_support_info: { ...state.currentRegimen.regimen_support_info, ...updates }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  addCourse: () => set((state) => {
    if (!state.currentRegimen) return state;
    const newCourse: Course = {
      course_id: uuidv4(),
      course_name: `Course ${state.currentRegimen.regimen_core.courses.length + 1}`,
      groups: []
    };
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: [...state.currentRegimen.regimen_core.courses, newCourse]
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  cloneCourse: (courseId) => set((state) => {
    if (!state.currentRegimen) return state;
    const courseToClone = state.currentRegimen.regimen_core.courses.find(c => c.course_id === courseId);
    if (!courseToClone) return state;
    
    const clonedCourse: Course = {
      ...JSON.parse(JSON.stringify(courseToClone)),
      course_id: uuidv4(),
      course_name: `${courseToClone.course_name} (Copy)`
    };
    
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: [...state.currentRegimen.regimen_core.courses, clonedCourse]
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  deleteCourse: (courseId) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.filter(c => c.course_id !== courseId)
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  updateCourse: (courseId, updates) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? { ...c, ...updates } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  addGroup: (courseId) => set((state) => {
    if (!state.currentRegimen) return state;
    const newGroup: Group = {
      group_id: uuidv4(),
      sort_order: 0,
      group_no: '',
      group_name: 'New Group',
      group_type: '抗癌剤',
      items: []
    };
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? { ...c, groups: [...c.groups, newGroup] } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  deleteGroup: (courseId, groupId) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? { ...c, groups: c.groups.filter(g => g.group_id !== groupId) } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  updateGroup: (courseId, groupId, updates) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? {
            ...c,
            groups: c.groups.map(g => g.group_id === groupId ? { ...g, ...updates } : g)
          } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  reorderGroups: (courseId, groups) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? { ...c, groups } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  addItem: (courseId, groupId) => set((state) => {
    if (!state.currentRegimen) return state;
    const newItem: Item = {
      item_id: uuidv4(),
      drug_name_display: '',
      administration_method: '点滴',
      dose: '',
      dose_unit: 'mg/m2',
      base_solution: '生食500mL',
      schedule: {
        repeat_pattern: '単回',
        day_start: 1
      },
      comments: []
    };
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? {
            ...c,
            groups: c.groups.map(g => g.group_id === groupId ? { ...g, items: [...g.items, newItem] } : g)
          } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  deleteItem: (courseId, groupId, itemId) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? {
            ...c,
            groups: c.groups.map(g => g.group_id === groupId ? { ...g, items: g.items.filter(i => i.item_id !== itemId) } : g)
          } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  updateItem: (courseId, groupId, itemId, updates) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? {
            ...c,
            groups: c.groups.map(g => g.group_id === groupId ? {
              ...g,
              items: g.items.map(i => i.item_id === itemId ? { ...i, ...updates } : i)
            } : g)
          } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),

  reorderItems: (courseId, groupId, items) => set((state) => {
    if (!state.currentRegimen) return state;
    const updated = {
      ...state.currentRegimen,
      regimen_core: {
        ...state.currentRegimen.regimen_core,
        courses: state.currentRegimen.regimen_core.courses.map(c => 
          c.course_id === courseId ? {
            ...c,
            groups: c.groups.map(g => g.group_id === groupId ? {
              ...g,
              items
            } : g)
          } : c
        )
      }
    };
    return {
      currentRegimen: updated,
      regimens: state.regimens.map(r => r.regimen_id === updated.regimen_id ? updated : r)
    };
  }),
}));
