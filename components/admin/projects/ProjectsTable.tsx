"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Users, CalendarDays, History, Star } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// // Nguồn: Định nghĩa Interface cho Project để quản lý type an toàn
interface Project {
  id: string;
  title: string;
  category: string;
  status: 'planning' | 'ongoing' | 'completed';
  author_ids: string[];
  featured: boolean;
  created_at: string;
  updated_at?: string;
  slug: string;
}

// // Nguồn: Export named function đúng chuẩn để tránh lỗi Element Type Invalid
export function ProjectsTable({ projects, onEdit, onDelete, currentPage, itemsPerPage }: any) {
  
  // // Nguồn: Định dạng thời gian chuẩn Magazine
  const formatTime = (dateString: string) => {
    if (!dateString) return "---";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'ongoing': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'planning': return 'bg-amber-50 text-amber-600 border-amber-100'
      default: return 'bg-slate-50 text-slate-600'
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden font-montserrat">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-[80px] text-center font-black uppercase text-[10px] tracking-widest text-slate-400">Thứ tự</TableHead>
            <TableHead className="min-w-[300px] font-black uppercase text-[10px] tracking-widest text-slate-400 text-left">Thông tin dự án / Lĩnh vực</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Trạng thái</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Nhân sự</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right px-8">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p: Project, index: number) => {
            // // Nguồn: Logic đánh số thứ tự chuẩn theo phân trang
            const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

            return (
              <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-all border-b last:border-0">
                <TableCell className="text-center font-black text-slate-300 text-sm italic">
                  {serialNumber < 10 ? `0${serialNumber}` : serialNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                        {p.title}
                      </span>
                      {p.featured && (
                        <div className="bg-amber-100 p-1 rounded-md">
                          <Star size={10} className="text-amber-600 fill-amber-600" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-blue-500" /> {p.category || 'Chưa phân loại'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(p.status)} font-black uppercase text-[9px] tracking-tighter px-3 py-1 rounded-lg border-2`}>
                    {p.status === 'ongoing' ? 'Đang thực thi' : p.status === 'completed' ? 'Đã hoàn thành' : 'Đang lên lịch'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                       <Users size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 italic">
                       {p.author_ids?.length || 0} Người phụ trách
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 transition-all">
                        <MoreHorizontal size={18} className="text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100 font-montserrat">
                      <DropdownMenuItem onClick={() => onEdit(p)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-blue-50 focus:text-blue-700 transition-all group">
                        <Edit3 className="h-4 w-4 text-slate-400 group-hover:text-blue-600" /> 
                        <span className="font-bold text-xs uppercase tracking-widest">Chỉnh sửa nội dung</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open(`https://msc-center.edu.vn/du-an/${p.slug}`, '_blank')}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-slate-50 transition-all group"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-900" /> 
                        <span className="font-bold text-xs uppercase tracking-widest">Xem thực tế trên Web</span>
                      </DropdownMenuItem>
                      <div className="h-px bg-slate-100 my-1" />
                      <DropdownMenuItem 
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600 text-red-500 transition-all group" 
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400 group-hover:text-red-600" /> 
                        <span className="font-bold text-xs uppercase tracking-widest">Gỡ bỏ dự án này</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  )
}