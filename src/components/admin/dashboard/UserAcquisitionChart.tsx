import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from "lucide-react";
import { getAdminDb } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface UserData {
  month: string;
  newUsers: number;
}

interface UserAcquisitionChartProps {
  className?: string;
}

export const UserAcquisitionChart = ({ className }: UserAcquisitionChartProps) => {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>("12");
  const [totalNewUsers, setTotalNewUsers] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, [timePeriod]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const adminDb = getAdminDb();
      const months = parseInt(timePeriod);
      const monthsData: UserData[] = [];
      let total = 0;
      
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const { data: users, error } = await adminDb
          .clerk_users()
          .select('id')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());
        
        if (error) {
          console.error('Error fetching users:', error);
          continue;
        }
        
        const newUsers = users?.length || 0;
        total += newUsers;
        
        monthsData.push({
          month: format(monthDate, 'MMM yyyy'),
          newUsers
        });
      }
      
      setData(monthsData);
      setTotalNewUsers(total);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-roboto font-semibold">{payload[0].payload.month}</p>
          <p className="text-sm text-blue-600 font-roboto">
            New Users: {payload[0].value}
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
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle className="font-comfortaa">User Acquisition</CardTitle>
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
          Total new users: {totalNewUsers.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No user data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
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
              <Bar 
                dataKey="newUsers" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="New Users"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
