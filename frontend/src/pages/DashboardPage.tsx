import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Package, AlertTriangle, Building2, TrendingDown, DollarSign, ArrowRight,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#1b4965", "#62b6cb", "#5fa8d3", "#bee9e8", "#cae9ff"]

function StatCard({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  color: string
  href?: string
}) {
  const content = (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>
              {value}
            </p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
  return href ? <Link to={href}>{content}</Link> : content
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/inventory/dashboard/").then((r) => r.data),
    refetchInterval: 15000,
    refetchOnMount: "always",
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const summary = data?.summary ?? {}
  const lowStockItems = data?.low_stock_items ?? []
  const byCompany = data?.items_by_company ?? []
  const recentTxns = data?.recent_transactions ?? []
  const monthlyActivity = data?.monthly_activity ?? []

  // Process monthly data for chart
  const monthlyMap: Record<string, { month: string; add: number; remove: number }> = {}
  monthlyActivity.forEach((item: any) => {
    if (!monthlyMap[item.month]) monthlyMap[item.month] = { month: item.month, add: 0, remove: 0 }
    if (item.type === "ADD") monthlyMap[item.month].add += item.total
    else monthlyMap[item.month].remove += item.total
  })
  const chartData = Object.values(monthlyMap)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={summary.total_items ?? 0}
          subtitle="Active products"
          icon={Package}
          color="#1b4965"
          href="/items"
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary.low_stock_count ?? 0}
          subtitle="Need restock"
          icon={AlertTriangle}
          color="#d97706"
          href="/items?low_stock=true"
        />
        <StatCard
          title="Out of Stock"
          value={summary.out_of_stock ?? 0}
          subtitle="Zero quantity"
          icon={TrendingDown}
          color="#dc2626"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency(summary.total_stock_value ?? 0)}
          subtitle="Total inventory value"
          icon={DollarSign}
          color="#059669"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1b4965] text-base">Monthly Stock Activity</CardTitle>
            <CardDescription>Stock additions vs removals over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No transaction data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="add" name="Added" fill="#62b6cb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="remove" name="Removed" fill="#1b4965" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Items by Company Pie */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#1b4965] text-base">Items by Company</CardTitle>
            <CardDescription>Distribution across suppliers</CardDescription>
          </CardHeader>
          <CardContent>
            {byCompany.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byCompany.map((c: any) => ({ name: c.company__name || "Unassigned", value: c.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byCompany.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#1b4965] text-base">Low Stock Items</CardTitle>
              <CardDescription>Items needing immediate restock</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-[#62b6cb] hover:text-[#1b4965]">
              <Link to="/items?low_stock=true">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">All stock levels are healthy!</p>
              </div>
            ) : (
              lowStockItems.slice(0, 6).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.company_name || "No company"}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <Badge variant={item.quantity === 0 ? "destructive" : "warning"}>
                      {item.quantity} {item.unit}
                    </Badge>
                    <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Link to={`/items/${item.id}/stock`}>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1b4965] text-base">Recent Activity</CardTitle>
            <CardDescription>Latest stock transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentTxns.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto px-6 pb-4 space-y-1">
                {recentTxns.map((txn: any) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{txn.item_name}</p>
                      <p className="text-xs text-gray-400">{txn.performed_by_name} · {new Date(txn.created_at).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge
                      variant={txn.transaction_type === "ADD" ? "success" : "destructive"}
                      className="ml-2 flex-shrink-0"
                    >
                      {txn.transaction_type === "ADD" ? "+" : "-"}{txn.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
