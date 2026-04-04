"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdapter = void 0;
const common_1 = require("@nestjs/common");
class FirebaseAdapter {
    logger = new common_1.Logger('FirebaseAdapter_Legacy');
    constructor() {
        this.logger.warn('Class FirebaseAdapter đã bị đóng băng. Luồng code này sẽ không bao giờ được chạy.');
    }
}
exports.FirebaseAdapter = FirebaseAdapter;
//# sourceMappingURL=firebase.provider.js.map