import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface BusinessData {
  month: string;
  active: number;
  pending: number;
  total: number;
}

interface BusinessGrowthChartProps {
  className?: string;
}

export const BusinessGrowthChart = ({ className }: BusinessGrowthChartProps) => {
  const [data, setData] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>("12");

  useEffect(() => {
    fetchBusinessData();
  }, [timePeriod]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const months = parseInt(timePeriod);
      const monthsData: BusinessData[] = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        // Get businesses created up to this month
        const { data: allBusinesses, error: allError } = await supabase
          .from('businesses')
          .select('id, status')
          .lte('created_at', monthEnd.toISOString());
        
        if (allError) {
          console.error('Error fetching businesses:', allError);
          continue;
        }
        
        const active = allBusinesses?.filter(b => b.status === 'active').length || 0;
        const pending = allBusinesses?.filter(b => b.status === 'pending').length || 0;
        
        monthsData.push({
          month: format(monthDate, 'MMM yyyy'),
          active,
          pending,
          total: allBusinesses?.length || 0
        });
      }
      
      setData(monthsData);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-roboto font-semibold mb-2">{payload[0].payload.month}</p>
          <p className="text-sm text-green-600 font-roboto">
            Active: {payload[0].value}
          </p>
          <p className="text-sm text-yellow-600 font-roboto">
            Pending: {payload[1]?.value || 0}
          </p>
          <p className="text-sm text-gray-600 font-roboto font-semibold mt-1">
            Total: {payload[0].payload.total}
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <CardTitle className="font-comfortaa">Business Growth</CardTitle>
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
          Business registration trends over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No business data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fontFamily: 'Roboto' }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12, fontFamily: 'Roboto' }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontFamily: 'Roboto', fontSize: 12 }}
              />
              <Area 
                type="monotone" 
                dataKey="active" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="Active"
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                stackId="1"
                stroke="#f59e0b" 
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Pending"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
