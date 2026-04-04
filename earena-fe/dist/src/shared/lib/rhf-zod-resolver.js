"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rhfZodResolver = rhfZodResolver;
const zod_1 = require("@hookform/resolvers/zod");
function rhfZodResolver(schema) {
    return (0, zod_1.zodResolver)(schema);
}
//# sourceMappingURL=rhf-zod-resolver.js.map