import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Vault } from "lucide-react";

interface VaultRebalance {
  id: string;
  vault_address: string;
  vault_name: string;
  outstanding_quantity: number;
  outstanding_usd_value: number;
  token_type: string;
}

interface ChartData {
  vault_name: string;
  quantity: number;
  usd_value: number;
  token_type: string;
}

export const VaultRebalanceWidget = () => {
  const [rebalanceData, setRebalanceData] = useState<VaultRebalance[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRebalanceData = async () => {
      try {
        const { data, error } = await supabase
          .from('vault_outstanding_rebalances')
          .select('*')
          .order('outstanding_usd_value', { ascending: false });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          vault_name: item.vault_name.length > 15 ? 
            item.vault_name.substring(0, 15) + '...' : 
            item.vault_name,
          quantity: item.outstanding_quantity,
          usd_value: item.outstanding_usd_value,
          token_type: item.token_type
        }));

        setRebalanceData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching vault rebalance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRebalanceData();

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_outstanding_rebalances_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_outstanding_rebalances'
        },
        () => {
          fetchRebalanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalOutstanding = rebalanceData.reduce((sum, item) => sum + item.outstanding_usd_value, 0);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vault Rebalance Outstanding
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
          <BarChart3 className="h-5 w-5" />
          Vault Rebalance Outstanding
          <Badge variant="outline" className="ml-auto">
            ${totalOutstanding.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No outstanding rebalances found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="vault_name" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      typeof value === 'number' ? 
                        (name === 'usd_value' ? `$${value.toLocaleString()}` : value.toLocaleString()) : 
                        value,
                      name === 'usd_value' ? 'USD Value' : 'Quantity'
                    ]}
                  />
                  <Bar 
                    dataKey="usd_value" 
                    fill="hsl(var(--primary))"
                    name="usd_value"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {rebalanceData.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Vault className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{item.vault_name}</p>
                      <p className="text-xs text-muted-foreground">{item.vault_address.substring(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ${item.outstanding_usd_value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.outstanding_quantity.toLocaleString()} {item.token_type}
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