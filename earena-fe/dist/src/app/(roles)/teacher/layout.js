"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TeacherLayout;
const react_1 = __importDefault(require("react"));
const AppNavbar_1 = require("@/shared/components/layout/AppNavbar");
const StudentFooter_1 = require("@/shared/components/layout/StudentFooter");
function TeacherLayout({ children, }) {
    return (<div className="bg-background text-foreground antialiased min-h-screen flex flex-col transition-colors duration-200">
      <AppNavbar_1.AppNavbar />
      
      <main className="flex-1 pt-24 pb-12 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <StudentFooter_1.StudentFooter />
    </div>);
}
//# sourceMappingURL=layout.js.map