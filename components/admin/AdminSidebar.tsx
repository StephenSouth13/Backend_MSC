"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  BookOpen, 
  FolderOpen, 
  Share2, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { title } from 'process'

interface AdminSidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const adminMenuItems = [
  {
    title: 'Bảng điều khiển',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý người dùng',
    href: '/admin/users',
    icon: Users,
    roles: ['admin', 'collab']
  },
  {
    title: 'Tài chính',
    href: '/admin/finance',
    icon: DollarSign,
    roles: ['admin', 'collab']
  },
  {
    title: 'Khóa học',
    href: '/admin/courses',
    icon: BookOpen,
    roles: ['admin', 'collab']
  },
  {
    title: 'Dự án',
    href: '/admin/projects',
    icon: FolderOpen,
    roles: ['admin', 'collab']
  },
  {
    title: 'Bài viết',
    href: '/admin/articles',
    icon: Share2,
    roles: ['admin', 'collab']
  },
  {
    title: 'Quản lý hình ảnh',
    href: '/admin/images',
    icon: Image,
    roles: ['admin', 'collab']
  },
 // Trong file AdminSidebar.tsx, thêm item mới vào adminMenuItems
{
  title: 'Quản lý Mentor',
  href: '/admin/mentors',
  icon: Users, // Dùng icon Users từ lucide-react
  roles: ['admin', 'collab']
},
  {
    title: 'Cài đặt',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin', 'collab']
  }
]

export function AdminSidebar({ isOpen, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string>('collab')

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('user_role') || 'collab'
    setUserRole(role)
  }, [])

  // Filter menu items based on user role
  const filteredMenuItems = adminMenuItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 256
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'h-full backdrop-blur-xl bg-gray-900/90 border-r border-white/10',
        'flex flex-col shadow-2xl flex-shrink-0 relative z-30'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-semibold">MSC Quản trị</span>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-white hover:bg-white/10 p-1 h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-white/10 hover:backdrop-blur-sm',
                  isActive && 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-primary-400' : 'text-gray-300',
                  'h-5 w-5'
                )} />
                
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'font-medium transition-colors',
                      isActive ? 'text-white' : 'text-gray-300'
                    )}
                  >
                    {item.title}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-xs text-gray-400">MSC Hệ thống quản trị</p>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}