"use client"

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

import { KPICard } from '@/components/admin/dashboard/KPICard'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { UserGrowthChart } from '@/components/admin/dashboard/UserGrowthChart'
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  FolderOpen 
} from 'lucide-react'

function AdminDashboardContent() {
  const kpiData = [
    {
      title: 'Tổng số người dùng',
      value: '3,150',
      change: '+12% so với tháng trước',
      changeType: 'positive' as const,
      icon: Users,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Doanh thu',
      value: '$65,420',
      change: '+8.5% so với tháng trước',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconColor: 'text-green-600'
    },
    {
      title: 'Khóa học hoạt động',
      value: '89',
      change: '+3 khóa học mới trong tháng',
      changeType: 'positive' as const,
      icon: BookOpen,
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Dự án',
      value: '156',
      change: '+15 đã hoàn thành',
      changeType: 'positive' as const,
      icon: FolderOpen,
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bảng điều khiển Admin</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Chào mừng đến với bảng điều khiển quản trị. Theo dõi hiệu suất hệ thống và phân tích dữ liệu.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            index={index}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <UserGrowthChart />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[
              { action: 'Đăng ký người dùng mới', user: 'john.doe@email.com', time: '2 phút trước', type: 'user' },
              { action: 'Đăng ký khóa học', user: 'React Advanced Patterns', time: '15 phút trước', type: 'course' },
              { action: 'Nhận thanh toán', user: '$299.00 - Gói Premium', time: '1 giờ trước', type: 'payment' },
              { action: 'Hoàn thành dự án', user: 'E-commerce Platform', time: '3 giờ trước', type: 'project' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-500' :
                    activity.type === 'course' ? 'bg-green-500' :
                    activity.type === 'payment' ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tỷ lệ hoàn thành khóa học</span>
              <span className="font-semibold text-gray-900 dark:text-white">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Thời gian phiên trung bình</span>
              <span className="font-semibold text-gray-900 dark:text-white">24p</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Độ hài lòng khách hàng</span>
              <span className="font-semibold text-gray-900 dark:text-white">4.8/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tăng trưởng hàng tháng</span>
              <span className="font-semibold text-green-600 dark:text-green-400">+12.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}