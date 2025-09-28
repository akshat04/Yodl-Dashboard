import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp } from "lucide-react";

interface PreSlashingData {
  id: string;
  operator_id: string;
  amount: number;
  usd_value: number;
  updated_at: string;
  operator: {
    name: string;
  };
}

interface ChartData {
  timestamp: string;
  total_utilized: number;
}

export const PreSlashingUtilizationWidget = () => {
  const [preSlashingData, setPreSlashingData] = useState<PreSlashingData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreSlashingData = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_pre_slashing')
          .select(`
            id,
            operator_id,
            amount,
            usd_value,
            updated_at,
            operator:operators(name)
          `)
          .order('usd_value', { ascending: false });

        if (error) throw error;
        setPreSlashingData(data || []);

        // Generate sample historical data for the chart
        const now = new Date();
        const historicalData = Array.from({ length: 24 }, (_, i) => {
          const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          const totalUtilized = (data || []).reduce((sum, item) => sum + item.usd_value, 0);
          // Add some variation for demo purposes
          const variation = Math.sin(i * 0.5) * totalUtilized * 0.1;
          
          return {
            timestamp: timestamp.toLocaleTimeString(),
            total_utilized: Math.max(0, totalUtilized + variation)
          };
        });

        setChartData(historicalData);
      } catch (error) {
        console.error('Error fetching pre-slashing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreSlashingData();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_pre_slashing_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_pre_slashing'
        },
        () => {
          fetchPreSlashingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalPreSlashed = preSlashingData.reduce((sum, item) => sum + item.usd_value, 0);
  const totalAmount = preSlashingData.reduce((sum, item) => sum + item.amount, 0);
  
  // Assume a maximum capacity for progress calculation
  const maxCapacity = 1000000; // $1M as example max
  const utilizationPercentage = (totalPreSlashed / maxCapacity) * 100;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pre-Slashed Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Pre-Slashed Utilization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            ${totalPreSlashed.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Total Pre-Slashed Amount
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilization</span>
            <span>{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={utilizationPercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>${maxCapacity.toLocaleString()}</span>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Historical Usage (24h)
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp" 
                    className="text-xs"
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      'Total Utilized'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total_utilized" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {preSlashingData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pre-slashing data found</p>
          ) : (
            preSlashingData.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{item.operator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.amount.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${item.usd_value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};