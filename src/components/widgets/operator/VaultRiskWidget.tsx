import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield } from "lucide-react";

interface VaultRiskData {
  id: string;
  vault_address: string;
  vault_name: string;
  amount_at_risk_usd: number;
  value_slashing: number;
  current_value: number;
  risk_ratio: number;
}

interface ChartData {
  vault_name: string;
  amount_at_risk: number;
  risk_ratio: number;
  current_value: number;
}

export const VaultRiskWidget = () => {
  const [riskData, setRiskData] = useState<VaultRiskData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const { data, error } = await supabase
          .from('vault_risk_data')
          .select('*')
          .order('amount_at_risk_usd', { ascending: false });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          vault_name: item.vault_name,
          amount_at_risk: item.amount_at_risk_usd,
          risk_ratio: item.risk_ratio * 100, // Convert to percentage
          current_value: item.current_value
        }));

        setRiskData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching vault risk data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_risk_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_risk_data'
        },
        () => {
          fetchRiskData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRiskLevel = (riskRatio: number) => {
    if (riskRatio > 0.8) return { level: 'High', color: 'destructive' };
    if (riskRatio > 0.5) return { level: 'Medium', color: 'default' };
    return { level: 'Low', color: 'secondary' };
  };

  const totalAtRisk = riskData.reduce((sum, item) => sum + item.amount_at_risk_usd, 0);
  const highRiskVaults = riskData.filter(item => item.risk_ratio > 0.8).length;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vault Risk Analysis
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
          <AlertTriangle className="h-5 w-5" />
          Vault Risk Analysis
          {highRiskVaults > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {highRiskVaults} High Risk
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No vault risk data found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total at Risk</p>
                <p className="text-xl font-bold text-destructive">
                  ${totalAtRisk.toLocaleString()}
                </p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">High Risk Vaults</p>
                <p className="text-xl font-bold text-warning">
                  {highRiskVaults}
                </p>
              </div>
            </div>

            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    dataKey="amount_at_risk" 
                    name="Amount at Risk"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="risk_ratio" 
                    name="Risk Ratio"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value, name) => [
                      name === 'amount_at_risk' ? 
                        `$${Number(value).toLocaleString()}` : 
                        `${Number(value).toFixed(1)}%`,
                      name === 'amount_at_risk' ? 'Amount at Risk' : 'Risk Ratio'
                    ]}
                  />
                  <Scatter 
                    dataKey="risk_ratio" 
                    fill="hsl(var(--primary))"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {riskData.slice(0, 4).map((vault) => {
                const risk = getRiskLevel(vault.risk_ratio);
                return (
                  <div key={vault.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        risk.color === 'destructive' ? 'text-destructive' :
                        risk.color === 'default' ? 'text-warning' : 'text-green-500'
                      }`} />
                      <div>
                        <p className="font-medium">{vault.vault_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current Value: ${vault.current_value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={risk.color as "default" | "destructive" | "outline" | "secondary"}>
                        {risk.level}
                      </Badge>
                      <p className="text-sm font-semibold mt-1">
                        ${vault.amount_at_risk_usd.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};