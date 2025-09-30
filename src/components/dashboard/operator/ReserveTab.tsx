import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Shield, Wallet, ArrowRight, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface YodlBalance {
  id: string;
  operator_id: string;
  balance: number;
  usd_value: number;
  operator: { name: string };
}

interface PreSlashedData {
  id: string;
  vault_address: string;
  vault_name: string;
  utilized_amount: number;
  remaining_amount: number;
  total_allocated: number;
  utilization_percentage: number;
}

interface DelegationData {
  id: string;
  operator_id: string;
  amount: number;
  usd_value: number;
  token_type: string;
}

interface EscrowTransaction {
  id: string;
  transaction_hash: string | null;
  status: string;
  amount: number;
  created_at: string;
}

interface EscrowTokenBalance {
  id: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
}

export function ReserveTab() {
  const [yodlBalances, setYodlBalances] = useState<YodlBalance[]>([]);
  const [preSlashedData, setPreSlashedData] = useState<PreSlashedData[]>([]);
  const [delegations, setDelegations] = useState<DelegationData[]>([]);
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [escrowTokenBalances, setEscrowTokenBalances] = useState<EscrowTokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [yodlRes, preSlashedRes, delegationRes, escrowRes] = await Promise.all([
        supabase.from('yodl_staked_balances').select('*, operator:operators(name)'),
        supabase.from('delegated_vault_pre_slashing').select('*'),
        supabase.from('operator_delegations').select('*'),
        supabase.from('fund_escrow_transactions').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      // Use real data or fallback to mock data for demo
      const mockYodlBalances: YodlBalance[] = [
        { id: '1', operator_id: 'op1', balance: 50000, usd_value: 125000, operator: { name: 'Vault Alpha' } },
        { id: '2', operator_id: 'op2', balance: 30000, usd_value: 75000, operator: { name: 'Vault Beta' } },
        { id: '3', operator_id: 'op3', balance: 20000, usd_value: 50000, operator: { name: 'Vault Gamma' } }
      ];

      const mockPreSlashedData: PreSlashedData[] = [
        { id: '1', vault_address: '0x123...abc', vault_name: 'Vault Alpha', utilized_amount: 45000, remaining_amount: 80000, total_allocated: 125000, utilization_percentage: 36 },
        { id: '2', vault_address: '0x456...def', vault_name: 'Vault Beta', utilized_amount: 30000, remaining_amount: 45000, total_allocated: 75000, utilization_percentage: 40 },
        { id: '3', vault_address: '0x789...ghi', vault_name: 'Vault Gamma', utilized_amount: 10000, remaining_amount: 40000, total_allocated: 50000, utilization_percentage: 20 }
      ];

      const mockDelegations: DelegationData[] = [
        { id: '1', operator_id: 'op1', amount: 1000000, usd_value: 1000000, token_type: 'USDC' },
        { id: '2', operator_id: 'op2', amount: 500, usd_value: 800000, token_type: 'WETH' },
        { id: '3', operator_id: 'op3', amount: 10, usd_value: 600000, token_type: 'WBTC' }
      ];

      const mockEscrowTransactions: EscrowTransaction[] = [
        { id: '1', transaction_hash: '0xabc123...', status: 'pending', amount: 100000, created_at: new Date().toISOString() },
        { id: '2', transaction_hash: '0xdef456...', status: 'completed', amount: 75000, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', transaction_hash: '0xghi789...', status: 'pending', amount: 50000, created_at: new Date(Date.now() - 172800000).toISOString() }
      ];

      const mockEscrowTokenBalances: EscrowTokenBalance[] = [
        { id: '1', token_symbol: 'USDC', amount: 850000, usd_value: 850000 },
        { id: '2', token_symbol: 'WETH', amount: 320, usd_value: 800000 },
        { id: '3', token_symbol: 'USDT', amount: 600000, usd_value: 600000 },
        { id: '4', token_symbol: 'DAI', amount: 400000, usd_value: 400000 },
        { id: '5', token_symbol: 'WBTC', amount: 12, usd_value: 720000 }
      ];

      setYodlBalances((yodlRes.data && yodlRes.data.length > 0) ? yodlRes.data : mockYodlBalances);
      setPreSlashedData((preSlashedRes.data && preSlashedRes.data.length > 0) ? preSlashedRes.data : mockPreSlashedData);
      setDelegations((delegationRes.data && delegationRes.data.length > 0) ? delegationRes.data : mockDelegations);
      setEscrowTransactions((escrowRes.data && escrowRes.data.length > 0) ? escrowRes.data : mockEscrowTransactions);
      setEscrowTokenBalances(mockEscrowTokenBalances);
    } catch (error) {
      console.error('Error fetching reserve data:', error);
      // Fallback to mock data on error
      setYodlBalances([
        { id: '1', operator_id: 'op1', balance: 50000, usd_value: 125000, operator: { name: 'Vault Alpha' } },
        { id: '2', operator_id: 'op2', balance: 30000, usd_value: 75000, operator: { name: 'Vault Beta' } },
        { id: '3', operator_id: 'op3', balance: 20000, usd_value: 50000, operator: { name: 'Vault Gamma' } }
      ]);
      setPreSlashedData([
        { id: '1', vault_address: '0x123...abc', vault_name: 'Vault Alpha', utilized_amount: 45000, remaining_amount: 80000, total_allocated: 125000, utilization_percentage: 36 },
        { id: '2', vault_address: '0x456...def', vault_name: 'Vault Beta', utilized_amount: 30000, remaining_amount: 45000, total_allocated: 75000, utilization_percentage: 40 },
        { id: '3', vault_address: '0x789...ghi', vault_name: 'Vault Gamma', utilized_amount: 10000, remaining_amount: 40000, total_allocated: 50000, utilization_percentage: 20 }
      ]);
      setDelegations([
        { id: '1', operator_id: 'op1', amount: 1000000, usd_value: 1000000, token_type: 'USDC' },
        { id: '2', operator_id: 'op2', amount: 500, usd_value: 800000, token_type: 'WETH' },
        { id: '3', operator_id: 'op3', amount: 10, usd_value: 600000, token_type: 'WBTC' }
      ]);
      setEscrowTransactions([
        { id: '1', transaction_hash: '0xabc123...', status: 'pending', amount: 100000, created_at: new Date().toISOString() },
        { id: '2', transaction_hash: '0xdef456...', status: 'completed', amount: 75000, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', transaction_hash: '0xghi789...', status: 'pending', amount: 50000, created_at: new Date(Date.now() - 172800000).toISOString() }
      ]);
      setEscrowTokenBalances([
        { id: '1', token_symbol: 'USDC', amount: 850000, usd_value: 850000 },
        { id: '2', token_symbol: 'WETH', amount: 320, usd_value: 800000 },
        { id: '3', token_symbol: 'USDT', amount: 600000, usd_value: 600000 },
        { id: '4', token_symbol: 'DAI', amount: 400000, usd_value: 400000 },
        { id: '5', token_symbol: 'WBTC', amount: 12, usd_value: 720000 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlashPreFund = (vaultName: string, amount: number) => {
    toast({
      title: "Slash/Pre-Fund",
      description: `Initiating slash/pre-fund for ${vaultName}: ${amount.toLocaleString()} YODL`,
    });
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
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const totalYodlStaked = yodlBalances.reduce((sum, b) => sum + b.balance, 0);
  const totalYodlUsd = yodlBalances.reduce((sum, b) => sum + b.usd_value, 0);
  const totalSlashed = preSlashedData.reduce((sum, p) => sum + p.utilized_amount, 0);
  const totalSlashable = totalYodlUsd; // Simplified calculation

  return (
    <div className="space-y-6">
      {/* YODL Staked Balance with Slash/Pre-Fund Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            YODL Staked Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Staked</p>
              <p className="text-2xl font-bold">{totalYodlStaked.toLocaleString()} YODL</p>
              <p className="text-sm text-muted-foreground">${totalYodlUsd.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Slashable Amount</p>
              <p className="text-2xl font-bold">${(totalSlashable - totalSlashed).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-3">
            {yodlBalances.map((balance) => {
              const preSlashedForVault = preSlashedData.find(p => p.vault_name === balance.operator.name);
              const slashableAmount = balance.usd_value - (preSlashedForVault?.utilized_amount || 0);
              
              return (
                <div key={balance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{balance.operator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {balance.balance.toLocaleString()} YODL (${balance.usd_value.toLocaleString()})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Slashable: ${slashableAmount.toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleSlashPreFund(balance.operator.name, balance.balance)}
                  >
                    Slash/Pre-Fund
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pre-Slashed Utilization by Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Pre-Slashed Amounts (Vault-wise)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preSlashedData.map((vault) => (
            <div key={vault.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{vault.vault_name}</span>
                <span className="text-sm text-muted-foreground">
                  {vault.utilization_percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={vault.utilization_percentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Utilized: ${vault.utilized_amount.toLocaleString()}</span>
                <span>Total: ${vault.total_allocated.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Total Slashable vs Slashed Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Slashable Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Already Slashed vs Total Slashable</span>
            <span className="font-bold">
              ${totalSlashed.toLocaleString()} / ${totalSlashable.toLocaleString()}
            </span>
          </div>
          <Progress value={(totalSlashed / totalSlashable) * 100} className="h-4" />
        </CardContent>
      </Card>

      {/* Delegations by Execution Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Delegations by Execution Vault
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {delegations.map((delegation) => {
            const totalDelegation = delegations.reduce((sum, d) => sum + d.usd_value, 0);
            const utilizationPercent = totalDelegation > 0 ? (delegation.usd_value / totalDelegation) * 100 : 0;
            
            return (
              <div key={delegation.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{delegation.token_type} Vault</span>
                  <span>${delegation.usd_value.toLocaleString()}</span>
                </div>
                <Progress value={utilizationPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{delegation.amount.toLocaleString()} tokens</span>
                  <span>{utilizationPercent.toFixed(1)}% utilized</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Taker Tokens in Escrow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Taker Tokens in Escrow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-primary/10 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">Total Escrow Value</p>
            <p className="text-3xl font-bold">
              ${escrowTokenBalances.reduce((sum, token) => sum + token.usd_value, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {escrowTokenBalances.length} token types
            </p>
          </div>
          
          {escrowTokenBalances.map((token) => (
            <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-sm text-primary">{token.token_symbol.substring(0, 2)}</span>
                </div>
                <div>
                  <p className="font-medium">{token.token_symbol}</p>
                  <p className="text-sm text-muted-foreground">
                    {token.amount.toLocaleString()} tokens
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${token.usd_value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">USD Value</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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