"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BypassTransform = exports.BYPASS_TRANSFORM_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.BYPASS_TRANSFORM_KEY = 'bypassTransform';
const BypassTransform = () => (0, common_1.SetMetadata)(exports.BYPASS_TRANSFORM_KEY, true);
exports.BypassTransform = BypassTransform;
//# sourceMappingURL=bypass-transform.decorator.js.map