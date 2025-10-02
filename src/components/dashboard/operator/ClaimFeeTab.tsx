import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import usdcLogo from "@/assets/tokens/usdc.png";
import usdtLogo from "@/assets/tokens/usdt.png";
import daiLogo from "@/assets/tokens/dai.png";
import wethLogo from "@/assets/tokens/weth.png";

interface UnclaimedFee {
  id: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  operator_id: string;
}

interface ClaimFeeTabProps {
  unclaimedFees: UnclaimedFee[];
  setUnclaimedFees: React.Dispatch<React.SetStateAction<UnclaimedFee[]>>;
}

export function ClaimFeeTab({ unclaimedFees, setUnclaimedFees }: ClaimFeeTabProps) {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const tokenLogos: Record<string, string> = {
    USDC: usdcLogo,
    USDT: usdtLogo,
    DAI: daiLogo,
    WETH: wethLogo,
  };

  useEffect(() => {
    // Only fetch if fees haven't been loaded yet
    if (unclaimedFees.length === 0) {
      fetchFees();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFees = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_unclaimed_fees')
        .select('*');

      if (error) throw error;

      // Mock data for demonstration with different tokens
      const mockFees: UnclaimedFee[] = [
        { id: '1', token_symbol: 'USDC', amount: 5000, usd_value: 5000, operator_id: 'op1' },
        { id: '2', token_symbol: 'USDT', amount: 3200, usd_value: 3200, operator_id: 'op1' },
        { id: '3', token_symbol: 'DAI', amount: 1800, usd_value: 1800, operator_id: 'op1' },
        { id: '4', token_symbol: 'WETH', amount: 2.5, usd_value: 6250, operator_id: 'op1' },
      ];

      setUnclaimedFees(mockFees);
    } catch (error) {
      console.error('Error fetching unclaimed fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (feeId: string, tokenSymbol: string, amount: number, usdValue: number) => {
    // Remove the specific fee from the list
    setUnclaimedFees(unclaimedFees.filter(f => f.id !== feeId));
    
    toast({
      title: "Fee Claimed",
      description: `Claimed ${amount.toLocaleString()} ${tokenSymbol} ($${usdValue.toLocaleString()})`,
    });
  };

  const handleClaimAll = () => {
    const total = unclaimedFees.reduce((sum, f) => sum + f.usd_value, 0);
    
    // Clear all fees
    setUnclaimedFees([]);
    
    toast({
      title: "All Fees Claimed",
      description: `Successfully claimed all fees worth $${total.toLocaleString()}`,
    });
  };

  const totalUnclaimed = unclaimedFees.reduce((sum, f) => sum + f.usd_value, 0);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Unclaimed Fees by Token
            </CardTitle>
            <Badge variant="default" className="text-lg">
              ${totalUnclaimed.toLocaleString()} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Card */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Unclaimed Value</p>
                <p className="text-4xl font-bold text-primary">${totalUnclaimed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">{unclaimedFees.length} tokens available</p>
              </div>
              <Button size="lg" onClick={handleClaimAll} disabled={unclaimedFees.length === 0}>
                <DollarSign className="h-5 w-5 mr-2" />
                Claim All
              </Button>
            </div>
          </div>

          {/* Individual Token Fees */}
          <div className="space-y-3">
            {unclaimedFees.map((fee) => (
              <div 
                key={fee.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-background border-2 border-border flex items-center justify-center overflow-hidden">
                    <img 
                      src={tokenLogos[fee.token_symbol]} 
                      alt={fee.token_symbol}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{fee.token_symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {fee.amount.toLocaleString()} {fee.token_symbol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-xl">${fee.usd_value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">USD Value</p>
                  </div>
                  <Button 
                    onClick={() => handleClaim(fee.id, fee.token_symbol, fee.amount, fee.usd_value)}
                    className="flex items-center gap-2"
                  >
                    Claim
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {unclaimedFees.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No unclaimed fees available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}