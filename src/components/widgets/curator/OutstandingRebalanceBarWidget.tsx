import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutstandingRebalance {
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
  vault_address: string;
}

export const OutstandingRebalanceBarWidget = () => {
  const [rebalanceData, setRebalanceData] = useState<OutstandingRebalance[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRebalanceData = async () => {
      try {
        const { data, error } = await supabase
          .from('vault_outstanding_rebalances')
          .select('*')
          .gt('outstanding_usd_value', 0)
          .order('outstanding_usd_value', { ascending: false });

        if (error) throw error;

        const processedData = (data || []).map((item) => ({
          vault_name: item.vault_name.length > 12 ? 
            item.vault_name.substring(0, 12) + '...' : 
            item.vault_name,
          quantity: item.outstanding_quantity,
          usd_value: item.outstanding_usd_value,
          token_type: item.token_type,
          vault_address: item.vault_address
        }));

        setRebalanceData(data || []);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching outstanding rebalance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRebalanceData();

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_outstanding_rebalances_bar')
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

  const handleBarClick = (data: any) => {
    const vaultData = rebalanceData.find(item => item.vault_name.includes(data.vault_name.replace('...', '')));
    if (vaultData) {
      handleRebalanceRequest(vaultData.vault_address, vaultData.vault_name, vaultData.outstanding_usd_value);
    }
  };

  const handleRebalanceRequest = async (vaultAddress: string, vaultName: string, amount: number) => {
    try {
      // Simulate rebalance request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Rebalance Request Initiated",
        description: `Rebalance request sent for ${vaultName} ($${amount.toLocaleString()})`,
      });
      
      // In a real implementation, this would redirect to a rebalance request page
      console.log(`Redirect to rebalance page for vault: ${vaultAddress}`);
      
    } catch (error) {
      toast({
        title: "Request Failed", 
        description: `Failed to initiate rebalance request for ${vaultName}`,
        variant: "destructive",
      });
    }
  };

  const totalOutstanding = rebalanceData.reduce((sum, item) => sum + item.outstanding_usd_value, 0);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Outstanding Rebalance Amounts
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
          Outstanding Rebalance Amounts
          <Badge variant="outline" className="ml-auto">
            ${totalOutstanding.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No outstanding rebalances found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {rebalanceData.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Vaults Requiring Rebalancing
              </p>
            </div>

            {/* Interactive Bar Chart */}
            <div className="h-48">
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
                      `$${Number(value).toLocaleString()}`,
                      'Outstanding USD'
                    ]}
                    labelFormatter={(label) => `Vault: ${label}`}
                  />
                  <Bar 
                    dataKey="usd_value" 
                    fill="hsl(var(--primary))"
                    onClick={handleBarClick}
                    style={{ cursor: 'pointer' }}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Clickable vault list */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Click to initiate rebalance request:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {rebalanceData.map((vault) => (
                  <div 
                    key={vault.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleRebalanceRequest(vault.vault_address, vault.vault_name, vault.outstanding_usd_value)}
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{vault.vault_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {vault.vault_address.substring(0, 16)}... • {vault.token_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${vault.outstanding_usd_value.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vault.outstanding_quantity.toLocaleString()} {vault.token_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Bulk Rebalance",
                    description: "Initiating rebalance requests for all outstanding vaults",
                  });
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Initiate All Rebalance Requests
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};