import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RatingData {
  name: string;
  value: number;
  percentage: number;
}

interface ReviewDistributionChartProps {
  className?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'];
const RATING_LABELS = ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

export const ReviewDistributionChart = ({ className }: ReviewDistributionChartProps) => {
  const [data, setData] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviewData();
  }, []);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }
      
      const total = reviews?.length || 0;
      setTotalReviews(total);
      
      // Count reviews by rating
      const ratingCounts = [0, 0, 0, 0, 0]; // [5-star, 4-star, 3-star, 2-star, 1-star]
      
      reviews?.forEach(review => {
        const index = 5 - review.rating; // Convert rating to array index
        if (index >= 0 && index < 5) {
          ratingCounts[index]++;
        }
      });
      
      // Create chart data
      const chartData = ratingCounts.map((count, index) => ({
        name: RATING_LABELS[index],
        value: count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })).filter(item => item.value > 0); // Only show ratings that exist
      
      setData(chartData);
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-roboto font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600 font-roboto">
            Count: {payload[0].value}
          </p>
          <p className="text-sm text-gray-600 font-roboto">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-roboto font-semibold text-sm"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <CardTitle className="font-comfortaa">Review Distribution</CardTitle>
        </div>
        <CardDescription className="font-roboto">
          Rating breakdown across {totalReviews} approved reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No review data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontFamily: 'Roboto', fontSize: 12 }}
                formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
