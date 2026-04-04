"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCloudinaryUpload = void 0;
const react_1 = require("react");
const sonner_1 = require("sonner");
const media_ticket_service_1 = require("../api/media-ticket.service");
const error_parser_1 = require("@/shared/lib/error-parser");
const useCloudinaryUpload = () => {
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const uploadDirectly = async (file, context) => {
        setIsUploading(true);
        setProgress(0);
        try {
            setProgress(5);
            const signatureData = await media_ticket_service_1.mediaTicketService.getCloudinarySignature(context);
            const cloudData = await media_ticket_service_1.mediaTicketService.uploadDirectToCloudinary(file, signatureData, (percent) => {
                setProgress(5 + Math.round(percent * 0.85));
            });
            setProgress(95);
            const syncPayload = {
                publicId: cloudData.public_id,
                format: cloudData.format || file.name.split('.').pop() || 'unknown',
                bytes: cloudData.bytes,
                originalName: file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'),
                context: context,
            };
            const finalMedia = await media_ticket_service_1.mediaTicketService.syncCloudinary(syncPayload);
            setProgress(100);
            return finalMedia;
        }
        catch (error) {
            const parsedError = (0, error_parser_1.parseApiError)(error);
            sonner_1.toast.error('Tải lên đám mây thất bại', {
                description: parsedError.message || 'Quá trình tải tài liệu/hình ảnh bị gián đoạn. Vui lòng thử lại.'
            });
            throw error;
        }
        finally {
            setIsUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };
    return {
        uploadDirectly,
        isUploading,
        progress
    };
};
exports.useCloudinaryUpload = useCloudinaryUpload;
//# sourceMappingURL=useCloudinaryUpload.js.map