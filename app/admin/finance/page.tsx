"use client"

import { useState } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { FinanceOverview } from '@/components/admin/finance/FinanceOverview'
import { RevenueChart } from '@/components/admin/finance/RevenueChart'
import { ExpenseChart } from '@/components/admin/finance/ExpenseChart'
import { TransactionTable } from '@/components/admin/finance/TransactionTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Download,
  Calendar,
  Filter
} from 'lucide-react'

// Sample financial data for demo
const revenueData = [
  { month: 'Jan', revenue: 125000, expenses: 85000, profit: 40000 },
  { month: 'Feb', revenue: 132000, expenses: 88000, profit: 44000 },
  { month: 'Mar', revenue: 148000, expenses: 92000, profit: 56000 },
  { month: 'Apr', revenue: 156000, expenses: 95000, profit: 61000 },
  { month: 'May', revenue: 168000, expenses: 98000, profit: 70000 },
  { month: 'Jun', revenue: 175000, expenses: 102000, profit: 73000 },
  { month: 'Jul', revenue: 182000, expenses: 105000, profit: 77000 },
  { month: 'Aug', revenue: 195000, expenses: 108000, profit: 87000 },
  { month: 'Sep', revenue: 188000, expenses: 110000, profit: 78000 },
  { month: 'Oct', revenue: 205000, expenses: 112000, profit: 93000 },
  { month: 'Nov', revenue: 218000, expenses: 115000, profit: 103000 },
  { month: 'Dec', revenue: 235000, expenses: 120000, profit: 115000 }
]

const expenseBreakdown = [
  { category: 'Salaries', amount: 65000, percentage: 54.2 },
  { category: 'Infrastructure', amount: 18000, percentage: 15.0 },
  { category: 'Marketing', amount: 12000, percentage: 10.0 },
  { category: 'Software', amount: 8000, percentage: 6.7 },
  { category: 'Office', amount: 7000, percentage: 5.8 },
  { category: 'Travel', amount: 5000, percentage: 4.2 },
  { category: 'Other', amount: 5000, percentage: 4.2 }
]

const recentTransactions = [
  {
    id: 1,
    type: 'income' as const,
    description: 'Course enrollment - React Mastery',
    amount: 299,
    date: '2024-09-20',
    category: 'Course Sales',
    paymentMethod: 'Credit Card',
    customer: 'John Smith',
    status: 'completed' as const
  },
  {
    id: 2,
    type: 'income' as const,
    description: 'Project payment - E-commerce Platform',
    amount: 15000,
    date: '2024-09-19',
    category: 'Project Revenue',
    paymentMethod: 'Bank Transfer',
    customer: 'TechCorp Solutions',
    status: 'completed' as const
  },
  {
    id: 3,
    type: 'expense' as const,
    description: 'AWS Infrastructure - September',
    amount: 1850,
    date: '2024-09-18',
    category: 'Infrastructure',
    paymentMethod: 'Credit Card',
    customer: 'Amazon Web Services',
    status: 'completed' as const
  },
  {
    id: 4,
    type: 'income' as const,
    description: 'Consultation - Database Design',
    amount: 500,
    date: '2024-09-17',
    category: 'Consultation',
    paymentMethod: 'PayPal',
    customer: 'StartupXYZ',
    status: 'pending' as const
  },
  {
    id: 5,
    type: 'expense' as const,
    description: 'Software licenses - Development tools',
    amount: 450,
    date: '2024-09-16',
    category: 'Software',
    paymentMethod: 'Credit Card',
    customer: 'JetBrains',
    status: 'completed' as const
  },
  {
    id: 6,
    type: 'income' as const,
    description: 'Course enrollment - Node.js Fundamentals',
    amount: 199,
    date: '2024-09-15',
    category: 'Course Sales',
    paymentMethod: 'Credit Card',
    customer: 'Jane Doe',
    status: 'completed' as const
  },
  {
    id: 7,
    type: 'expense' as const,
    description: 'Marketing campaign - Google Ads',
    amount: 2500,
    date: '2024-09-14',
    category: 'Marketing',
    paymentMethod: 'Credit Card',
    customer: 'Google Ads',
    status: 'completed' as const
  },
  {
    id: 8,
    type: 'income' as const,
    description: 'Project milestone - Mobile App',
    amount: 8000,
    date: '2024-09-13',
    category: 'Project Revenue',
    paymentMethod: 'Bank Transfer',
    customer: 'Mobile Solutions Inc',
    status: 'completed' as const
  }
]

function FinanceReportingContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30')

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter
    
    return matchesSearch && matchesFilter
  })

  const financeStats = {
    totalRevenue: revenueData.reduce((acc, month) => acc + month.revenue, 0),
    totalExpenses: revenueData.reduce((acc, month) => acc + month.expenses, 0),
    totalProfit: revenueData.reduce((acc, month) => acc + month.profit, 0),
    avgMonthlyRevenue: Math.round(revenueData.reduce((acc, month) => acc + month.revenue, 0) / revenueData.length),
    currentMonthRevenue: revenueData[revenueData.length - 1].revenue,
    currentMonthProfit: revenueData[revenueData.length - 1].profit,
    profitMargin: Math.round((revenueData[revenueData.length - 1].profit / revenueData[revenueData.length - 1].revenue) * 100),
    revenueGrowth: Math.round(((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue) * 100)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive financial reporting and analytics for revenue, expenses, and profitability.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <FinanceOverview stats={financeStats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue & Profit Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseChart data={expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">{financeStats.profitMargin}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{financeStats.revenueGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Month over Month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${(financeStats.avgMonthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                12 Month Average
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-orange-600">{recentTransactions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                This Month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions by description, customer, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredTransactions.length} transactions</Badge>
            </div>
          </div>

          <TransactionTable transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function FinanceReportingPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <FinanceReportingContent />
    </ProtectedRoute>
  )
}