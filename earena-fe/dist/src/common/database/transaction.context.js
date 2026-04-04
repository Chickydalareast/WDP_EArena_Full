"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionContext = void 0;
const async_hooks_1 = require("async_hooks");
exports.transactionContext = new async_hooks_1.AsyncLocalStorage();
//# sourceMappingURL=transaction.context.js.map