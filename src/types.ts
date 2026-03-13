export type AdministrationMethod = '経口' | '静注' | '点滴' | '皮下注' | '筋注' | '髄注';
export type DoseUnit = 'mg/kg' | 'mg/m2' | 'mg/body' | 'AUC' | 'units/m²' | 'IU/m²' | 'IU/kg' | '手入力';
export type RepeatPattern = '単回' | '連日' | '指定日' | '毎週' | '任意記述';
export type GroupType = '前投薬' | '抗癌剤' | '支持療法' | 'フラッシュ' | '経口' | '補液' | 'その他';
export type CommentType = '前投薬' | '時間指定' | '注意' | '運用' | '任意';

export interface Schedule {
  repeat_pattern: RepeatPattern;
  day_number?: number;
  day_start?: number;
  day_end?: number;
  selected_days?: number[];
  excel_display_hint?: string;
}

export interface Comment {
  comment_type: CommentType;
  text: string;
}

export interface Item {
  item_id: string;
  drug_name_display: string;
  administration_method: AdministrationMethod;
  route_warning?: string;
  dose: string;
  dose_unit: DoseUnit;
  base_solution?: string;
  infusion_rate?: string;
  oral_instruction?: string;
  schedule: Schedule;
  comments: Comment[];
}

export interface Group {
  group_id: string;
  sort_order: number;
  group_no: string;
  group_name: string;
  group_type: GroupType;
  items: Item[];
}

export interface Course {
  course_id: string;
  course_name: string;
  groups: Group[];
}

export interface RegimenCore {
  regimen_name: string;
  cancer_type: string;
  treatment_purpose: string;
  inpatient_outpatient: string;
  interval_days: number;
  reference_sources: string;
  courses: Course[];
}

export interface RegimenSupportInfo {
  basic_info: string;
  indications: string;
  contraindications: string;
  start_criteria: string;
  stop_criteria: string;
  dose_reduction: string;
  adverse_effects_and_management: string;
  references: string;
}

export interface Regimen {
  schema_version: string;
  app_version: string;
  regimen_id: string;
  created_at: string;
  updated_at: string;
  regimen_core: RegimenCore;
  regimen_support_info: RegimenSupportInfo;
}
