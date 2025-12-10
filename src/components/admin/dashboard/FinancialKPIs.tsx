import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { startOfMonth, subMonths, format } from "date-fns";

interface FinancialMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  averageTransaction: number;
  pendingPayments: number;
  successfulPayments: number;
  growthRate: number;
}

interface FinancialKPIsProps {
  className?: string;
}

export const FinancialKPIs = ({ className }: FinancialKPIsProps) => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    averageTransaction: 0,
    pendingPayments: 0,
    successfulPayments: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Get all completed payments
      const { data: allPayments, error: allError } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'completed');
      
      if (allError) {
        console.error('Error fetching payments:', allError);
        return;
      }
      
      const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const avgTransaction = allPayments && allPayments.length > 0 
        ? totalRevenue / allPayments.length 
        : 0;
      
      // Get this month's revenue
      const thisMonthStart = startOfMonth(new Date());
      const { data: thisMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thisMonthStart.toISOString());
      
      const revenueThisMonth = thisMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Get last month's revenue
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
      const lastMonthEnd = thisMonthStart;
      const { data: lastMonthPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString());
      
      const revenueLastMonth = lastMonthPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Calculate growth rate
      const growthRate = revenueLastMonth > 0 
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
        : 0;
      
      // Get pending payments count
      const { count: pendingCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Get successful payments count
      const { count: successfulCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      setMetrics({
        totalRevenue,
        revenueThisMonth,
        revenueLastMonth,
        averageTransaction: avgTransaction,
        pendingPayments: pendingCount || 0,
        successfulPayments: successfulCount || 0,
        growthRate
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-500",
      subtitle: "All time"
    },
    {
      title: "This Month",
      value: `$${metrics.revenueThisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: metrics.growthRate >= 0 ? "bg-green-500" : "bg-red-500",
      subtitle: `${metrics.growthRate >= 0 ? '+' : ''}${metrics.growthRate.toFixed(1)}% vs last month`
    },
    {
      title: "Avg Transaction",
      value: `$${metrics.averageTransaction.toFixed(2)}`,
      icon: CreditCard,
      color: "bg-blue-500",
      subtitle: `${metrics.successfulPayments} successful`
    },
    {
      title: "Pending Payments",
      value: metrics.pendingPayments.toString(),
      icon: AlertCircle,
      color: "bg-orange-500",
      subtitle: "Awaiting processing"
    }
  ];

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-roboto font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${kpi.color}`}>
              <kpi.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-comfortaa font-bold text-yp-dark">
              {kpi.value}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-roboto">
              {kpi.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
