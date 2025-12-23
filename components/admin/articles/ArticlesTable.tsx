"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, Edit3, Trash2, Eye, ThumbsUp, Calendar, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export function ArticlesTable({ articles, onDeleteArticle, onEditArticle }: any) {
  const getCategoryBadge = (cat: string) => {
    const colors: any = { news: 'bg-blue-100 text-blue-700', tutorial: 'bg-green-100 text-green-700', sharing: 'bg-purple-100 text-purple-700' }
    return <Badge className={colors[cat] || 'bg-gray-100'}>{cat}</Badge>
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[350px]">Bài viết</TableHead>
            <TableHead>Tác giả (Mentor/MSCer)</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Chỉ số</TableHead>
            <TableHead>Ngày đăng</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article: any) => (
            <TableRow key={article.id} className="hover:bg-slate-50/50 transition-colors">
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-900 line-clamp-1">{article.title}</span>
                  <span className="text-xs text-slate-500 line-clamp-1">{article.excerpt}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={article.author_profile?.avatar} />
                    <AvatarFallback>{article.author_profile?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{article.author_profile?.name || "Ẩn danh"}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase w-fit">{article.author_profile?.role}</Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getCategoryBadge(article.category)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                  <div className="flex items-center gap-1"><Eye size={14}/> {article.views || 0}</div>
                  <div className="flex items-center gap-1"><ThumbsUp size={14}/> {article.likes || 0}</div>
                </div>
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {format(new Date(article.created_at), 'dd/MM/yyyy', { locale: vi })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEditArticle(article)}><Edit3 className="mr-2 h-4 w-4" /> Sửa bài</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/blog/${article.slug}`, '_blank')}><ExternalLink className="mr-2 h-4 w-4" /> Xem web</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onDeleteArticle(article.id)}><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
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