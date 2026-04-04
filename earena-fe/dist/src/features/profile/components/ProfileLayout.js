'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProfileLayout;
const react_1 = require("react");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const useUpdateProfile_1 = require("../hooks/useUpdateProfile");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const PersonalInfoSection_1 = __importDefault(require("./sections/PersonalInfoSection"));
const SecuritySection_1 = __importDefault(require("./sections/SecuritySection"));
const ROLE_MAP = {
    STUDENT: {
        label: 'Học sinh',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
    },
    TEACHER: {
        label: 'Giảng viên',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
    },
    ADMIN: {
        label: 'Quản trị viên',
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
    },
};
function ProfileLayout() {
    const user = (0, auth_store_1.useAuthStore)((state) => state.user);
    const fileInputRef = (0, react_1.useRef)(null);
    const [previewUrl, setPreviewUrl] = (0, react_1.useState)(null);
    const { mutate: updateProfile, isPending: isUploading } = (0, useUpdateProfile_1.useUpdateProfile)();
    if (!user)
        return null;
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            sonner_1.toast.error('Kích thước ảnh tối đa là 5MB');
            if (fileInputRef.current)
                fileInputRef.current.value = '';
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        updateProfile({ payload: {}, avatarFile: file }, {
            onSuccess: () => {
                sonner_1.toast.success('Cập nhật ảnh đại diện thành công');
            },
            onError: () => {
                setPreviewUrl(null);
                if (fileInputRef.current)
                    fileInputRef.current.value = '';
            }
        });
    };
    const displayAvatar = previewUrl || user.avatar;
    const roleDisplay = ROLE_MAP[user.role] || ROLE_MAP.STUDENT;
    return (<div className="max-w-4xl mx-auto flex flex-col gap-8 py-8 px-4 sm:px-6 animate-in fade-in duration-500">
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 lg:p-8 shadow-sm border border-primary/5">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          <div className="relative group cursor-pointer shrink-0" onClick={() => !isUploading && fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg, image/webp" className="hidden"/>

            <div className={`size-32 rounded-full border-4 border-primary/20 overflow-hidden bg-slate-100 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-90'}`}>
              {displayAvatar ? (<img alt="Profile" className="w-full h-full object-cover" src={displayAvatar}/>) : (<span className="text-4xl font-bold text-slate-300">{user.fullName?.charAt(0) || 'U'}</span>)}
            </div>

            <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-transform group-hover:scale-110">
              {isUploading ? (<lucide_react_1.Loader2 size={16} className="animate-spin"/>) : (<lucide_react_1.Camera size={16}/>)}
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left pt-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {user.fullName || 'Người dùng hệ thống'}
            </h2>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${roleDisplay.className}`}>
                {roleDisplay.label}
              </span>

              {user.role === 'TEACHER' && user.subjects && user.subjects.length > 0 && (user.subjects.map((subject) => (<span key={subject.id} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-primary/20">
                    <lucide_react_1.BookOpen size={12}/>
                    {subject.name}
                  </span>)))}

              <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                Đang hoạt động
              </span>
            </div>

            <p className="text-slate-500 text-sm mt-4 flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <lucide_react_1.MapPin size={16} className="text-slate-400"/>
              Việt Nam
            </p>
          </div>
        </div>
      </section>

      <PersonalInfoSection_1.default />

      <SecuritySection_1.default />
    </div>);
}
//# sourceMappingURL=ProfileLayout.js.map