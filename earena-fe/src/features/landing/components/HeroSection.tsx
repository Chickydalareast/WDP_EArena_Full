import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden transition-colors duration-200">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary opacity-5 dark:opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-5 dark:opacity-10 blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Cột Trái: Content & CTA */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Ôn thi THPT Quốc Gia
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
              Chinh phục kỳ thi THPT Quốc gia cùng <span className="text-primary">EArena</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Hệ thống luyện thi thông minh với hàng ngàn đề thi thử, chấm điểm tự động và cộng đồng thảo luận học tập sôi nổi nhất.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-1 transition-transform">
                <Link href="/classes">
                  Tìm lớp học ngay
                  <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                </Link>
              </Button>
            </div>
            
            {/* Trust badge */}
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-3">
                {/* Tạm thời dùng thẻ img thuần giống template để không bị văng lỗi cấu hình next/image domain */}
                <img alt="Student 1" className="w-10 h-10 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKhme-P3lFn8xmu_rVqELmGZJPG-xuZVbp4-XVueQ3mndnlAZXeAOg9ahq5U025077wQWBll5L766hDAhZyYiNWriKp5tJZaZ2ekrRmE_EClssPINqsh1Lgjh7ap75lSHMcvwqGcKUKO_QkGziD3bZRbtwr3oLQJkyMn0Bh4K9Yy_qNh-0srQdn-L2Hf4qg0Bw4YvdxmWiw8mPIRXfmHI4fuXiO4YP8Hby2MA6-TWlyttqPfYvsdplQqATk-uLaEqJxcIp1VGPXmI" />
                <img alt="Student 2" className="w-10 h-10 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc1trVD5lmstKTccnA7GQPKYJTkfGiyN6cjZRtxp3qOA2rUs_xXwLIoBnYJn_AQ-E2zoxZUekUeFI9PNzvFeXmfBMz7fpcLQgqew-5LSeh8jWOWanmlqcJw20a1fiGYe2b9GXWTkWmfwTFaeLKQjTtgoFUWhtc-KpuxunIiB2HS1WdmGVFlxPVzyAqan_i-Ec5yyRst96ZKgX5d9UZGcs6oZ6ioJm3nPJynLrcJjw0S5bp9BWKZCEWTn4yJHa36bWAOL7Hv2lJQeM" />
                <img alt="Student 3" className="w-10 h-10 rounded-full border-2 border-background object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDguWID65Gl_IEmQzl8TlPVBxXsxGW7QQawIvyIDWbyJt103jf2-WPlg3WJjgPe3PDR6-rvuzBuzjpN4LFHdpaFELpN-5PkIXM_tMahjOFIF4iarIyDOXFzA5VG20wGzcRI5kThTIFkuY-2A2LmfVTwOKPESg2DjssURf89SYksS_1xTH0IngFGSlKXAxzc0B6gscAOtG5OMo_mRP7ITi3eKQWhg1SaOhHXl-Yyf3G0Ny7S92tgkkk-Zs8iOC-twVBkwzwd9Qw8dnA" />
              </div>
              <p><span className="font-bold text-foreground">50k+</span> Học sinh đã tham gia</p>
            </div>
          </div>

          {/* Cột Phải: Mockup UI (Hiệu ứng tĩnh) */}
          <div className="relative hidden lg:block">
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500">
              
              {/* Mockup Header */}
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-medium">
                  Lớp Toán Thầy Hùng - Bảng tin
                </div>
              </div>

              {/* Mockup Body */}
              <div className="flex h-[400px]">
                {/* Sidebar Mockup */}
                <div className="w-1/4 border-r border-border bg-muted/50 p-4 space-y-4">
                  <div className="h-2 w-1/2 bg-border rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="p-2 bg-background rounded shadow-sm border-l-4 border-primary">
                      <div className="h-2 w-3/4 bg-border rounded mb-1"></div>
                      <div className="h-1.5 w-1/2 bg-border/50 rounded"></div>
                    </div>
                    <div className="p-2 rounded hover:bg-muted">
                      <div className="h-2 w-3/4 bg-border/50 rounded mb-1"></div>
                      <div className="h-1.5 w-1/2 bg-border/50 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Main Content Mockup */}
                <div className="flex-1 p-6 relative">
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-2 text-foreground">Chuyên đề: Hàm số và Đồ thị</h3>
                    <div className="h-40 bg-muted rounded-lg flex items-center justify-center text-muted-foreground mb-4">
                      <span className="material-symbols-outlined text-4xl">play_circle</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-bold">Video bài giảng</span>
                      <span className="px-2 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-bold">Tài liệu PDF</span>
                    </div>
                  </div>

                  {/* Bouncing Comment Mockup */}
                  <div className="absolute bottom-6 right-6 w-64 bg-card rounded-xl shadow-xl border border-border p-4 animate-bounce-slow">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">A</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-foreground">Phạm An</p>
                        <p className="text-xs text-muted-foreground mt-1">Thầy ơi câu 40 giải theo cách đặt ẩn phụ u = sin(x) được không ạ?</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 justify-end items-center">
                      <div className="text-[10px] text-muted-foreground">Vừa xong</div>
                      <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px]">1</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}