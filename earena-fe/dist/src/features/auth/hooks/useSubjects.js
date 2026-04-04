'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSubjects = exports.SUBJECT_QUERY_KEY = void 0;
const react_query_1 = require("@tanstack/react-query");
const taxonomy_service_1 = require("../api/taxonomy.service");
exports.SUBJECT_QUERY_KEY = ['taxonomy', 'subjects'];
const useSubjects = () => {
    return (0, react_query_1.useQuery)({
        queryKey: exports.SUBJECT_QUERY_KEY,
        queryFn: taxonomy_service_1.taxonomyService.getSubjects,
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
    });
};
exports.useSubjects = useSubjects;
//# sourceMappingURL=useSubjects.js.map