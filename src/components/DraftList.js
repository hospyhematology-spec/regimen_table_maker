"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const fileUtils_1 = require("../fileUtils");
const uuid_1 = require("uuid");
const AIGenerator_1 = __importDefault(require("./AIGenerator"));
const DraftList = ({ onCreateNew, onSelect }) => {
    const { regimens, setCurrentRegimen, setRegimens } = useRegimenStore();
    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const imported = await (0, fileUtils_1.importFromJsonFile)(file);
                // Ensure new ID for imported one if needed? usually import = existing tool.
                // For MVP, just add it.
                const newRegimens = [...regimens, imported];
                setRegimens(newRegimens);
            }
            catch (err) {
                alert('JSONの読み込みに失敗しました。');
            }
        }
    };
    const handleDelete = (id) => {
        if (window.confirm('この下書きを削除しますか？')) {
            const newRegimens = regimens.filter(r => r.regimen_id !== id);
            setRegimens(newRegimens);
        }
    };
    const handleClone = (regimen) => {
        const cloned = {
            ...JSON.parse(JSON.stringify(regimen)),
            regimen_id: (0, uuid_1.v4)(),
            regimen_core: {
                ...regimen.regimen_core,
                regimen_name: `${regimen.regimen_core.regimen_name} (コピー)`
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setRegimens([...regimens, cloned]);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-slate-800", children: "\u4E0B\u66F8\u304D\u4E00\u89A7" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsxs)("label", { className: "btn btn-outline cursor-pointer", children: [(0, jsx_runtime_1.jsx)("input", { type: "file", className: "hidden", accept: ".json", onChange: handleImport }), (0, jsx_runtime_1.jsx)(lucide_react_1.FileJson, { size: 18 }), " JSON\u8AAD\u8FBC"] }), (0, jsx_runtime_1.jsxs)("button", { className: "btn btn-primary", onClick: onCreateNew, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 18 }), " \u65B0\u898F\u4F5C\u6210"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-12 gap-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "col-span-8", children: (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: regimens.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl", children: "\u4E0B\u66F8\u304D\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u65B0\u898F\u4F5C\u6210\u307E\u305F\u306FJSON\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u304F\u3060\u3055\u3044\u3002" })) : (regimens.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((regimen) => ((0, jsx_runtime_1.jsxs)("div", { className: "card hover:border-blue-400 cursor-pointer transition-colors group", onClick: () => {
                                    setCurrentRegimen(regimen);
                                    onSelect();
                                }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-start mb-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-lg text-slate-800 line-clamp-1", children: regimen.regimen_core.regimen_name || '名称未設定' }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [(0, jsx_runtime_1.jsx)("button", { className: "p-1.5 hover:bg-slate-100 rounded text-slate-500", onClick: (e) => { e.stopPropagation(); handleClone(regimen); }, title: "\u8907\u88FD", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 16 }) }), (0, jsx_runtime_1.jsx)("button", { className: "p-1.5 hover:bg-red-50 rounded text-red-500", onClick: (e) => { e.stopPropagation(); handleDelete(regimen.regimen_id); }, title: "\u524A\u9664", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 16 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 text-sm text-slate-500", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsx)("span", { className: "bg-slate-100 px-2 py-0.5 rounded text-xs", children: regimen.regimen_core.cancer_type || '癌腫未設定' }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 mt-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 14 }), (0, jsx_runtime_1.jsxs)("span", { children: ["\u66F4\u65B0: ", new Date(regimen.updated_at).toLocaleString()] })] })] })] }, regimen.regimen_id)))) }) }), (0, jsx_runtime_1.jsx)("div", { className: "col-span-4", children: (0, jsx_runtime_1.jsx)(AIGenerator_1.default, {}) })] })] }));
};
exports.default = DraftList;
//# sourceMappingURL=DraftList.js.map