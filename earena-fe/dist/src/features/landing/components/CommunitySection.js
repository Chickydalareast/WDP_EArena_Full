"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommunitySection;
const link_1 = __importDefault(require("next/link"));
function CommunitySection() {
    return (<section className="py-20 bg-background overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 uppercase tracking-wider">
              Cộng đồng học tập
            </div>
            
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">
              Không học một mình - Hỏi đáp cùng cộng đồng
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Bạn gặp bài khó? Đừng lo. Đặt câu hỏi ngay trên diễn đàn EArena để nhận lời giải chi tiết từ thầy cô và bạn bè. Cùng nhau thảo luận, cùng nhau tiến bộ.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-foreground">Hỏi đáp 24/7 với tốc độ phản hồi nhanh.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-foreground">Chia sẻ tài liệu, bí kíp ôn thi độc quyền.</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
                <span className="text-foreground">Thi đua xếp hạng thành tích mỗi tuần.</span>
              </li>
            </ul>
            
            <link_1.default href="/register" className="inline-flex items-center text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all">
              Tham gia diễn đàn ngay <span className="material-symbols-outlined ml-1">arrow_right_alt</span>
            </link_1.default>
          </div>

          
          <div className="order-1 lg:order-2 relative">
            
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-4 relative z-10">
              
              
              <div className="bg-card p-5 rounded-xl shadow-lg border border-border transform lg:translate-x-8 transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Minh Khang</p>
                    <p className="text-xs text-muted-foreground">20 phút trước • Vật Lý 12</p>
                  </div>
                </div>
                <h4 className="font-bold text-foreground mb-2">
                  Câu 40 đề Lý khó quá, ai giải thích giúp mình đoạn tính gia tốc với?
                </h4>
                <div className="h-20 bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground text-xs border border-border/50">
                  [Hình ảnh câu hỏi]
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">thumb_up</span> 12</span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">comment</span> 15 Comments</span>
                  </div>
                  <span className="flex items-center gap-1 text-primary cursor-pointer font-medium hover:underline">Trả lời</span>
                </div>
              </div>

              
              <div className="bg-card p-5 rounded-xl shadow-lg border border-border opacity-90 scale-95 origin-top-left transition-transform hover:scale-100 hover:opacity-100 hover:z-20 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                    H
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Hương Giang</p>
                    <p className="text-xs text-muted-foreground">1 giờ trước • Toán Học</p>
                  </div>
                </div>
                <h4 className="font-bold text-foreground mb-2">
                  Xin tài liệu chuyên đề Số Phức nâng cao ạ!!!
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Mình đang cần gấp bộ đề ôn tập chương số phức dạng vận dụng cao. Bạn nào có share mình với ạ.
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">thumb_up</span> 45</span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">comment</span> 8 Comments</span>
                  </div>
                  <span className="flex items-center gap-1 text-primary cursor-pointer font-medium hover:underline">Trả lời</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>);
}
//# sourceMappingURL=CommunitySection.js.map