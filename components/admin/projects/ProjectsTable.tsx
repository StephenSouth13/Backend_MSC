//D:\MSC\Backend_MSC\components\admin\projects\ProjectsTable.tsx
"use client"

import { useState} from "react"
import {supabase} from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit3, Trash2, ExternalLink,Users } from "lucide-react"

export function ProjectsTable({ projects, onEdit, onDelete }: any)
{
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'ongoing': return 'bg-blue-100 text-blue-700'
      case 'planning': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100'
    }
  }
return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[300px]">Tên dự án</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Đội ngũ</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="font-bold text-slate-800">{p.title}</TableCell>
              <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
              <TableCell><Badge className={getStatusColor(p.status)}>{p.status}</Badge></TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-slate-500">
                  <Users size={14} /> <span>{p.mentor_ids?.length || 0} Mentors</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal size={16} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(p)}><Edit3 className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/du-an/${p.slug}`, '_blank')}><ExternalLink className="mr-2 h-4 w-4" /> Xem web</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(p)}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
