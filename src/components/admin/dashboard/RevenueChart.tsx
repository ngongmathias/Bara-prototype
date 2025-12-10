import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface RevenueData {
  month: string;
  revenue: number;
  transactions: number;
}

interface RevenueChartProps {
  className?: string;
}

export const RevenueChart = ({ className }: RevenueChartProps) => {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>("12");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    fetchRevenueData();
  }, [timePeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const months = parseInt(timePeriod);
      const monthsData: RevenueData[] = [];
      
      let totalRev = 0;
      
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const { data: payments, error } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());
        
        if (error) {
          console.error('Error fetching revenue:', error);
          continue;
        }
        
        const monthRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        totalRev += monthRevenue;
        
        monthsData.push({
          month: format(monthDate, 'MMM yyyy'),
          revenue: monthRevenue,
          transactions: payments?.length || 0
        });
      }
      
      setData(monthsData);
      setTotalRevenue(totalRev);
      
      // Calculate growth (compare last month to previous month)
      if (monthsData.length >= 2) {
        const lastMonth = monthsData[monthsData.length - 1].revenue;
        const previousMonth = monthsData[monthsData.length - 2].revenue;
        const growthRate = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
        setGrowth(growthRate);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-roboto font-semibold">{payload[0].payload.month}</p>
          <p className="text-sm text-green-600 font-roboto">
            Revenue: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 font-roboto">
            Transactions: {payload[0].payload.transactions}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <CardTitle className="font-comfortaa">Revenue Trends</CardTitle>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="font-roboto">
          Total revenue: ${totalRevenue.toLocaleString()} 
          <span className={`ml-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs previous month)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fontFamily: 'Roboto' }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12, fontFamily: 'Roboto' }}
                stroke="#666"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontFamily: 'Roboto', fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
