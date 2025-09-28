import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface PreSlashedRemainingData {
  id: string;
  vault_address: string;
  vault_name: string;
  remaining_amount: number;
  total_allocated: number;
  utilization_percentage: number;
}

interface HistoryData {
  vault_address: string;
  remaining_amount: number;
  utilization_percentage: number;
  recorded_at: string;
}

interface ChartData {
  timestamp: string;
  total_remaining: number;
  average_remaining_percent: number;
}

export const PreSlashedRemainingWidget = () => {
  const [remainingData, setRemainingData] = useState<PreSlashedRemainingData[]>([]);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current remaining pre-slashed data
        const { data: currentData, error: currentError } = await supabase
          .from('delegated_vault_pre_slashing')
          .select('*')
          .order('remaining_amount', { ascending: true });

        if (currentError) throw currentError;

        // Fetch historical data for change-over-time chart
        const { data: history, error: historyError } = await supabase
          .from('delegated_vault_pre_slashing_history')
          .select('*')
          .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_at', { ascending: true });

        if (historyError) throw historyError;

        setRemainingData(currentData || []);
        setHistoryData(history || []);

        // Process historical data for change-over-time chart
        const processedHistory = (history || []).reduce((acc: any[], item) => {
          const date = new Date(item.recorded_at);
          const timeKey = date.toLocaleDateString();
          const remainingPercent = 100 - item.utilization_percentage;
          
          const existingEntry = acc.find(entry => entry.timestamp === timeKey);
          
          if (existingEntry) {
            existingEntry.total_remaining += item.remaining_amount;
            existingEntry.count++;
          } else {
            acc.push({
              timestamp: timeKey,
              total_remaining: item.remaining_amount,
              average_remaining_percent: remainingPercent,
              count: 1
            });
          }
          
          return acc;
        }, []);

        // Calculate averages
        const finalHistory = processedHistory.map(entry => ({
          ...entry,
          average_remaining_percent: entry.average_remaining_percent
        }));

        setChartData(finalHistory);

      } catch (error) {
        console.error('Error fetching pre-slashed remaining data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('delegated_vault_pre_slashing_remaining')
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

  const totalRemaining = remainingData.reduce((sum, item) => sum + item.remaining_amount, 0);
  const totalAllocated = remainingData.reduce((sum, item) => sum + item.total_allocated, 0);
  const overallRemainingPercent = totalAllocated > 0 ? (totalRemaining / totalAllocated) * 100 : 0;

  const getRemainingColor = (remainingPercent: number) => {
    if (remainingPercent <= 10) return "bg-destructive";
    if (remainingPercent <= 30) return "bg-warning";
    return "bg-green-500";
  };

  const getRemainingIcon = (remainingPercent: number) => {
    if (remainingPercent <= 10) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (remainingPercent <= 30) return <TrendingDown className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getRemainingStatus = (remainingPercent: number) => {
    if (remainingPercent <= 10) return { status: "Critical", variant: "destructive" as const };
    if (remainingPercent <= 30) return { status: "Low", variant: "default" as const };
    return { status: "Healthy", variant: "secondary" as const };
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Pre-Slashed Amount Remaining
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

  const overallStatus = getRemainingStatus(overallRemainingPercent);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Pre-Slashed Amount Remaining
          <Badge variant={overallStatus.variant} className="ml-auto">
            {overallStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Remaining Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Remaining Quota</span>
            <span className="text-sm text-muted-foreground">
              ${totalRemaining.toLocaleString()} / ${totalAllocated.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={overallRemainingPercent} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% remaining</span>
            <span className={overallRemainingPercent <= 30 ? "text-warning font-medium" : "text-green-500"}>
              {overallRemainingPercent.toFixed(1)}% available
            </span>
            <span>100% available</span>
          </div>
        </div>

        {/* Change-over-time Chart */}
        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown className="h-4 w-4" />
              Remaining Quota Trend (7 days)
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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
                      name === 'total_remaining' ? 
                        `$${Number(value).toLocaleString()}` : 
                        `${Number(value).toFixed(1)}%`,
                      name === 'total_remaining' ? 'Total Remaining' : 'Avg % Remaining'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_remaining" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Vault-by-Vault Remaining Quotas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Remaining Quotas by Vault
          </div>
          
          {remainingData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No remaining quota data found</p>
          ) : (
            remainingData.slice(0, 4).map((vault) => {
              const remainingPercent = vault.total_allocated > 0 ? (vault.remaining_amount / vault.total_allocated) * 100 : 0;
              const status = getRemainingStatus(remainingPercent);
              
              return (
                <div key={vault.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRemainingIcon(remainingPercent)}
                      <span className="font-medium">{vault.vault_name}</span>
                    </div>
                    <Badge variant={status.variant}>
                      {remainingPercent.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={remainingPercent} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Remaining: ${vault.remaining_amount.toLocaleString()}</span>
                    <span>Total: ${vault.total_allocated.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}

          {remainingData.length > 4 && (
            <p className="text-center text-sm text-muted-foreground">
              And {remainingData.length - 4} more vaults
            </p>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {remainingData.filter(v => (v.remaining_amount / v.total_allocated) * 100 > 30).length}
            </p>
            <p className="text-xs text-muted-foreground">Healthy Vaults</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">
              {remainingData.filter(v => (v.remaining_amount / v.total_allocated) * 100 <= 10).length}
            </p>
            <p className="text-xs text-muted-foreground">Critical Vaults</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};