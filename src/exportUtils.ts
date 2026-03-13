import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
import { Regimen } from './types';

export const generateExcel = (regimen: Regimen) => {
  const workbook = XLSX.utils.book_new();

  regimen.regimen_core.courses.forEach((course) => {
    const data: any[] = [];
    
    // Header Row
    data.push(['施行順', 'グループ', '薬剤名・手技', '用量', '単位', '投与日 (Day)', '投与方法', '希釈液', '速度', 'コメント']);

    course.groups.sort((a, b) => a.sort_order - b.sort_order).forEach((group, gIdx) => {
      group.items.forEach((item, iIdx) => {
        data.push([
          iIdx === 0 ? `G${gIdx + 1}` : '', // Order
          iIdx === 0 ? group.group_name : '', // Group Name
          item.drug_name_display,
          item.dose,
          item.dose_unit,
          item.schedule.excel_display_hint || 'Day 1',
          item.administration_method,
          item.base_solution || '',
          item.infusion_rate || '',
          item.comments[0]?.text || ''
        ]);
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, course.course_name.substring(0, 31));
  });

  XLSX.writeFile(workbook, `${regimen.regimen_core.regimen_name}_レジメン表.xlsx`);
};

export const generateWord = async (regimen: Regimen) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: regimen.regimen_core.regimen_name || 'レジメン補完資料',
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `癌腫: ${regimen.regimen_core.cancer_type}`, break: 1 }),
            new TextRun({ text: `治療目的: ${regimen.regimen_core.treatment_purpose}`, break: 1 }),
          ],
        }),

        ...Object.entries(regimen.regimen_support_info).flatMap(([key, value]) => {
          const titles: Record<string, string> = {
            basic_info: '1. 基本情報',
            indications: '2. 適応症',
            contraindications: '3. 禁忌',
            start_criteria: '4. 投与開始基準',
            stop_criteria: '5. 中止基準',
            dose_reduction: '6. 減量基準',
            adverse_effects_and_management: '7. 副作用と対策',
            references: '8. 参考資料',
          };
          
          return [
            new Paragraph({
              text: titles[key] || key,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400 },
            }),
            new Paragraph({
              text: value || '（特記事項なし）',
            }),
          ];
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${regimen.regimen_core.regimen_name}_補完資料.docx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
