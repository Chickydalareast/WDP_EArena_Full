"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FeaturedClasses;
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/shared/components/ui/button");
const MOCK_CLASSES = [
    {
        id: "class-1",
        title: "Lớp Toán 12 - Thầy Hùng",
        description: "Chuyên đề hàm số, tích phân và hình học không gian.",
        teacherAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuyC-w-mV6WTvdGRarE7FGPP0-g5xlK8KFhXRJSEGxgswT18UwxdPx_kpiSUJwyIDwJjCNl4I7B_-hybJEWyM-r1kjQYB9W3p5JQ80L7u7AWNT_P7B-AOM6ue7upi-vNNWs7sl2nJ_P-XxPc-qeW118nZFtYB7qEuATXHVMsTyZtmR183j7C5U8nMpkFbSSZTHDcC1TaiDKtVUgb0OUI9xyFaBgMts3o4pDj5J3B-e4SaxunM1rm0AzqeliZftRZlgfV5ScTekP9k",
        coverGradient: "from-blue-500 to-indigo-600",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiJSvTOQWw0Au6Zis70fNSYYD9luY9cAjWwFlc00kR5anj1IGArNh5A3SqBlKwIQ5UBzkM5stR-tVnwmsQqkMcHEpDuVqZIyQp6fqBKdknFHonsO1LHrvgfYQg2OTQlICPgK1H36VqXGvFx4HmqLXtqKNh3uGIKq5fGmqHqhRLXt1I6kouOYT1ONwNO4-nqVEe4Koiko-wo1gVCDEZe36r9d7XWKDq-zU3sp-vYIOE0_SprFWiFRymOFuZQB0AH68AM85XN021zCs",
        memberCount: "1.2k",
        examCount: "50+",
        isEnrolling: true,
    },
    {
        id: "class-2",
        title: "Luyện đề Vật Lý Cô Lan",
        description: "Tổng ôn lý thuyết và giải đề tốc độ cao 30s/câu.",
        teacherAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8-Tgi-adFh1hCFq5DCL8lmiw6OJzcW9DwoHBGndp4jThFT51tV3N9FNvUnmOPVQwFpJ47pnsQGNLAh28pDDSkxB2diiWU-C4NVdJrG2WKnLm3RSP3OXoYtlBfKxKRHJ2vgJ8ccvmlRuAC_FL8VTP_o5HGqW-RhmkWT2TzeRWXGWXsX3pz4hH_w7aOJ5FdjfVNkxeoKbIzo5Dv1w97fNHpzp-NNI9_PZpVDWuyzuOkJt_hgUWGR8HYctqZxVhMUUdm7Zzj1MzOxbU",
        coverGradient: "from-purple-500 to-primary",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB1OI7YAJ7jxxR9wJtTO3KqDFhy5Jp-iRuA7DmdqUM2hmPuaLVQXUD9twmsA4XmFy6c2swzh-tWuSqCW0EOx56N1YUoWhz4udTZE39GshZqPoOaE-m3XW0NQW-wRnbbDrngoj8VQNKyQQNRme8BnX2YllZp_s-usx2i21Oj1LxP5yr8NewEOXyPu8jUxsaWL7hP_wkeEVFW7olTY2TQ7Grw57ZCil3Tz2nX2gzUbWEVE2GSxCAJNjQMcI1I9-b3F0F9oasFIoWxWQ",
        memberCount: "850",
        examCount: "30+",
        isEnrolling: false,
    },
    {
        id: "class-3",
        title: "Tiếng Anh THPT QG",
        description: "Nắm chắc ngữ pháp và kỹ năng đọc hiểu 8+.",
        teacherAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCc1trVD5lmstKTccnA7GQPKYJTkfGiyN6cjZRtxp3qOA2rUs_xXwLIoBnYJn_AQ-E2zoxZUekUeFI9PNzvFeXmfBMz7fpcLQgqew-5LSeh8jWOWanmlqcJw20a1fiGYe2b9GXWTkWmfwTFaeLKQjTtgoFUWhtc-KpuxunIiB2HS1WdmGVFlxPVzyAqan_i-Ec5yyRst96ZKgX5d9UZGcs6oZ6ioJm3nPJynLrcJjw0S5bp9BWKZCEWTn4yJHa36bWAOL7Hv2lJQeM",
        coverGradient: "from-orange-400 to-red-500",
        coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDguWID65Gl_IEmQzl8TlPVBxXsxGW7QQawIvyIDWbyJt103jf2-WPlg3WJjgPe3PDR6-rvuzBuzjpN4LFHdpaFELpN-5PkIXM_tMahjOFIF4iarIyDOXFzA5VG20wGzcRI5kThTIFkuY-2A2LmfVTwOKPESg2DjssURf89SYksS_1xTH0IngFGSlKXAxzc0B6gscAOtG5OMo_mRP7ITi3eKQWhg1SaOhHXl-Yyf3G0Ny7S92tgkkk-Zs8iOC-twVBkwzwd9Qw8dnA",
        memberCount: "2.1k",
        examCount: "80+",
        isEnrolling: false,
    },
];
function FeaturedClasses() {
    return (<section className="py-16 bg-card border-t border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-2">
              Khám phá lớp học
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground">
              Các lớp ôn luyện nổi bật
            </h3>
          </div>
          <link_1.default href="/classes" className="hidden sm:flex items-center text-primary font-semibold hover:text-primary/80 transition">
            Xem tất cả <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
          </link_1.default>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_CLASSES.map((cls) => (<div key={cls.id} className="group bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              
              <div className={`h-32 bg-gradient-to-r ${cls.coverGradient} relative`}>
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('${cls.coverImage}')` }}></div>
              </div>

              
              <div className="px-6 pb-6 relative flex-1 flex flex-col">
                <div className="flex justify-between items-end -mt-8 mb-4">
                  
                  <div className="relative">
                    
                    <img alt="Teacher" className="w-16 h-16 rounded-full border-4 border-background object-cover bg-background" src={cls.teacherAvatar}/>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background text-white text-[10px]">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                    </div>
                  </div>
                  
                  
                  {cls.isEnrolling && (<span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">
                      Đang tuyển sinh
                    </span>)}
                </div>

                <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {cls.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {cls.description}
                </p>

                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 border-t border-border pt-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">group</span>
                    <span>{cls.memberCount} thành viên</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">quiz</span>
                    <span>{cls.examCount} đề thi</span>
                  </div>
                </div>

                
                <button_1.Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  Xem thông tin
                </button_1.Button>
              </div>
            </div>))}
        </div>

        
        <div className="mt-8 text-center sm:hidden">
          <link_1.default href="/classes" className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition">
            Xem tất cả <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
          </link_1.default>
        </div>

      </div>
    </section>);
}
//# sourceMappingURL=FeaturedClasses.js.map