import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnclaimedFee {
  id: string;
  operator_id: string;
  amount_usd: number;
  last_updated: string;
  operator: {
    name: string;
    operator_address: string;
  };
}

export const CuratorUnclaimedFeesWidget = () => {
  const [unclaimedFees, setUnclaimedFees] = useState<UnclaimedFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnclaimedFees = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_unclaimed_fees')
          .select(`
            id,
            operator_id,
            amount_usd,
            last_updated,
            operator:operators(name, operator_address)
          `)
          .gt('amount_usd', 0)
          .order('amount_usd', { ascending: false });

        if (error) throw error;
        setUnclaimedFees(data || []);
      } catch (error) {
        console.error('Error fetching unclaimed fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnclaimedFees();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_unclaimed_fees_curator')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_unclaimed_fees'
        },
        () => {
          fetchUnclaimedFees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalUnclaimedUsd = unclaimedFees.reduce((sum, fee) => sum + fee.amount_usd, 0);

  const handleClaimAllFees = async () => {
    setClaiming(true);
    
    try {
      // Simulate claiming all fees
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "All Fees Claimed",
        description: `Successfully claimed $${totalUnclaimedUsd.toLocaleString()} in unclaimed fees`,
      });
      
      // Refresh the data
      const { data, error } = await supabase
        .from('operator_unclaimed_fees')
        .select(`
          id,
          operator_id,
          amount_usd,
          last_updated,
          operator:operators(name, operator_address)
        `)
        .gt('amount_usd', 0)
        .order('amount_usd', { ascending: false });

      if (!error) {
        setUnclaimedFees(data || []);
      }
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim unclaimed fees",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimSpecificFee = async (feeId: string, operatorName: string, amount: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Fee Claimed",
        description: `Successfully claimed $${amount.toLocaleString()} from ${operatorName}`,
      });
      
      // Remove the claimed fee from the list
      setUnclaimedFees(prev => prev.filter(fee => fee.id !== feeId));
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: `Failed to claim fee from ${operatorName}`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Unclaimed Fees (USD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Unclaimed Fees (USD)
          <Badge variant="outline" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">
            ${totalUnclaimedUsd.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            Total Unclaimed Fees Available
          </p>
        </div>

        {totalUnclaimedUsd > 0 && (
          <Button 
            onClick={handleClaimAllFees}
            disabled={claiming}
            className="w-full"
            size="lg"
          >
            {claiming ? (
              <>Processing...</>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Claim All Fees (${totalUnclaimedUsd.toLocaleString()})
              </>
            )}
          </Button>
        )}

        <div className="space-y-3">
          {unclaimedFees.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No unclaimed fees available</p>
            </div>
          ) : (
            unclaimedFees.slice(0, 5).map((fee) => (
              <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{fee.operator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fee.operator.operator_address.substring(0, 16)}...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    ${fee.amount_usd.toLocaleString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaimSpecificFee(fee.id, fee.operator.name, fee.amount_usd)}
                    className="mt-1"
                  >
                    Claim
                  </Button>
                </div>
              </div>
            ))
          )}

          {unclaimedFees.length > 5 && (
            <p className="text-center text-sm text-muted-foreground">
              And {unclaimedFees.length - 5} more operators with unclaimed fees
            </p>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Last updated: {unclaimedFees.length > 0 ? new Date(unclaimedFees[0].last_updated).toLocaleString() : 'Never'}
        </div>
      </CardContent>
    </Card>
  );
};