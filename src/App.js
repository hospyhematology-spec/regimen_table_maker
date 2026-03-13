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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const store_1 = require("./store");
const usePersistence_1 = require("./usePersistence");
const DraftList_1 = __importDefault(require("./components/DraftList"));
const BasicInfoForm_1 = __importDefault(require("./components/BasicInfoForm"));
const CourseEditor_1 = __importDefault(require("./components/CourseEditor"));
const SupportInfoForm_1 = __importDefault(require("./components/SupportInfoForm"));
const OutputPage_1 = __importDefault(require("./components/OutputPage"));
const lucide_react_1 = require("lucide-react");
const App = () => {
    (0, usePersistence_1.usePersistence)();
    const [currentScreen, setCurrentScreen] = (0, react_1.useState)('list');
    const { currentRegimen, createNewRegimen } = (0, store_1.useRegimenStore)();
    const navigateTo = (screen) => {
        if (screen !== 'list' && !currentRegimen) {
            alert('レジメンを選択または新規作成してください。');
            return;
        }
        setCurrentScreen(screen);
    };
    const handleCreateNew = () => {
        createNewRegimen();
        setCurrentScreen('basic');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-slate-50", children: [(0, jsx_runtime_1.jsxs)("header", { className: "header glass", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mr-8", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "text-blue-600" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold", children: "\u6297\u764C\u5264\u30EC\u30B8\u30E1\u30F3\u4F5C\u6210" })] }), (0, jsx_runtime_1.jsxs)("nav", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsxs)("button", { className: `nav-link ${currentScreen === 'list' ? 'active' : ''}`, onClick: () => setCurrentScreen('list'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.List, { size: 18, className: "inline mr-1" }), " \u4E0B\u66F8\u304D\u4E00\u89A7"] }), (0, jsx_runtime_1.jsx)("button", { className: `nav-link ${currentScreen === 'basic' ? 'active' : ''}`, onClick: () => navigateTo('basic'), children: "\u57FA\u672C\u60C5\u5831" }), (0, jsx_runtime_1.jsx)("button", { className: `nav-link ${currentScreen === 'course' ? 'active' : ''}`, onClick: () => navigateTo('course'), children: "\u30B3\u30FC\u30B9\u30FB\u65BD\u884C\u9806" }), (0, jsx_runtime_1.jsx)("button", { className: `nav-link ${currentScreen === 'support' ? 'active' : ''}`, onClick: () => navigateTo('support'), children: "\u88DC\u5B8C\u8CC7\u6599" }), (0, jsx_runtime_1.jsxs)("button", { className: `nav-link ${currentScreen === 'output' ? 'active' : ''}`, onClick: () => navigateTo('output'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 18, className: "inline mr-1" }), " \u51FA\u529B"] })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "container", children: [currentScreen === 'list' && ((0, jsx_runtime_1.jsx)(DraftList_1.default, { onCreateNew: handleCreateNew, onSelect: () => setCurrentScreen('basic') })), currentScreen === 'basic' && currentRegimen && (0, jsx_runtime_1.jsx)(BasicInfoForm_1.default, {}), currentScreen === 'course' && currentRegimen && (0, jsx_runtime_1.jsx)(CourseEditor_1.default, {}), currentScreen === 'support' && currentRegimen && (0, jsx_runtime_1.jsx)(SupportInfoForm_1.default, {}), currentScreen === 'output' && currentRegimen && (0, jsx_runtime_1.jsx)(OutputPage_1.default, {})] })] }));
};
exports.default = App;
//# sourceMappingURL=App.js.map