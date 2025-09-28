import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, DollarSign, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UnclaimedFeeData {
  operator_id: string;
  operator_name: string;
  operator_address: string;
  amount_usd: number;
  last_updated: string;
}

export function UnclaimedFeesWidget() {
  const [unclaimedFees, setUnclaimedFees] = useState<UnclaimedFeeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnclaimedFees();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('unclaimed-fees-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'operator_unclaimed_fees' },
        () => fetchUnclaimedFees()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnclaimedFees = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_unclaimed_fees')
        .select(`
          *,
          operators (
            name,
            operator_address
          )
        `)
        .order('amount_usd', { ascending: false });

      if (error) throw error;
      
      const formattedData = (data || []).map(item => ({
        operator_id: item.operator_id,
        operator_name: item.operators?.name || 'Unknown',
        operator_address: item.operators?.operator_address || '',
        amount_usd: item.amount_usd,
        last_updated: item.last_updated
      }));
      
      setUnclaimedFees(formattedData);
    } catch (error) {
      console.error('Error fetching unclaimed fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFees = (operatorId: string, operatorName: string) => {
    // This would typically open a transaction modal or redirect to claim interface
    console.log(`Claiming fees for operator: ${operatorName} (${operatorId})`);
    // In a real app, this would trigger a smart contract call
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

  const totalUnclaimed = unclaimedFees.reduce((sum, fee) => sum + fee.amount_usd, 0);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Unclaimed Fees</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchUnclaimedFees}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-status-success/10 border border-status-success/20 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="h-6 w-6 text-status-success" />
            <div className="text-center">
              <p className="text-2xl font-bold text-status-success tabular-nums">
                {formatUSD(totalUnclaimed)}
              </p>
              <p className="text-sm text-muted-foreground">Total Available</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : unclaimedFees.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No unclaimed fees found</div>
          ) : (
            unclaimedFees.map((fee) => (
              <div key={fee.operator_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{fee.operator_name}</p>
                    <p className="font-bold text-lg tabular-nums text-status-success">
                      {formatUSD(fee.amount_usd)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">
                      {fee.operator_address.slice(0, 6)}...{fee.operator_address.slice(-4)}
                    </span>
                    <span>Updated {formatDate(fee.last_updated)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleClaimFees(fee.operator_id, fee.operator_name)}
                    className="flex items-center gap-2"
                    disabled={fee.amount_usd === 0}
                  >
                    <span>Claim</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {unclaimedFees.length > 0 && totalUnclaimed > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => console.log('Claiming all fees')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Claim All Fees ({formatUSD(totalUnclaimed)})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}