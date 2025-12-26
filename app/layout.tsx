"use client"
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "./globals.css"; // DÒNG NÀY PHẢI LUÔN TỒN TẠI
import { Inter } from 'next/font/google';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="vi">
      <body className="antialiased overflow-hidden bg-slate-50">
        <div className="flex h-screen w-full overflow-hidden">
          {/* Sidebar: Cố định bên trái */}
          <AdminSidebar 
            isCollapsed={isCollapsed} 
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
            isOpen={true}
          />

          {/* Main: Phải có min-w-0 và overflow-y-auto để không đẩy Sidebar */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50">
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}