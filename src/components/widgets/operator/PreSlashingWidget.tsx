import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, RotateCcw, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PreSlashingData {
  operator_id: string;
  operator_name: string;
  operator_address: string;
  token_type: string;
  amount: number;
  usd_value: number;
  updated_at: string;
}

export function PreSlashingWidget() {
  const [preSlashingData, setPreSlashingData] = useState<PreSlashingData[]>([]);
  const [expandedOperator, setExpandedOperator] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const tokenColors: Record<string, string> = {
    ETH: 'bg-blue-500/10 text-blue-700 border-blue-200',
    USDC: 'bg-green-500/10 text-green-700 border-green-200',
    USDT: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    DAI: 'bg-orange-500/10 text-orange-700 border-orange-200',
    WBTC: 'bg-purple-500/10 text-purple-700 border-purple-200'
  };

  useEffect(() => {
    fetchPreSlashingData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('pre-slashing-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'operator_pre_slashing' },
        () => fetchPreSlashingData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPreSlashingData = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_pre_slashing')
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
        usd_value: item.usd_value,
        updated_at: item.updated_at
      }));
      
      setPreSlashingData(formattedData);
    } catch (error) {
      console.error('Error fetching pre-slashing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedData = preSlashingData.reduce((acc, item) => {
    if (!acc[item.operator_id]) {
      acc[item.operator_id] = {
        operator_name: item.operator_name,
        operator_address: item.operator_address,
        total_usd: 0,
        tokens: [],
        last_updated: item.updated_at
      };
    }
    
    acc[item.operator_id].total_usd += item.usd_value;
    acc[item.operator_id].tokens.push({
      token_type: item.token_type,
      amount: item.amount,
      usd_value: item.usd_value,
      updated_at: item.updated_at
    });
    
    // Update last_updated to the most recent
    if (new Date(item.updated_at) > new Date(acc[item.operator_id].last_updated)) {
      acc[item.operator_id].last_updated = item.updated_at;
    }
    
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPreSlashed = Object.values(groupedData).reduce((sum, data) => sum + data.total_usd, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Amount Pre-Slashed</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchPreSlashingData}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-status-warning tabular-nums">
              {formatUSD(totalPreSlashed)}
            </p>
            <p className="text-sm text-muted-foreground">Total Pre-Slashed</p>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No pre-slashing data found</div>
          ) : (
            Object.entries(groupedData).map(([operatorId, data]) => (
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
                    <p className="font-bold text-lg tabular-nums text-status-warning">
                      {formatUSD(data.total_usd)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {showHistory ? formatDate(data.last_updated) : `${data.tokens.length} tokens`}
                    </p>
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
                          {showHistory && (
                            <p className="text-xs text-muted-foreground">
                              {formatDate(token.updated_at)}
                            </p>
                          )}
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