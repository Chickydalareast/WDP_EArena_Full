"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SmartNavbarWrapper;
const headers_1 = require("next/headers");
const PublicNavbar_1 = __importDefault(require("./PublicNavbar"));
const AppNavbar_1 = require("./AppNavbar");
async function SmartNavbarWrapper() {
    const headersList = await (0, headers_1.headers)();
    const isAuth = headersList.get('x-is-auth') === 'true';
    if (isAuth) {
        return <AppNavbar_1.AppNavbar />;
    }
    return <PublicNavbar_1.default />;
}
//# sourceMappingURL=SmartNavbarWrapper.js.map