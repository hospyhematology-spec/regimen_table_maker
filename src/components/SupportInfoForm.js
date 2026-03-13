"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const store_1 = require("../store");
const lucide_react_1 = require("lucide-react");
const SupportInfoForm = () => {
    const { currentRegimen, updateSupportInfo } = (0, store_1.useRegimenStore)();
    if (!currentRegimen)
        return null;
    const info = currentRegimen.regimen_support_info;
    const handleChange = (e) => {
        updateSupportInfo({ [e.target.name]: e.target.value });
    };
    const sections = [
        { id: 'basic_info', label: '1. 基本情報', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Info, { size: 18 }), placeholder: 'レジメンの概要、標準的な投与スケジュールなど' },
        { id: 'indications', label: '2. 適応症', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 18 }), placeholder: '薬剤ごとの保険適応状況など' },
        { id: 'contraindications', label: '3. 禁忌', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertOctagon, { size: 18 }), placeholder: '絶対禁忌、慎重投与など' },
        { id: 'start_criteria', label: '4. 投与開始基準', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 18 }), placeholder: '白血球数、血小板数、肝機能、腎機能などの基準' },
        { id: 'stop_criteria', label: '5. 中止基準', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.StopCircle, { size: 18 }), placeholder: '治療を完全に終了する基準' },
        { id: 'dose_reduction', label: '6. 減量基準', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowDownCircle, { size: 18 }), placeholder: '副作用発生時の段階的な減量規定' },
        { id: 'adverse_effects_and_management', label: '7. 副作用と対策', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 18 }), placeholder: '主な副作用（下痢、しびれ、アレルギー等）と具体的な対処法' },
        { id: 'references', label: '8. 参考資料', icon: (0, jsx_runtime_1.jsx)(lucide_react_1.Bookmark, { size: 18 }), placeholder: '引用文献、URLなど' },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto space-y-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-between items-center", children: (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-slate-800", children: "\u88DC\u5B8C\u8CC7\u6599\uFF08Word\u51FA\u529B\u7528\uFF09" }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: sections.map((section) => ((0, jsx_runtime_1.jsxs)("div", { className: "card bg-white p-6 transition-shadow hover:shadow-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mb-3 text-blue-700 font-bold border-b border-slate-100 pb-2", children: [section.icon, (0, jsx_runtime_1.jsx)("label", { htmlFor: section.id, children: section.label })] }), (0, jsx_runtime_1.jsx)("textarea", { id: section.id, name: section.id, className: "input min-h-[120px] bg-slate-50 border-none focus:bg-white transition-colors", placeholder: section.placeholder, value: info[section.id], onChange: handleChange })] }, section.id))) })] }));
};
exports.default = SupportInfoForm;
//# sourceMappingURL=SupportInfoForm.js.map