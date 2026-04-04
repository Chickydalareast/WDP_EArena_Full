"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnalyticsSection;
function AnalyticsSection() {
    return (<section className="py-20 bg-card border-y border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        
        <div className="text-center mb-16">
          <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-3">
            Phân tích chuyên sâu
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-foreground">
            Theo dõi sự tiến bộ của bạn mỗi ngày
          </h3>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Hệ thống tự động phân tích kết quả làm bài để chỉ ra điểm mạnh, điểm yếu, giúp bạn tối ưu thời gian ôn luyện.
          </p>
        </div>

        
        <div className="max-w-5xl mx-auto bg-muted/30 rounded-3xl p-6 md:p-10 shadow-inner border border-border/50">
          <div className="grid md:grid-cols-3 gap-6">
            
            
            <div className="col-span-1 bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center hover:shadow-md transition-shadow">
              <h4 className="font-bold text-foreground mb-6 w-full text-center">Biểu đồ năng lực</h4>
              
              <div className="relative w-48 h-48 flex items-center justify-center">
                
                <div className="absolute inset-0 border border-dashed border-border rounded-full"></div>
                <div className="absolute w-32 h-32 border border-dashed border-border rounded-full"></div>
                <div className="absolute w-16 h-16 border border-dashed border-border rounded-full"></div>
                
                
                <div className="w-full h-full bg-primary/20 absolute transition-all duration-700 ease-in-out hover:bg-primary/30" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}></div>
                
                
                <div className="w-full h-full absolute flex justify-center items-start pt-1 text-[10px] text-muted-foreground font-medium">Toán</div>
                <div className="w-full h-full absolute flex justify-end items-center pr-1 text-[10px] text-muted-foreground font-medium">Lý</div>
                <div className="w-full h-full absolute flex justify-end items-end pb-4 pr-4 text-[10px] text-muted-foreground font-medium">Hóa</div>
                <div className="w-full h-full absolute flex justify-start items-end pb-4 pl-4 text-[10px] text-muted-foreground font-medium">Sinh</div>
                <div className="w-full h-full absolute flex justify-start items-center pl-1 text-[10px] text-muted-foreground font-medium">Anh</div>
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-2xl font-bold text-primary">78%</span>
                <p className="text-xs text-muted-foreground">Mức độ hoàn thành</p>
              </div>
            </div>

            
            <div className="col-span-1 flex flex-col gap-6">
              
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden flex-1 flex flex-col items-center justify-center text-center transform hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
                  <span className="material-symbols-outlined text-8xl rotate-12">emoji_events</span>
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm border border-white/30">
                    <span className="material-symbols-outlined text-3xl">military_tech</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white">Top 1 Tuần</h4>
                  <p className="text-white/90 text-sm mt-1">Dẫn đầu bảng xếp hạng lớp Toán</p>
                </div>
              </div>

              
              <div className="bg-background p-6 rounded-2xl shadow-sm border border-border flex-1 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-foreground">Mục tiêu ngày</h4>
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">3/5 Đề</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: "60%" }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Cố lên! Bạn còn 2 đề nữa.</p>
              </div>
            </div>

            
            <div className="col-span-1 bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-foreground">Kho lưu trữ</h4>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">more_horiz</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 flex-1">
                
                <div className="bg-blue-500/10 rounded-xl p-3 flex flex-col justify-between aspect-square cursor-pointer hover:bg-blue-500/20 transition-colors border border-blue-500/10">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">bookmark</span>
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-2 leading-tight">Câu hay Toán</span>
                </div>
                
                
                <div className="bg-pink-500/10 rounded-xl p-3 flex flex-col justify-between aspect-square cursor-pointer hover:bg-pink-500/20 transition-colors border border-pink-500/10">
                  <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">error</span>
                  <span className="text-xs font-semibold text-pink-700 dark:text-pink-300 mt-2 leading-tight">Câu làm sai</span>
                </div>
                
                
                <button className="col-span-2 bg-muted/50 rounded-xl p-3 flex items-center justify-center border-2 border-dashed border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
                  <span className="material-symbols-outlined text-muted-foreground group-hover:text-primary transition-colors">add</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>);
}
//# sourceMappingURL=AnalyticsSection.js.map