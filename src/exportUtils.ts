import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  NumberFormat,
  convertInchesToTwip,
} from 'docx';
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

// ─────────────────────────────────────────────────────────────────────────────
// Word出力ユーティリティ
// ─────────────────────────────────────────────────────────────────────────────

/** インデントレベルを判定するヘルパー */
function getIndent(line: string): number {
  const match = line.match(/^(\s+)/);
  if (!match) return 0;
  return Math.floor(match[1].length / 2); // 2スペース = 1レベル
}

/** 1行のテキストからWordのParagraphを生成する */
function lineToWordParagraph(line: string): Paragraph {
  const trimmed = line.trim();
  const nestLevel = getIndent(line);

  // 空行
  if (!trimmed) {
    return new Paragraph({ text: '', spacing: { after: 60 } });
  }

  // 大項目の薬剤区分「・薬剤A）」などの行
  if (/^・.+）.*$/.test(trimmed)) {
    return new Paragraph({
      children: [
        new TextRun({
          text: trimmed,
          bold: true,
          size: 22, // 11pt
        }),
      ],
      spacing: { before: 160, after: 60 },
      indent: { left: convertInchesToTwip(0.1) },
    });
  }

  // 箇条書き（・または-で始まる行）
  if (/^[・\-－–]/.test(trimmed)) {
    const content = trimmed.replace(/^[・\-－–]\s*/, '');
    return new Paragraph({
      children: [
        new TextRun({
          text: '• ' + content,
          size: 21, // 10.5pt
        }),
      ],
      spacing: { before: 40, after: 40 },
      indent: { left: convertInchesToTwip(0.2 + nestLevel * 0.2) },
    });
  }

  // 数字で始まる行（バンクーバー形式の引用番号など）
  if (/^\d+\./.test(trimmed)) {
    return new Paragraph({
      children: [
        new TextRun({
          text: trimmed,
          size: 21,
        }),
      ],
      spacing: { before: 60, after: 60 },
      indent: { left: convertInchesToTwip(0.1) },
    });
  }

  // 通常の本文行
  return new Paragraph({
    children: [
      new TextRun({
        text: trimmed,
        size: 21,
      }),
    ],
    spacing: { before: 40, after: 40 },
  });
}

/** セクションテキストをWord Paragraphの配列に変換 */
function textToWordParagraphs(text: string): Paragraph[] {
  if (!text || !text.trim()) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: '（特記事項なし）',
            italics: true,
            color: '888888',
            size: 21,
          }),
        ],
        spacing: { after: 80 },
      }),
    ];
  }

  const lines = text.split(/\r?\n/);
  return lines.map(lineToWordParagraph);
}

export const generateWord = async (regimen: Regimen) => {
  const info = regimen.regimen_support_info as any;

  // セクション定義（5.中止/減量基準は統合済み）
  const sections: { key: string; title: string }[] = [
    { key: 'basic_info',                   title: '1. 基本情報' },
    { key: 'indications',                  title: '2. 適応症' },
    { key: 'contraindications',            title: '3. 禁忌' },
    { key: 'start_criteria',              title: '4. 投与開始基準' },
    { key: 'stop_dose_reduction',         title: '5. 中止/減量基準' },
    { key: 'adverse_effects_and_management', title: '6. 副作用と対策' },
    { key: 'references',                  title: '7. 参考資料' },
  ];

  const children: Paragraph[] = [
    // ドキュメントタイトル
    new Paragraph({
      children: [
        new TextRun({
          text: regimen.regimen_core.regimen_name || 'レジメン補完資料',
          bold: true,
          size: 36, // 18pt
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // メタ情報（癌腫・治療目的・コース間隔）
    new Paragraph({
      children: [
        new TextRun({ text: `癌腫: ${regimen.regimen_core.cancer_type}　　`, size: 22 }),
        new TextRun({ text: `治療目的: ${regimen.regimen_core.treatment_purpose}　　`, size: 22 }),
        new TextRun({ text: `コース間隔: ${regimen.regimen_core.interval_days}日`, size: 22 }),
      ],
      spacing: { after: 300 },
    }),
  ];

  for (const section of sections) {
    const value: string = info[section.key] ?? '';

    // セクション見出し
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 26, // 13pt
            color: '1F3864',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        border: {
          bottom: {
            color: '4472C4',
            space: 3,
            style: 'single',
            size: 6,
          },
        },
      })
    );

    // セクション内容
    const contentParagraphs = textToWordParagraphs(value);
    children.push(...contentParagraphs);

    // セクション後のスペース
    children.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }

  const doc = new Document({
    numbering: {
      config: [],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.2),
          },
        },
      },
      children,
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
