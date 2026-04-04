'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionMediaUploader = QuestionMediaUploader;
const react_1 = __importStar(require("react"));
const useCloudinaryUpload_1 = require("@/shared/hooks/useCloudinaryUpload");
const button_1 = require("@/shared/components/ui/button");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function QuestionMediaUploader({ value = [], onChange, disabled, initialMedia }) {
    const { uploadDirectly, isUploading, progress } = (0, useCloudinaryUpload_1.useCloudinaryUpload)();
    const fileInputRef = (0, react_1.useRef)(null);
    const [previews, setPreviews] = (0, react_1.useState)([]);
    const initialMediaIdsString = initialMedia?.map(m => m._id).sort().join(',') || '';
    (0, react_1.useEffect)(() => {
        if (initialMedia && initialMedia.length > 0) {
            const hydratedPreviews = initialMedia.map(m => ({
                id: m._id,
                url: m.url,
                type: m.mimetype.startsWith('image/') ? 'image' : 'audio',
                name: m.originalName
            }));
            setPreviews(hydratedPreviews);
        }
        else if (value.length === 0 && previews.length > 0) {
            setPreviews([]);
        }
    }, [initialMediaIdsString, value.length]);
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        if (!isImage && !isAudio) {
            sonner_1.toast.error('Định dạng không hỗ trợ', { description: 'Chỉ chấp nhận tệp Hình ảnh hoặc Âm thanh (MP3/WAV).' });
            return;
        }
        const maxSize = isAudio ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            sonner_1.toast.error('Tệp quá lớn', {
                description: `Vui lòng chọn ${isAudio ? 'âm thanh dưới 20MB' : 'ảnh dưới 5MB'}.`
            });
            return;
        }
        try {
            const mediaRes = await uploadDirectly(file, 'question');
            if (mediaRes && mediaRes.id) {
                onChange([...value, mediaRes.id]);
                setPreviews(prev => [...prev, {
                        id: mediaRes.id,
                        url: mediaRes.url,
                        type: isImage ? 'image' : 'audio',
                        name: file.name
                    }]);
                sonner_1.toast.success(`Đã đính kèm ${isImage ? 'hình ảnh' : 'âm thanh'} thành công!`);
            }
        }
        catch (error) {
        }
        finally {
            if (fileInputRef.current)
                fileInputRef.current.value = '';
        }
    };
    const removeMedia = (idToRemove) => {
        onChange(value.filter(id => id !== idToRemove));
        setPreviews(prev => prev.filter(p => p.id !== idToRemove));
    };
    return (<div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <lucide_react_1.FileUp className="w-4 h-4 text-blue-500"/> Tệp đính kèm (Ảnh / Bài nghe)
                </label>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*, audio/mpeg, audio/wav, audio/mp3" onChange={handleFileSelect} disabled={disabled || isUploading}/>

                <button_1.Button type="button" variant="outline" size="sm" className="font-semibold text-blue-700 border-blue-200 hover:bg-blue-50" disabled={disabled || isUploading} onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? (<><lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> Đang tải {progress}%</>) : (<>Thêm File Đính Kèm</>)}
                </button_1.Button>
            </div>

            {previews.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t pt-4">
                    {previews.map((media) => (<div key={media.id} className="relative group bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden flex flex-col items-center justify-center">
                            <button type="button" onClick={() => removeMedia(media.id)} disabled={disabled} className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-md shadow-sm transition-all z-10" title="Xóa tệp này">
                                <lucide_react_1.Trash2 className="w-4 h-4"/>
                            </button>

                            {media.type === 'image' ? (<div className="w-full flex justify-center">
                                    <img src={media.url} alt={media.name} className="max-h-[150px] object-contain rounded-md"/>
                                </div>) : (<div className="w-full flex flex-col items-center justify-center py-4 px-2">
                                    <lucide_react_1.Music className="w-8 h-8 text-purple-500 mb-2"/>
                                    <p className="text-xs text-slate-500 font-mono truncate w-full text-center mb-3 px-6">{media.name}</p>
                                    <audio src={media.url} controls className="w-full h-10"/>
                                </div>)}
                        </div>))}
                </div>) : (<div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">Chưa có tệp đính kèm nào.</p>
                </div>)}
        </div>);
}
//# sourceMappingURL=QuestionMediaUploader.js.map