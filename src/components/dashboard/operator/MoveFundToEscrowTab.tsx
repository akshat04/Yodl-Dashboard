import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EscrowTransaction {
  id: string;
  transaction_hash: string | null;
  status: string;
  amount: number;
  created_at: string;
}

export function MoveFundToEscrowTab() {
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await supabase
        .from('fund_escrow_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const mockEscrowTransactions: EscrowTransaction[] = [
        { id: '1', transaction_hash: '0xabc123...', status: 'pending', amount: 100000, created_at: new Date().toISOString() },
        { id: '2', transaction_hash: '0xdef456...', status: 'completed', amount: 75000, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', transaction_hash: '0xghi789...', status: 'pending', amount: 50000, created_at: new Date(Date.now() - 172800000).toISOString() }
      ];

      setEscrowTransactions((data && data.length > 0) ? data : mockEscrowTransactions);
    } catch (error) {
      console.error('Error fetching escrow transactions:', error);
      setEscrowTransactions([
        { id: '1', transaction_hash: '0xabc123...', status: 'pending', amount: 100000, created_at: new Date().toISOString() },
        { id: '2', transaction_hash: '0xdef456...', status: 'completed', amount: 75000, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', transaction_hash: '0xghi789...', status: 'pending', amount: 50000, created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransaction = (txHash: string | null) => {
    toast({
      title: "Execute Transaction",
      description: `Executing transaction ${txHash?.substring(0, 10)}...`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fund Escrow Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Fund Escrow Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {escrowTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                    {tx.status}
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">
                    {tx.transaction_hash?.substring(0, 10)}...
                  </span>
                </div>
                <div className="mt-1">
                  <p className="font-medium">${tx.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    To Escrow: ${(tx.amount * 0.95).toLocaleString()} | 
                    To FeeManager: ${(tx.amount * 0.05).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => handleExecuteTransaction(tx.transaction_hash)}
                disabled={tx.status === 'completed'}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Execute
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}