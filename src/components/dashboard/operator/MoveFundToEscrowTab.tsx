import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import daiLogo from "@/assets/tokens/dai.png";
import usdcLogo from "@/assets/tokens/usdc.png";
import usdtLogo from "@/assets/tokens/usdt.png";
import wethLogo from "@/assets/tokens/weth.png";

interface TradeSettlement {
  id: string;
  token: string;
  quantity: number;
  fee: number;
  transaction_hash: string | null;
  status: 'pending' | 'completed';
  created_at: string;
}

const tokenLogos: Record<string, string> = {
  'USDC': usdcLogo,
  'WETH': wethLogo,
  'DAI': daiLogo,
  'USDT': usdtLogo,
};

export function MoveFundToEscrowTab() {
  const [tradeSettlements, setTradeSettlements] = useState<TradeSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPending, setSelectedPending] = useState<string[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed'>('pending');
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

      const mockTradeSettlements: TradeSettlement[] = [
        { id: '1', token: 'USDC', quantity: 10000, fee: 50, transaction_hash: null, status: 'pending', created_at: new Date().toISOString() },
        { id: '2', token: 'WETH', quantity: 5.5, fee: 0.025, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', token: 'DAI', quantity: 7500, fee: 37.5, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: '4', token: 'USDT', quantity: 8200, fee: 41, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 10800000).toISOString() },
        { id: '5', token: 'USDC', quantity: 15000, fee: 75, transaction_hash: '0xabc123def456789012345678901234567890abcd', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '6', token: 'WETH', quantity: 3.2, fee: 0.016, transaction_hash: '0xdef456789012345678901234567890abcdef1234', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '7', token: 'DAI', quantity: 12000, fee: 60, transaction_hash: '0x789012345678901234567890abcdef123456789a', status: 'completed', created_at: new Date(Date.now() - 259200000).toISOString() }
      ];

      setTradeSettlements(mockTradeSettlements);
    } catch (error) {
      console.error('Error fetching trade settlements:', error);
      setTradeSettlements([
        { id: '1', token: 'USDC', quantity: 10000, fee: 50, transaction_hash: null, status: 'pending', created_at: new Date().toISOString() },
        { id: '2', token: 'WETH', quantity: 5.5, fee: 0.025, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', token: 'DAI', quantity: 7500, fee: 37.5, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: '4', token: 'USDT', quantity: 8200, fee: 41, transaction_hash: null, status: 'pending', created_at: new Date(Date.now() - 10800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedPending(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const pendingIds = tradeSettlements
      .filter(t => t.status === 'pending')
      .map(t => t.id);
    setSelectedPending(pendingIds);
  };

  const handleClearSelection = () => {
    setSelectedPending([]);
  };

  const handleExecuteBatch = () => {
    const selectedTransactions = tradeSettlements.filter(t => 
      selectedPending.includes(t.id)
    );
    
    toast({
      title: "Executing Batch",
      description: `Executing ${selectedTransactions.length} transaction(s)...`,
    });
    
    setTradeSettlements(prev => 
      prev.map(t => 
        selectedPending.includes(t.id)
          ? { ...t, status: 'completed', transaction_hash: `0x${Math.random().toString(16).slice(2, 42)}` }
          : t
      )
    );
    
    setSelectedPending([]);
  };

  const handleExecuteSingle = (id: string) => {
    toast({
      title: "Executing Transaction",
      description: `Executing transaction...`,
    });
    
    setTradeSettlements(prev => 
      prev.map(t => 
        t.id === id
          ? { ...t, status: 'completed', transaction_hash: `0x${Math.random().toString(16).slice(2, 42)}` }
          : t
      )
    );
  };

  const handleViewTransaction = (txHash: string) => {
    const explorerUrl = `https://etherscan.io/tx/${txHash}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
  };

  const pendingTransactions = tradeSettlements.filter(t => t.status === 'pending');
  const completedTransactions = tradeSettlements.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Finalize Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'pending' | 'completed')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="data-[state=inactive]:text-foreground">Pending</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=inactive]:text-foreground">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedPending.length === pendingTransactions.length && pendingTransactions.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) handleSelectAll();
                          else handleClearSelection();
                        }}
                      />
                    </TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No pending transactions
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingTransactions.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPending.includes(trade.id)}
                            onCheckedChange={() => handleRowSelect(trade.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <img src={tokenLogos[trade.token]} alt={trade.token} className="w-6 h-6" />
                            {trade.token}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{trade.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{trade.fee.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleExecuteSingle(trade.id)}>
                            Execute
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {pendingTransactions.length > 0 && (
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectAll}
                    disabled={pendingTransactions.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    onClick={handleExecuteBatch}
                    disabled={selectedPending.length === 0}
                  >
                    Execute Batch ({selectedPending.length})
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No completed transactions
                      </TableCell>
                    </TableRow>
                  ) : (
                    completedTransactions.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <img src={tokenLogos[trade.token]} alt={trade.token} className="w-6 h-6" />
                            {trade.token}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{trade.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{trade.fee.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewTransaction(trade.transaction_hash!)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Tx
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}