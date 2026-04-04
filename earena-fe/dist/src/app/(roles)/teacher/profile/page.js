"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = TeacherProfilePage;
const ProfileLayout_1 = __importDefault(require("@/features/profile/components/ProfileLayout"));
exports.metadata = {
    title: 'Hồ sơ Giáo viên | EArena',
    description: 'Quản lý thông tin hồ sơ giáo viên của bạn trên hệ thống EArena',
};
function TeacherProfilePage() {
    return <ProfileLayout_1.default />;
}
//# sourceMappingURL=page.js.map