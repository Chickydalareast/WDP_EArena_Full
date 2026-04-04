"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTicketUpload = void 0;
const react_1 = require("react");
const sonner_1 = require("sonner");
const media_ticket_service_1 = require("../api/media-ticket.service");
const error_parser_1 = require("@/shared/lib/error-parser");
const useTicketUpload = () => {
    const [isUploading, setIsUploading] = (0, react_1.useState)(false);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const uploadWithTicket = async (file, providerType, context) => {
        setIsUploading(true);
        setProgress(0);
        try {
            const ticketPayload = {
                fileName: file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'),
                mimeType: file.type,
                size: file.size,
                context,
            };
            const { mediaId, uploadUrl } = await media_ticket_service_1.mediaTicketService.requestVideoTicket(ticketPayload);
            setProgress(5);
            await media_ticket_service_1.mediaTicketService.uploadDirectToDrive(uploadUrl, file, (percent) => {
                setProgress(5 + Math.round(percent * 0.9));
            });
            setProgress(95);
            const finalMedia = await media_ticket_service_1.mediaTicketService.confirmUpload({ mediaId });
            setProgress(100);
            return finalMedia;
        }
        catch (error) {
            const parsedError = (0, error_parser_1.parseApiError)(error);
            sonner_1.toast.error('Lỗi tải video bài giảng', {
                description: parsedError.message || 'Máy chủ Google Drive từ chối kết nối. Vui lòng thử lại.'
            });
            throw error;
        }
        finally {
            setIsUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };
    return {
        uploadWithTicket,
        isUploading,
        progress
    };
};
exports.useTicketUpload = useTicketUpload;
//# sourceMappingURL=useTicketUpload.js.map