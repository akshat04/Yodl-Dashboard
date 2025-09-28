import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DelegationData {
  operator_id: string;
  operator_name: string;
  operator_address: string;
  token_type: string;
  amount: number;
  usd_value: number;
}

export function DelegationWidget() {
  const [delegations, setDelegations] = useState<DelegationData[]>([]);
  const [expandedOperator, setExpandedOperator] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const tokenColors: Record<string, string> = {
    ETH: 'bg-blue-500/10 text-blue-700 border-blue-200',
    USDC: 'bg-green-500/10 text-green-700 border-green-200',
    USDT: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    DAI: 'bg-orange-500/10 text-orange-700 border-orange-200',
    WBTC: 'bg-purple-500/10 text-purple-700 border-purple-200'
  };

  useEffect(() => {
    fetchDelegations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('delegation-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'operator_delegations' },
        () => fetchDelegations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDelegations = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_delegations')
        .select(`
          *,
          operators (
            name,
            operator_address
          )
        `)
        .order('usd_value', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        operator_id: item.operator_id,
        operator_name: item.operators?.name || 'Unknown',
        operator_address: item.operators?.operator_address || '',
        token_type: item.token_type,
        amount: item.amount,
        usd_value: item.usd_value
      }));
      
      setDelegations(formattedData);
    } catch (error) {
      console.error('Error fetching delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedDelegations = delegations.reduce((acc, delegation) => {
    if (!acc[delegation.operator_id]) {
      acc[delegation.operator_id] = {
        operator_name: delegation.operator_name,
        operator_address: delegation.operator_address,
        total_usd: 0,
        tokens: []
      };
    }
    
    acc[delegation.operator_id].total_usd += delegation.usd_value;
    acc[delegation.operator_id].tokens.push({
      token_type: delegation.token_type,
      amount: delegation.amount,
      usd_value: delegation.usd_value
    });
    
    return acc;
  }, {} as Record<string, any>);

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  const formatUSD = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Amount Delegated</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchDelegations}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : Object.keys(groupedDelegations).length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No delegations found</div>
          ) : (
            Object.entries(groupedDelegations).map(([operatorId, data]) => (
              <div key={operatorId} className="border rounded-lg p-3 bg-card">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedOperator(
                    expandedOperator === operatorId ? null : operatorId
                  )}
                >
                  <div className="flex items-center gap-3">
                    {expandedOperator === operatorId ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <div>
                      <p className="font-medium">{data.operator_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {data.operator_address.slice(0, 6)}...{data.operator_address.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg tabular-nums">{formatUSD(data.total_usd)}</p>
                    <p className="text-xs text-muted-foreground">{data.tokens.length} tokens</p>
                  </div>
                </div>
                
                {expandedOperator === operatorId && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {data.tokens.map((token: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Badge className={tokenColors[token.token_type] || 'border'}>
                            {token.token_type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium tabular-nums">{formatNumber(token.amount)}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {formatUSD(token.usd_value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}