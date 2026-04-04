'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryProvider = QueryProvider;
const react_query_1 = require("@tanstack/react-query");
const react_1 = require("react");
function QueryProvider({ children }) {
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                gcTime: 1000 * 60 * 15,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    const apiError = error;
                    const status = apiError?.statusCode || error?.response?.status;
                    if (status && status >= 400 && status < 500) {
                        return false;
                    }
                    return failureCount < 2;
                },
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            },
            mutations: {
                retry: 0,
            },
        },
    }));
    return (<react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>);
}
//# sourceMappingURL=QueryProvider.js.map