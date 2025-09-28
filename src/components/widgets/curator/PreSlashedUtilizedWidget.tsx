import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp, AlertTriangle } from "lucide-react";

interface PreSlashedData {
  id: string;
  vault_address: string;
  vault_name: string;
  utilized_amount: number;
  total_allocated: number;
  utilization_percentage: number;
}

interface HistoryData {
  vault_address: string;
  utilized_amount: number;
  utilization_percentage: number;
  recorded_at: string;
}

interface ChartData {
  timestamp: string;
  utilization_percentage: number;
  utilized_amount: number;
}

export const PreSlashedUtilizedWidget = () => {
  const [preSlashedData, setPreSlashedData] = useState<PreSlashedData[]>([]);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current pre-slashed utilization data
        const { data: currentData, error: currentError } = await supabase
          .from('delegated_vault_pre_slashing')
          .select('*')
          .order('utilization_percentage', { ascending: false });

        if (currentError) throw currentError;

        // Fetch historical data for the chart
        const { data: history, error: historyError } = await supabase
          .from('delegated_vault_pre_slashing_history')
          .select('*')
          .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_at', { ascending: true });

        if (historyError) throw historyError;

        setPreSlashedData(currentData || []);
        setHistoryData(history || []);

        // Process historical data for chart
        const processedHistory = (history || []).reduce((acc: any[], item) => {
          const timeKey = new Date(item.recorded_at).toLocaleTimeString();
          const existingEntry = acc.find(entry => entry.timestamp === timeKey);
          
          if (existingEntry) {
            existingEntry.utilized_amount += item.utilized_amount;
            existingEntry.utilization_percentage = Math.max(existingEntry.utilization_percentage, item.utilization_percentage);
          } else {
            acc.push({
              timestamp: timeKey,
              utilized_amount: item.utilized_amount,
              utilization_percentage: item.utilization_percentage
            });
          }
          
          return acc;
        }, []);

        setChartData(processedHistory);

      } catch (error) {
        console.error('Error fetching pre-slashed utilization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('delegated_vault_pre_slashing_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delegated_vault_pre_slashing'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalUtilized = preSlashedData.reduce((sum, item) => sum + item.utilized_amount, 0);
  const totalAllocated = preSlashedData.reduce((sum, item) => sum + item.total_allocated, 0);
  const overallUtilization = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-primary";
  };

  const getUtilizationIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-warning" />;
    return <Shield className="h-4 w-4 text-primary" />;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pre-Slashed Amount Utilized
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
          Pre-Slashed Amount Utilized
          <Badge 
            variant={overallUtilization >= 70 ? "destructive" : "secondary"} 
            className="ml-auto"
          >
            {overallUtilization.toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Utilization</span>
            <span className="text-sm text-muted-foreground">
              ${totalUtilized.toLocaleString()} / ${totalAllocated.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={overallUtilization} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className={overallUtilization >= 70 ? "text-destructive font-medium" : ""}>
              {overallUtilization.toFixed(1)}% utilized
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Historical Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Utilization Trend (24h)
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
                    formatter={(value, name) => [
                      name === 'utilization_percentage' ? 
                        `${Number(value).toFixed(1)}%` : 
                        `$${Number(value).toLocaleString()}`,
                      name === 'utilization_percentage' ? 'Utilization %' : 'Utilized Amount'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="utilization_percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Vault-by-Vault Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            Vault Breakdown
          </div>
          
          {preSlashedData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pre-slashed data found</p>
          ) : (
            preSlashedData.slice(0, 4).map((vault) => (
              <div key={vault.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getUtilizationIcon(vault.utilization_percentage)}
                    <span className="font-medium">{vault.vault_name}</span>
                  </div>
                  <Badge 
                    variant={vault.utilization_percentage >= 70 ? "destructive" : "secondary"}
                  >
                    {vault.utilization_percentage.toFixed(1)}%
                  </Badge>
                </div>
                
                <Progress 
                  value={vault.utilization_percentage} 
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Utilized: ${vault.utilized_amount.toLocaleString()}</span>
                  <span>Total: ${vault.total_allocated.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}

          {preSlashedData.length > 4 && (
            <p className="text-center text-sm text-muted-foreground">
              And {preSlashedData.length - 4} more vaults
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};