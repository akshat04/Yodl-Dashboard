import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Coins } from "lucide-react";

interface YodlBalance {
  id: string;
  operator_id: string;
  balance: number;
  usd_value: number;
  operator: {
    name: string;
  };
}

export const YodlStakedBalanceWidget = () => {
  const [balances, setBalances] = useState<YodlBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const { data, error } = await supabase
          .from('yodl_staked_balances')
          .select(`
            id,
            operator_id,
            balance,
            usd_value,
            operator:operators(name)
          `)
          .order('balance', { ascending: false });

        if (error) throw error;
        setBalances(data || []);
      } catch (error) {
        console.error('Error fetching YODL staked balances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();

    // Set up real-time subscription
    const channel = supabase
      .channel('yodl_staked_balances_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yodl_staked_balances'
        },
        () => {
          fetchBalances();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalStaked = balances.reduce((sum, balance) => sum + balance.balance, 0);
  const totalUsdValue = balances.reduce((sum, balance) => sum + balance.usd_value, 0);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            YODL Staked Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
          <Coins className="h-5 w-5" />
          YODL Staked Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {totalStaked.toLocaleString()} YODL
          </div>
          <div className="text-sm text-muted-foreground">
            ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="space-y-3">
          {balances.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No YODL balances found</p>
          ) : (
            balances.map((balance) => (
              <div key={balance.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{balance.operator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${balance.usd_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {balance.balance.toLocaleString()} YODL
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};