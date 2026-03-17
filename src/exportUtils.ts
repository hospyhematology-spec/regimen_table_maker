import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
import { Regimen } from './types';

export const generateExcel = (regimen: Regimen) => {
  const workbook = XLSX.utils.book_new();

  regimen.regimen_core.courses.forEach((course) => {
    const data: any[][] = [];

    // ---- Title rows ----
    data.push([`${regimen.regimen_core.regimen_name}　レジメン表`]);
    data.push([
      `癌腫: ${regimen.regimen_core.cancer_type}`,
      '',
      `治療目的: ${regimen.regimen_core.treatment_purpose}`,
      '',
      `コース間隔: ${regimen.regimen_core.interval_days}日`,
    ]);
    data.push([]); // blank

    // ---- Header row (matches Step3 columns) ----
    data.push(['G#', 'グループ', '薬剤名（商品名）', '希釈液 / 本体', '投与方法', '用量', '単位', '速度', '投与日 (Day)', 'コメント']);

    course.groups
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((group, gIdx) => {
        group.items.forEach((item, iIdx) => {
          // Join multiple comments with newline
          const allComments = (item.comments || [])
            .map((c, ci) => `${ci > 0 ? '\n' : ''}${c.comment_type !== '任意' ? `[${c.comment_type}] ` : ''}${c.text}`)
            .join('');

          data.push([
            iIdx === 0 ? `G${gIdx + 1}` : '',
            iIdx === 0 ? group.group_name : '',
            item.drug_name_display,
            item.base_solution || '',
            item.administration_method,
            item.dose,
            item.dose_unit,
            item.infusion_rate || '',
            item.schedule?.excel_display_hint || 'Day 1',
            allComments,
          ]);
        });

        // blank row between groups
        data.push([]);
      });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // ---- Column widths ----
    worksheet['!cols'] = [
      { wch: 5 },   // G#
      { wch: 14 },  // グループ
      { wch: 26 },  // 薬剤名
      { wch: 18 },  // 希釈液
      { wch: 8 },   // 方法
      { wch: 8 },   // 用量
      { wch: 9 },   // 単位
      { wch: 12 },  // 速度
      { wch: 16 },  // 投与日
      { wch: 36 },  // コメント
    ];

    // ---- Merge title row A1 across all columns ----
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    ];

    // Freeze top 4 rows (header)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 4 };

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
            new TextRun({ text: `コース間隔: ${regimen.regimen_core.interval_days}日`, break: 1 }),
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
