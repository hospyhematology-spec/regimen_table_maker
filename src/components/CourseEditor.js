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
const store_1 = require("../store");
const lucide_react_1 = require("lucide-react");
const GroupEditor_1 = __importDefault(require("./GroupEditor"));
const CourseEditor = () => {
    const { currentRegimen, addCourse, cloneCourse, deleteCourse, updateCourse } = (0, store_1.useRegimenStore)();
    const [activeCourseId, setActiveCourseId] = (0, react_1.useState)(currentRegimen?.regimen_core.courses[0]?.course_id || null);
    if (!currentRegimen)
        return null;
    const courses = currentRegimen.regimen_core.courses;
    const activeCourse = courses.find(c => c.course_id === activeCourseId);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-12 gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "col-span-3 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-slate-700", children: "\u30B3\u30FC\u30B9\u4E00\u89A7" }), (0, jsx_runtime_1.jsx)("button", { className: "p-1 hover:bg-blue-50 text-blue-600 rounded", onClick: addCourse, title: "\u30B3\u30FC\u30B9\u8FFD\u52A0", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 20 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [courses.map((course) => ((0, jsx_runtime_1.jsxs)("div", { className: `flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${activeCourseId === course.course_id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-white border-slate-200 hover:border-blue-400'}`, onClick: () => setActiveCourseId(course.course_id), children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium truncate", children: course.course_name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { className: `p-1 rounded hover:bg-white/20 ${activeCourseId === course.course_id ? 'text-white' : 'text-slate-400'}`, onClick: (e) => { e.stopPropagation(); cloneCourse(course.course_id); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { className: `p-1 rounded hover:bg-white/20 ${activeCourseId === course.course_id ? 'text-white' : 'text-slate-400'}`, onClick: (e) => { e.stopPropagation(); deleteCourse(course.course_id); }, children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, course.course_id))), courses.length === 0 && ((0, jsx_runtime_1.jsx)("div", { className: "text-center py-8 text-slate-400 text-sm italic", children: "\u30B3\u30FC\u30B9\u3092\u8FFD\u52A0\u3057\u3066\u304F\u3060\u3055\u3044" }))] })] }), (0, jsx_runtime_1.jsx)("div", { className: "col-span-9 space-y-6", children: activeCourse ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "card bg-white border-l-4 border-l-blue-600", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-4", children: (0, jsx_runtime_1.jsx)("input", { type: "text", className: "text-xl font-bold bg-transparent border-none focus:ring-0 w-full", value: activeCourse.course_name, onChange: (e) => updateCourse(activeCourse.course_id, { course_name: e.target.value }), placeholder: "\u30B3\u30FC\u30B9\u540D\u3092\u5165\u529B..." }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: (0, jsx_runtime_1.jsx)(GroupEditor_1.default, { courseId: activeCourse.course_id, groups: activeCourse.groups }) })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "card h-[400px] flex items-center justify-center text-slate-400", children: "\u5DE6\u5074\u306E\u30EA\u30B9\u30C8\u304B\u3089\u30B3\u30FC\u30B9\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" })) })] }));
};
exports.default = CourseEditor;
//# sourceMappingURL=CourseEditor.js.map