"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUpdateProfile = void 0;
const react_query_1 = require("@tanstack/react-query");
const sonner_1 = require("sonner");
const profile_service_1 = require("../api/profile.service");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const auth_service_1 = require("@/features/auth/api/auth.service");
const useUpdateProfile = () => {
    const queryClient = (0, react_query_1.useQueryClient)();
    const setAuth = (0, auth_store_1.useAuthStore)((state) => state.setAuth);
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    return (0, react_query_1.useMutation)({
        mutationFn: async ({ payload, avatarFile }) => {
            let finalPayload = { ...payload };
            if (avatarFile) {
                const uploadedUrl = await profile_service_1.profileService.uploadAvatar(avatarFile);
                finalPayload.avatar = uploadedUrl;
            }
            return profile_service_1.profileService.updateProfile(finalPayload);
        },
        onMutate: async ({ payload }) => {
            await queryClient.cancelQueries({ queryKey: auth_service_1.authKeys.session() });
            const previousUser = queryClient.getQueryData(auth_service_1.authKeys.session());
            if (user) {
                const optimisticUser = { ...user, ...payload };
                queryClient.setQueryData(auth_service_1.authKeys.session(), optimisticUser);
                setAuth(optimisticUser);
            }
            return { previousUser };
        },
        onError: (err, variables, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(auth_service_1.authKeys.session(), context.previousUser);
                setAuth(context.previousUser);
            }
            let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại';
            if (err?.message) {
                errorMsg = Array.isArray(err.message) ? err.message[0] : String(err.message);
            }
            sonner_1.toast.error('Cập nhật thất bại', { description: errorMsg });
        },
        onSuccess: () => {
            sonner_1.toast.success('Cập nhật hồ sơ thành công!');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: auth_service_1.authKeys.session() });
        },
    });
};
exports.useUpdateProfile = useUpdateProfile;
//# sourceMappingURL=useUpdateProfile.js.map