"use client"
import Link from "next/link";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export default function PublicFooter() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm">
                <span className="material-symbols-outlined text-base">school</span>
              </div>
              <span className="font-bold text-xl text-primary">EArena</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nền tảng công nghệ giáo dục giúp học sinh THPT ôn thi hiệu quả, bứt phá điểm số và đỗ nguyện vọng 1.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <span className="material-symbols-outlined text-lg">public</span>
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <span className="material-symbols-outlined text-lg">mail</span>
              </Link>
            </div>
          </div>

          {/* Quick Links 1 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">Tìm lớp theo môn</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Môn Toán</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Môn Vật Lý</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Môn Hóa Học</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Môn Tiếng Anh</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Hướng dẫn sử dụng</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Liên hệ CSKH</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">Đăng ký nhận tin</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Nhận tài liệu ôn thi và bí kíp làm bài mới nhất.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full bg-muted border-border focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                Đăng ký ngay
              </Button>
            </form>
          </div>

        </div>
        
        {/* Bottom copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EArena Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}