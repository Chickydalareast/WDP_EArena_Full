"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIFFICULTY_NAME_MAP = void 0;
const question_schema_1 = require("../schemas/question.schema");
exports.DIFFICULTY_NAME_MAP = {
    [question_schema_1.DifficultyLevel.NB]: 'Nhận biết',
    [question_schema_1.DifficultyLevel.TH]: 'Thông hiểu',
    [question_schema_1.DifficultyLevel.VD]: 'Vận dụng',
    [question_schema_1.DifficultyLevel.VDC]: 'Vận dụng cao',
    [question_schema_1.DifficultyLevel.UNKNOWN]: 'Chưa phân loại',
};
//# sourceMappingURL=question.constant.js.map