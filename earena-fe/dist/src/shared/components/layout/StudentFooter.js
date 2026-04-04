"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentFooter = StudentFooter;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
function StudentFooter() {
    return (<footer className="bg-card border-t border-border py-8 mt-auto z-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EArena Inc. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground font-medium">
          <link_1.default href="#" className="hover:text-primary transition-colors">Trung tâm trợ giúp</link_1.default>
          <link_1.default href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</link_1.default>
          <link_1.default href="#" className="hover:text-primary transition-colors">Bảo mật</link_1.default>
        </div>
      </div>
    </footer>);
}
//# sourceMappingURL=StudentFooter.js.map