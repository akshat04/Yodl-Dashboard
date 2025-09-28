import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingDown } from "lucide-react";

interface FallbackLiability {
  id: string;
  operator_id: string;
  tokens_in_custody: number;
  slashed_quantity: number;
  current_usd_price: number;
  liability_usd: number;
  token_type: string;
  operator: {
    name: string;
  };
}

interface ChartData {
  operator_name: string;
  liability_usd: number;
  tokens_in_custody: number;
  slashed_quantity: number;
  token_type: string;
}

export const FallbackLiabilityWidget = () => {
  const [liabilityData, setLiabilityData] = useState<FallbackLiability[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiabilityData = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_fallback_liability')
          .select(`
            id,
            operator_id,
            tokens_in_custody,
            slashed_quantity,
            current_usd_price,
            liability_usd,
            token_type,
            operator:operators(name)
          `)
          .order('liability_usd', { ascending: false });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          operator_name: item.operator.name.length > 12 ? 
            item.operator.name.substring(0, 12) + '...' : 
            item.operator.name,
          liability_usd: item.liability_usd,
          tokens_in_custody: item.tokens_in_custody,
          slashed_quantity: item.slashed_quantity,
          token_type: item.token_type
        }));

        setLiabilityData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching fallback liability data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiabilityData();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_fallback_liability_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_fallback_liability'
        },
        () => {
          fetchLiabilityData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalLiability = liabilityData.reduce((sum, item) => sum + item.liability_usd, 0);
  const highLiabilityOperators = liabilityData.filter(item => item.liability_usd > 100000).length;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Fallback Liability
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
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Fallback Liability
          {totalLiability > 0 && (
            <Badge variant="outline" className="ml-auto">
              ${totalLiability.toLocaleString()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No fallback liability data found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Liability</p>
                <p className="text-2xl font-bold text-destructive">
                  ${totalLiability.toLocaleString()}
                </p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">High Risk Ops</p>
                <p className="text-2xl font-bold text-warning">
                  {highLiabilityOperators}
                </p>
              </div>
            </div>

            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="operator_name" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`,
                      'Liability (USD)'
                    ]}
                    labelFormatter={(label) => `Operator: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="liability_usd" 
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {liabilityData.slice(0, 4).map((liability) => (
                <div key={liability.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="font-medium">{liability.operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Custody: {liability.tokens_in_custody.toLocaleString()} {liability.token_type} |
                        Slashed: {liability.slashed_quantity.toLocaleString()} {liability.token_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">
                      ${liability.liability_usd.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @ ${liability.current_usd_price.toFixed(2)}/{liability.token_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};