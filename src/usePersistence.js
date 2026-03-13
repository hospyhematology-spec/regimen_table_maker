"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePersistence = void 0;
const react_1 = require("react");
const store_1 = require("./store");
const db_1 = require("./db");
const usePersistence = () => {
    const { currentRegimen, setRegimens, regimens } = (0, store_1.useRegimenStore)();
    // Load all regimens on mount
    (0, react_1.useEffect)(() => {
        (0, db_1.getAllRegimensFromDB)().then((data) => {
            if (data && data.length > 0) {
                setRegimens(data);
            }
        });
    }, [setRegimens]);
    // Save current regimen on change
    (0, react_1.useEffect)(() => {
        if (currentRegimen) {
            (0, db_1.saveRegimenToDB)(currentRegimen);
        }
    }, [currentRegimen]);
};
exports.usePersistence = usePersistence;
//# sourceMappingURL=usePersistence.js.map