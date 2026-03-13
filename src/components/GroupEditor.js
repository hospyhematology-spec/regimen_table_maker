"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const store_1 = require("../store");
const lucide_react_1 = require("lucide-react");
const types_1 = require("../types");
const ItemEditor_1 = __importDefault(require("./ItemEditor"));
const GroupEditor = ({ courseId, groups }) => {
    const { addGroup, deleteGroup, updateGroup, reorderGroups } = (0, store_1.useRegimenStore)();
    const handleToggleGroup = (groupId) => {
        // For now simple list, in real one we might want collapse
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [groups.sort((a, b) => a.sort_order - b.sort_order).map((group, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "card p-0 overflow-hidden border-slate-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-slate-50 border-bottom border-slate-200 p-3 flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "cursor-grab text-slate-400", children: (0, jsx_runtime_1.jsx)(lucide_react_1.GripVertical, { size: 18 }) }), (0, jsx_runtime_1.jsxs)("span", { className: "bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded", children: ["G", index + 1] }), (0, jsx_runtime_1.jsx)("input", { type: "text", className: "bg-transparent font-bold text-slate-700 border-none focus:ring-0 p-0", value: group.group_name, onChange: (e) => updateGroup(courseId, group.group_id, { group_name: e.target.value }), placeholder: "\u30B0\u30EB\u30FC\u30D7\u540D (\u4F8B: \u524D\u6295\u85AC)" }), (0, jsx_runtime_1.jsxs)("select", { className: "text-xs bg-white border border-slate-200 rounded px-1 py-0.5", value: group.group_type, onChange: (e) => updateGroup(courseId, group.group_id, { group_type: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "\u524D\u6295\u85AC", children: "\u524D\u6295\u85AC" }), (0, jsx_runtime_1.jsx)("option", { value: "\u6297\u764C\u5264", children: "\u6297\u764C\u5264" }), (0, jsx_runtime_1.jsx)("option", { value: "\u652F\u6301\u7642\u6CD5", children: "\u652F\u6301\u7642\u6CD5" }), (0, jsx_runtime_1.jsx)("option", { value: "\u30D5\u30E9\u30C3\u30B7\u30E5", children: "\u30D5\u30E9\u30C3\u30B7\u30E5" }), (0, jsx_runtime_1.jsx)("option", { value: "\u7D4C\u53E3", children: "\u7D4C\u53E3" }), (0, jsx_runtime_1.jsx)("option", { value: "\u88DC\u6DB2", children: "\u88DC\u6DB2" }), (0, jsx_runtime_1.jsx)("option", { value: "\u305D\u306E\u4ED6", children: "\u305D\u306E\u4ED6" })] })] }), (0, jsx_runtime_1.jsx)("button", { className: "text-slate-400 hover:text-red-500 p-1", onClick: () => deleteGroup(courseId, group.group_id), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 16 }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 space-y-4", children: (0, jsx_runtime_1.jsx)(ItemEditor_1.default, { courseId: courseId, groupId: group.group_id, items: group.items }) })] }, group.group_id))), (0, jsx_runtime_1.jsxs)("button", { className: "w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2", onClick: () => addGroup(courseId), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 20 }), " \u30B0\u30EB\u30FC\u30D7\u3092\u8FFD\u52A0"] })] }));
};
exports.default = GroupEditor;
//# sourceMappingURL=GroupEditor.js.map