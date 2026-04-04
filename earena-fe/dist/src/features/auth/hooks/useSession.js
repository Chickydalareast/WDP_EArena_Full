'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSession = void 0;
const react_query_1 = require("@tanstack/react-query");
const auth_service_1 = require("../api/auth.service");
const useSession = () => {
    const query = (0, react_query_1.useQuery)({
        queryKey: auth_service_1.authKeys.session(),
        queryFn: auth_service_1.authService.getProfile,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 15,
        retry: false,
    });
    return {
        ...query,
        user: query.data || null,
        isAuthenticated: !!query.data,
    };
};
exports.useSession = useSession;
//# sourceMappingURL=useSession.js.map