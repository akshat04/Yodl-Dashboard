import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Scale, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface OrchestratorBalance {
  id: string;
  operator_id: string;
  orchestrator_balance: number;
  escrow_balance: number;
  discrepancy: number;
  risk_level: string;
  operator: {
    name: string;
  };
}

interface ChartData {
  operator_name: string;
  orchestrator: number;
  escrow: number;
  discrepancy: number;
  risk_level: string;
}

const RISK_COLORS = {
  low: '#10b981', // green
  medium: '#f59e0b', // amber  
  high: '#ef4444' // red
};

export const OrchestratorBalancesWidget = () => {
  const [balanceData, setBalanceData] = useState<OrchestratorBalance[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        const { data, error } = await supabase
          .from('orchestrator_balances')
          .select(`
            id,
            operator_id,
            orchestrator_balance,
            escrow_balance,
            discrepancy,
            risk_level,
            operator:operators(name)
          `)
          .order('discrepancy', { ascending: false });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          operator_name: item.operator.name.length > 12 ? 
            item.operator.name.substring(0, 12) + '...' : 
            item.operator.name,
          orchestrator: item.orchestrator_balance,
          escrow: item.escrow_balance,
          discrepancy: Math.abs(item.discrepancy),
          risk_level: item.risk_level
        }));

        setBalanceData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching orchestrator balance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceData();

    // Set up real-time subscription
    const channel = supabase
      .channel('orchestrator_balances_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orchestrator_balances'
        },
        () => {
          fetchBalanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return "destructive";
      case 'medium': return "default";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Orchestrator vs Escrow Balance
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
          <Scale className="h-5 w-5" />
          Orchestrator vs Escrow Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No balance data found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="operator_name" 
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
                      `$${Number(value).toLocaleString()}`,
                      name === 'orchestrator' ? 'Orchestrator' : 'Escrow'
                    ]}
                  />
                  <Bar dataKey="orchestrator" fill="hsl(var(--primary))" name="orchestrator" />
                  <Bar dataKey="escrow" fill="hsl(var(--muted))" name="escrow" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {balanceData.map((balance) => (
                <div key={balance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(balance.risk_level)}
                    <div>
                      <p className="font-medium">{balance.operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Orchestrator: ${balance.orchestrator_balance.toLocaleString()} | 
                        Escrow: ${balance.escrow_balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getRiskBadgeVariant(balance.risk_level)} className="mb-1">
                      {balance.risk_level.toUpperCase()}
                    </Badge>
                    <p className={`text-sm font-semibold ${
                      balance.discrepancy !== 0 ? 'text-warning' : 'text-muted-foreground'
                    }`}>
                      {balance.discrepancy > 0 ? '+' : ''}${balance.discrepancy.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Orchestrator</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Escrow</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};