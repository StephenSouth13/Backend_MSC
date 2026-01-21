"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from "@/components/ui/button"
import { GripVertical, Edit3, Trash2, Star } from "lucide-react"
import { toast } from '@/hooks/use-toast'

// // Nguồn: Component con cho từng hàng để có thể kéo thả
function SortableRow({ p, stt, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={`group hover:bg-slate-50/50 transition-all ${isDragging ? 'bg-blue-50 shadow-2xl' : ''}`}>
      <TableCell className="w-[50px]">
        {/* // Nguồn: Nút cầm để kéo */}
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-blue-500 transition-colors">
          <GripVertical size={18} />
        </button>
      </TableCell>
      <TableCell className="text-center font-black text-slate-300 italic text-sm">{stt}</TableCell>
      <TableCell className="font-bold text-slate-800 uppercase text-sm">
        <div className="flex items-center gap-2">
          {p.title}
          {p.featured && <Star size={12} className="fill-amber-400 text-amber-400" />}
        </div>
        <div className="text-[10px] text-blue-500 tracking-widest">{p.category}</div>
      </TableCell>
      <TableCell className="text-center">
        <div className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md">Vị trí: {p.order_index}</div>
      </TableCell>
      <TableCell className="text-right px-8 space-x-2">
         <Button variant="ghost" size="icon" onClick={() => onEdit(p)} className="hover:text-blue-600"><Edit3 size={16}/></Button>
         <Button variant="ghost" size="icon" onClick={() => onDelete(p)} className="hover:text-red-600"><Trash2 size={16}/></Button>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsTable({ projects, onEdit, onDelete, currentPage, itemsPerPage, onReorder }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // // Nguồn: Xử lý khi kết thúc kéo thả
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = projects.findIndex((i: any) => i.id === active.id);
      const newIndex = projects.findIndex((i: any) => i.id === over?.id);
      const newOrder = arrayMove(projects, oldIndex, newIndex);
      
      // Thông báo cho trang cha cập nhật UI tạm thời
      onReorder(newOrder);

      // // Nguồn: Cập nhật vị trí mới vào Database đồng loạt
      try {
        const updates = newOrder.map((p: any, idx: number) => ({
          id: p.id,
          order_index: (currentPage - 1) * itemsPerPage + idx + 1
        }));

        for (const up of updates) {
          await supabase.from('projects').update({ order_index: up.order_index }).eq('id', up.id);
        }
        toast({ title: "Đã cập nhật thứ tự sắp xếp!" });
      } catch (err) {
        toast({ title: "Lỗi sắp xếp", variant: "destructive" });
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden font-montserrat">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px] text-center font-black uppercase text-[10px] text-slate-400">STT</TableHead>
              <TableHead className="font-black uppercase text-[10px] text-slate-400">Dự án & Lĩnh vực</TableHead>
              <TableHead className="w-[100px] text-center font-black uppercase text-[10px] text-slate-400">Thứ tự</TableHead>
              <TableHead className="text-right px-8 font-black uppercase text-[10px] text-slate-400">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext items={projects.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
              {projects.map((p: any, index: number) => (
                <SortableRow 
                  key={p.id} 
                  p={p} 
                  stt={(currentPage - 1) * itemsPerPage + index + 1} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}