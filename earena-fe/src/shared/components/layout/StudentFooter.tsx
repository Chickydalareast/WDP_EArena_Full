import React from 'react';
import Link from 'next/link';

export function StudentFooter() {
  return (
    <footer className="bg-card border-t border-border py-8 mt-auto z-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} EArena Inc. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground font-medium">
          <Link href="#" className="hover:text-primary transition-colors">Trung tâm trợ giúp</Link>
          <Link href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
          <Link href="#" className="hover:text-primary transition-colors">Bảo mật</Link>
        </div>
      </div>
    </footer>
  );
}