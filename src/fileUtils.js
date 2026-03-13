"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFromJsonFile = exports.exportToJsonFile = void 0;
const types_1 = require("./types");
const exportToJsonFile = (regimen) => {
    const dataStr = JSON.stringify(regimen, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${regimen.regimen_core.regimen_name || 'regimen'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};
exports.exportToJsonFile = exportToJsonFile;
const importFromJsonFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result);
                resolve(json);
            }
            catch (e) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
exports.importFromJsonFile = importFromJsonFile;
//# sourceMappingURL=fileUtils.js.map