"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWord = exports.generateExcel = void 0;
const XLSX = __importStar(require("xlsx"));
const docx_1 = require("docx");
const file_saver_1 = require("file-saver"); // docx might need this or just blob
const types_1 = require("./types");
const generateExcel = (regimen) => {
    const workbook = XLSX.utils.book_new();
    regimen.regimen_core.courses.forEach((course) => {
        const data = [];
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
        // Basic styling/formatting could go here
        XLSX.utils.book_append_sheet(workbook, worksheet, course.course_name.substring(0, 31)); // sheet name limit
    });
    XLSX.writeFile(workbook, `${regimen.regimen_core.regimen_name}_レジメン表.xlsx`);
};
exports.generateExcel = generateExcel;
const generateWord = async (regimen) => {
    const doc = new docx_1.Document({
        sections: [{
                properties: {},
                children: [
                    new docx_1.Paragraph({
                        text: regimen.regimen_core.regimen_name || 'レジメン補完資料',
                        heading: docx_1.HeadingLevel.TITLE,
                    }),
                    new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({ text: `癌腫: ${regimen.regimen_core.cancer_type}`, break: 1 }),
                            new docx_1.TextRun({ text: `治療目的: ${regimen.regimen_core.treatment_purpose}`, break: 1 }),
                        ],
                    }),
                    ...Object.entries(regimen.regimen_support_info).flatMap(([key, value]) => {
                        const titles = {
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
                            new docx_1.Paragraph({
                                text: titles[key] || key,
                                heading: docx_1.HeadingLevel.HEADING_1,
                                spacing: { before: 400 },
                            }),
                            new docx_1.Paragraph({
                                text: value || '（特記事項なし）',
                            }),
                        ];
                    }),
                ],
            }],
    });
    const blob = await docx_1.Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${regimen.regimen_core.regimen_name}_補完資料.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
exports.generateWord = generateWord;
//# sourceMappingURL=exportUtils.js.map