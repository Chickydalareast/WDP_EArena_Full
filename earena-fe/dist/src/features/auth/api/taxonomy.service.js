"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxonomyService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
exports.taxonomyService = {
    getSubjects: async () => {
        return axios_client_1.axiosClient.get('/taxonomy/subjects');
    }
};
//# sourceMappingURL=taxonomy.service.js.map