"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMediaUpload = void 0;
const react_1 = require("react");
const sonner_1 = require("sonner");
const cloudinary_direct_image_upload_1 = require("@/shared/lib/cloudinary-direct-image-upload");
function toCloudinaryContext(context) {
    if (context === 'cover')
        return 'course_thumbnail';
    return context;
}
const useMediaUpload = () => {
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const uploadMedia = async (file, context) => {
        setIsUploading(true);
        try {
            const { url } = await (0, cloudinary_direct_image_upload_1.uploadImageDirectToCloudinary)(file, toCloudinaryContext(context));
            return { url };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Hệ thống máy chủ ảnh đang bận. Vui lòng thử lại.';
            sonner_1.toast.error('Lỗi tải tệp tin', {
                description: errorMessage,
            });
            throw error;
        }
        finally {
            setIsUploading(false);
        }
    };
    return { uploadMedia, isUploading };
};
exports.useMediaUpload = useMediaUpload;
//# sourceMappingURL=useMediaUpload.js.map