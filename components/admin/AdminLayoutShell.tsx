"use client"
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar cố định bên trái */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        isOpen={true}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-slate-50 scroll-smooth">
        <div className="p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}