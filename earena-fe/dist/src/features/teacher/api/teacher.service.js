'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherService = void 0;
const axios_client_1 = require("@/shared/lib/axios-client");
exports.teacherService = {
    getQualifications: async () => {
        const res = await axios_client_1.axiosClient.get('/teachers/qualifications');
        return res.data?.data || res;
    },
    uploadQualification: async (payload) => {
        const res = await axios_client_1.axiosClient.post('/teachers/qualifications', payload);
        return res.data?.data || res;
    },
    deleteQualification: async (index) => {
        const res = await axios_client_1.axiosClient.delete(`/teachers/qualifications/${index}`);
        return res.data?.data || res;
    },
    submitForVerification: async () => {
        const res = await axios_client_1.axiosClient.post('/teachers/qualifications/submit-review');
        return res.data || res;
    },
};
//# sourceMappingURL=teacher.service.js.map