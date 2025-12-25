"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit3, Trash2, ExternalLink, Users, CalendarDays, History } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function ProjectsTable({ projects, onEdit, onDelete, currentPage, itemsPerPage }: any) {
  
  // Hàm định dạng thời gian tiếng Việt
  const formatTime = (dateString: string) => {
    if (!dateString) return "---";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'planning': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="bg-white">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[60px] text-center font-bold">STT</TableHead>
            <TableHead className="min-w-[200px] font-bold">Thông tin dự án</TableHead>
            <TableHead className="font-bold">Trạng thái</TableHead>
            <TableHead className="font-bold">Đội ngũ</TableHead>
            <TableHead className="font-bold"><div className="flex items-center gap-1"><CalendarDays size={14}/> Ngày tạo</div></TableHead>
            <TableHead className="font-bold"><div className="flex items-center gap-1"><History size={14}/> Cập nhật</div></TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p: any, index: number) => {
            // Tính số thứ tự theo trang
            const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;

            return (
              <TableRow key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="text-center font-medium text-slate-400">
                  #{serialNumber}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(p.status)} font-medium`}>
                    {p.status === 'ongoing' ? 'Đang chạy' : p.status === 'completed' ? 'Hoàn thành' : 'Kế hoạch'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Users size={14} className="text-slate-400" />
                    <span>{p.mentor_ids?.length || 0} Mentor</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatTime(p.created_at)}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatTime(p.updated_at || p.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(p)} className="cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4 text-blue-600" /> Sửa dự án
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => window.open(`/du-an/${p.slug}`, '_blank')}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4 text-slate-600" /> Xem Web
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600" 
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
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