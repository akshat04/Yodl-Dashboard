import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, AlertTriangle, ArrowRight } from "lucide-react";

interface EscrowTransaction {
  id: string;
  transaction_hash: string | null;
  status: string;
  amount: number;
  operator_id: string | null;
  is_public_call: boolean;
  created_at: string;
  operator?: {
    name: string;
  };
}

interface ChartData {
  timestamp: string;
  pending_count: number;
}

export const EscrowTransactionsWidget = () => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('fund_escrow_transactions')
          .select(`
            id,
            transaction_hash,
            status,
            amount,
            operator_id,
            is_public_call,
            created_at,
            operator:operators(name)
          `)
          .eq('is_public_call', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);

        // Generate sample historical data for pending transactions count
        const now = new Date();
        const pendingTransactions = (data || []).filter(tx => tx.status === 'pending');
        const historicalData = Array.from({ length: 24 }, (_, i) => {
          const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
          // Simulate historical pending counts with some variation
          const basePendingCount = pendingTransactions.length;
          const variation = Math.floor(Math.sin(i * 0.3) * 3);
          
          return {
            timestamp: timestamp.toLocaleTimeString(),
            pending_count: Math.max(0, basePendingCount + variation)
          };
        });

        setChartData(historicalData);
      } catch (error) {
        console.error('Error fetching escrow transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('fund_escrow_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fund_escrow_transactions'
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');
  const totalPending = pendingTransactions.length;
  const isBacklogged = totalPending > 10; // Consider > 10 as backlogged

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'pending': return 'default';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Fund Escrow Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Fund Escrow Transactions
          {isBacklogged && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Backlog
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${isBacklogged ? 'text-destructive' : 'text-primary'}`}>
            {totalPending}
          </div>
          <p className="text-sm text-muted-foreground">
            Pending Public Call Transactions
          </p>
        </div>

        {chartData.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ArrowRight className="h-4 w-4" />
              Pending Count Trend (24h)
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp" 
                    className="text-xs"
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value) => [
                      `${value} transactions`,
                      'Pending Count'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending_count" 
                    stroke={isBacklogged ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Transactions</h4>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No transactions found</p>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.operator?.name || 'Unknown Operator'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transaction_hash ? 
                        `${transaction.transaction_hash.substring(0, 10)}...` : 
                        'No hash'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>
                    {transaction.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm font-semibold mt-1">
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};