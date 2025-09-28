import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

interface UsageHistoryData {
  id: string;
  operator_id: string;
  used_amount: number;
  total_limit: number;
  percentage_used: number;
  created_at: string;
}

interface ChartData {
  timestamp: string;
  used_amount: number;
  total_limit: number;
  percentage_used: number;
}

export const QuoteLimitUsageWidget = () => {
  const [historyData, setHistoryData] = useState<UsageHistoryData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  useEffect(() => {
    const fetchUsageHistory = async () => {
      try {
        let hours = 24;
        if (selectedPeriod === "7d") hours = 24 * 7;
        if (selectedPeriod === "30d") hours = 24 * 30;

        const startTime = new Date();
        startTime.setHours(startTime.getHours() - hours);

        const { data, error } = await supabase
          .from('quote_limit_usage_history')
          .select('*')
          .gte('created_at', startTime.toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          timestamp: new Date(item.created_at).toLocaleTimeString(),
          used_amount: item.used_amount,
          total_limit: item.total_limit,
          percentage_used: item.percentage_used
        }));

        setHistoryData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching usage history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageHistory();

    // Set up real-time subscription
    const channel = supabase
      .channel('quote_limit_usage_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_limit_usage_history'
        },
        () => {
          fetchUsageHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPeriod]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quote Limit Usage Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quote Limit Usage Trends
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No usage data available for the selected period</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="timestamp" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : value,
                    name === 'used_amount' ? 'Used Amount ($)' :
                    name === 'total_limit' ? 'Total Limit ($)' :
                    'Usage (%)'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="used_amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                  name="used_amount"
                />
                <Line 
                  type="monotone" 
                  dataKey="total_limit" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="total_limit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Used Amount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t border-muted-foreground border-dashed"></div>
            <span>Total Limit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};