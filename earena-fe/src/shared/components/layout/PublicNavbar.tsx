// src/shared/components/layout/PublicNavbar.tsx
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { School, Menu } from "lucide-react"; // Đã đồng bộ sang lucide-react thay vì material-icons

export default function PublicNavbar() {
  return (
    <nav className="fixed w-full z-50 top-0 bg-background/95 backdrop-blur-md border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group outline-none">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground group-hover:bg-primary/90 transition-colors shadow-sm">
              <School size={24} />
            </div>
            <span className="font-bold text-2xl text-primary tracking-tight">EArena</span>
          </Link>

          {/* Đã xóa Search Bar ở đây theo quy hoạch mới: Search thuộc về List Pages */}

          {/* Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            <Link
              href="/roles/teacher"
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition"
            >
              Dành cho Giáo viên
            </Link>
            
            <div className="h-6 w-px bg-border hidden md:block mx-1"></div>
            
            <Link
              href="/register"
              className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition"
            >
              Đăng ký
            </Link>
            
            <Button asChild variant="outline" className="hidden md:inline-flex rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm transition-all">
              <Link href="/login">Đăng nhập</Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-muted-foreground hover:text-primary focus:outline-none p-2 -mr-2">
              <Menu size={28} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}