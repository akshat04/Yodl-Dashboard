import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Clock, RefreshCw, Vault, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VaultRebalance {
  id: string;
  vault_address: string;
  vault_name: string;
  maker_token: string;
  reserve_amount: number;
  escrow_amount: number;
  rebalance_amount: number;
  countdown?: number;
  isActive?: boolean;
}

interface PreSlashedVault {
  id: string;
  vault_name: string;
  maker_token: string;
  utilized_amount: number;
  total_allocated: number;
  utilization_percentage: number;
  orchestrator_deficit: number;
  escrow_balance: number;
}

interface VaultTimer {
  vaultId: string;
  countdown: number;
  isActive: boolean;
}

interface RebalanceReplenishTabProps {
  vaultTimers: VaultTimer[];
  setVaultTimers: React.Dispatch<React.SetStateAction<VaultTimer[]>>;
}

export function RebalanceReplenishTab({ vaultTimers, setVaultTimers }: RebalanceReplenishTabProps) {
  const [vaults, setVaults] = useState<VaultRebalance[]>([]);
  const [preSlashed, setPreSlashed] = useState<PreSlashedVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<PreSlashedVault | null>(null);
  const [replenishAmount, setReplenishAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [availableTokens] = useState([
    { symbol: 'USDC', escrow_balance: 25000 },
    { symbol: 'WETH', escrow_balance: 18000 },
    { symbol: 'DAI', escrow_balance: 30000 },
    { symbol: 'USDT', escrow_balance: 22000 },
    { symbol: 'WBTC', escrow_balance: 15000 },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vaultRes, preSlashedRes] = await Promise.all([
        supabase.from('vault_outstanding_rebalances').select('*'),
        supabase.from('delegated_vault_pre_slashing').select('*')
      ]);

      // Mock data for vaults - some need rebalancing, some don't
      const mockVaults: VaultRebalance[] = [
        {
          id: '1',
          vault_address: '0x1234567890abcdef1234567890abcdef12345678',
          vault_name: 'USDC Vault',
          maker_token: 'USDC',
          reserve_amount: 45000,
          escrow_amount: 12000,
          rebalance_amount: 8500,
          isActive: false
        },
        {
          id: '2',
          vault_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          reserve_amount: 32000,
          escrow_amount: 9500,
          rebalance_amount: 5200,
          isActive: false
        },
        {
          id: '3',
          vault_address: '0x9876543210fedcba9876543210fedcba98765432',
          vault_name: 'DAI Vault',
          maker_token: 'DAI',
          reserve_amount: 28000,
          escrow_amount: 7800,
          rebalance_amount: 3900,
          isActive: false
        },
        {
          id: '4',
          vault_address: '0x1111222233334444555566667777888899990000',
          vault_name: 'USDT Vault',
          maker_token: 'USDT',
          reserve_amount: 52000,
          escrow_amount: 18000,
          rebalance_amount: 0,
          isActive: false
        },
        {
          id: '5',
          vault_address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
          vault_name: 'WBTC Vault',
          maker_token: 'WBTC',
          reserve_amount: 15000,
          escrow_amount: 4500,
          rebalance_amount: 6800,
          isActive: false
        },
        {
          id: '6',
          vault_address: '0x1234abcd5678efgh9101ijkl1121mnop1314qrst',
          vault_name: 'LINK Vault',
          maker_token: 'LINK',
          reserve_amount: 38000,
          escrow_amount: 11000,
          rebalance_amount: 0,
          isActive: false
        },
        {
          id: '7',
          vault_address: '0xfedcba9876543210fedcba9876543210fedcba98',
          vault_name: 'UNI Vault',
          maker_token: 'UNI',
          reserve_amount: 22000,
          escrow_amount: 8200,
          rebalance_amount: 4100,
          isActive: false
        },
        {
          id: '8',
          vault_address: '0x9999888877776666555544443333222211110000',
          vault_name: 'MATIC Vault',
          maker_token: 'MATIC',
          reserve_amount: 41000,
          escrow_amount: 13500,
          rebalance_amount: 0,
          isActive: false
        }
      ];

      // Mock data for pre-slashed amounts
      const mockPreSlashed: PreSlashedVault[] = [
        {
          id: '1',
          vault_name: 'USDC Vault',
          maker_token: 'USDC',
          utilized_amount: 8500,
          total_allocated: 15000,
          utilization_percentage: 56.67,
          orchestrator_deficit: 5000,
          escrow_balance: 25000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: 8000,
          escrow_balance: 18000
        },
        {
          id: '3',
          vault_name: 'DAI Vault',
          maker_token: 'DAI',
          utilized_amount: 4500,
          total_allocated: 10000,
          utilization_percentage: 45,
          orchestrator_deficit: 3500,
          escrow_balance: 30000
        }
      ];

      setVaults(vaultRes.data?.length ? (vaultRes.data || []).map(v => ({
        id: v.id,
        vault_address: v.vault_address,
        vault_name: v.vault_name,
        maker_token: v.token_type,
        reserve_amount: Math.random() * 10000,
        escrow_amount: Math.random() * 5000,
        rebalance_amount: v.outstanding_quantity,
        isActive: false
      })) : mockVaults);
      
      setPreSlashed(preSlashedRes.data?.length ? (preSlashedRes.data || []).map(p => ({
        id: p.id,
        vault_name: p.vault_name,
        maker_token: 'USDC', // Default value, should come from API
        utilized_amount: p.utilized_amount,
        total_allocated: p.total_allocated,
        utilization_percentage: p.utilization_percentage,
        orchestrator_deficit: Math.random() * 10000, // Mock value
        escrow_balance: Math.random() * 50000 // Mock value
      })) : mockPreSlashed);
    } catch (error) {
      console.error('Error fetching rebalance data:', error);
      // Use mock data on error
      const mockVaults: VaultRebalance[] = [
        {
          id: '1',
          vault_address: '0x1234567890abcdef1234567890abcdef12345678',
          vault_name: 'USDC Vault',
          maker_token: 'USDC',
          reserve_amount: 45000,
          escrow_amount: 12000,
          rebalance_amount: 8500,
          isActive: false
        },
        {
          id: '2',
          vault_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          reserve_amount: 32000,
          escrow_amount: 9500,
          rebalance_amount: 5200,
          isActive: false
        }
      ];

      const mockPreSlashed: PreSlashedVault[] = [
        {
          id: '1',
          vault_name: 'USDC Vault',
          maker_token: 'USDC',
          utilized_amount: 8500,
          total_allocated: 15000,
          utilization_percentage: 56.67,
          orchestrator_deficit: 5000,
          escrow_balance: 25000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: 8000,
          escrow_balance: 18000
        }
      ];

      setVaults(mockVaults);
      setPreSlashed(mockPreSlashed);
    } finally {
      setLoading(false);
    }
  };

  const needsRebalancing = (vault: VaultRebalance) => {
    return vault.rebalance_amount > 0;
  };

  const handleStartRebalance = () => {
    setIsRebalancing(true);
    const vaultsNeedingRebalance = vaults.filter(needsRebalancing);
    
    vaultsNeedingRebalance.forEach(vault => {
      setVaultTimers(prev => {
        // Don't add duplicate timers
        if (prev.some(t => t.vaultId === vault.id)) {
          return prev;
        }
        return [...prev, { vaultId: vault.id, countdown: 600, isActive: true }];
      });
    });

    toast({
      title: "Rebalance Started",
      description: `Started rebalancing for ${vaultsNeedingRebalance.length} vault(s)`,
    });
  };

  // Get timer for a specific vault
  const getVaultTimer = (vaultId: string) => {
    return vaultTimers.find(t => t.vaultId === vaultId);
  };

  const handleReplenish = (vault: PreSlashedVault) => {
    setSelectedVault(vault);
    setSelectedToken(vault.maker_token);
    setReplenishAmount("");
    setReplenishDialogOpen(true);
  };

  const handleReplenishSubmit = () => {
    if (!selectedVault || !replenishAmount || !selectedToken) return;

    const amount = parseFloat(replenishAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > selectedVault.orchestrator_deficit) {
      toast({
        title: "Amount Exceeds Deficit",
        description: `Maximum replenish amount is $${selectedVault.orchestrator_deficit.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    const tokenBalance = availableTokens.find(t => t.symbol === selectedToken)?.escrow_balance || 0;
    if (amount > tokenBalance) {
      toast({
        title: "Insufficient Escrow Balance",
        description: `Escrow balance for ${selectedToken} is only $${tokenBalance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Replenish Successful",
      description: `Replenished ${selectedVault.vault_name} with $${amount.toLocaleString()} using ${selectedToken}`,
    });

    setReplenishDialogOpen(false);
  };

  const getMaxReplenishAmount = () => {
    if (!selectedVault || !selectedToken) return 0;
    const tokenBalance = availableTokens.find(t => t.symbol === selectedToken)?.escrow_balance || 0;
    return Math.min(selectedVault.orchestrator_deficit, tokenBalance);
  };

  const isAmountValid = () => {
    if (!replenishAmount || !selectedVault) return true;
    const amount = parseFloat(replenishAmount);
    return !isNaN(amount) && amount > 0 && amount <= getMaxReplenishAmount();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const sortedVaults = [...vaults].sort((a, b) => {
    if (isRebalancing) {
      const aNeedsRebalance = needsRebalancing(a);
      const bNeedsRebalance = needsRebalancing(b);
      if (aNeedsRebalance && !bNeedsRebalance) return -1;
      if (!aNeedsRebalance && bNeedsRebalance) return 1;
    }
    const timerA = getVaultTimer(a.id);
    const timerB = getVaultTimer(b.id);
    if (timerA?.isActive && !timerB?.isActive) return -1;
    if (!timerA?.isActive && timerB?.isActive) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Active Vaults Ready for Rebalance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Vault className="h-5 w-5" />
              Active Vaults Ready for Rebalance
            </CardTitle>
            <Button 
              onClick={handleStartRebalance}
              disabled={isRebalancing || vaults.filter(needsRebalancing).length === 0}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRebalancing ? 'animate-spin' : ''}`} />
              Start Rebalance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedVaults.map((vault, index) => {
            const timer = getVaultTimer(vault.id);
            const vaultNeedsRebalance = needsRebalancing(vault);
            return (
              <Collapsible key={vault.id}>
                <div 
                  className={`border rounded-lg transition-all duration-500 ease-in-out ${
                    isRebalancing && vaultNeedsRebalance ? 'animate-fade-in' : ''
                  }`}
                  style={{
                    transitionDelay: isRebalancing && vaultNeedsRebalance ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="h-4 w-4" />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{vault.vault_name}</p>
                          {vaultNeedsRebalance && (
                            <Badge variant="destructive" className="text-xs">
                              Needs Rebalance
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{vault.maker_token}</p>
                      </div>
                    </div>
                    {timer?.isActive && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(timer.countdown)}
                      </Badge>
                    )}
                  </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-2 bg-muted/20">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount in Reserve</p>
                        <p className="font-medium">${vault.reserve_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount in Escrow</p>
                        <p className="font-medium">${vault.escrow_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Amount to Rebalance</p>
                        <p className="font-medium">{vault.rebalance_amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Exec Vault: {vault.vault_address.substring(0, 10)}...
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
          })}
        </CardContent>
      </Card>

      {/* Pre-Slashed Amounts with Replenish Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Pre-Slashed Amounts - Replenish
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preSlashed.map((vault) => (
            <div key={vault.id} className="space-y-3 p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{vault.vault_name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${vault.utilized_amount.toLocaleString()} / ${vault.total_allocated.toLocaleString()}
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleReplenish(vault)}
                >
                  Replenish
                </Button>
              </div>
              <Progress value={vault.utilization_percentage} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Utilization: {vault.utilization_percentage.toFixed(1)}%
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Replenish Dialog */}
      <Dialog open={replenishDialogOpen} onOpenChange={setReplenishDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Replenish {selectedVault?.vault_name}</DialogTitle>
            <DialogDescription>
              Add funds to replenish the vault. Maximum amount is limited by the orchestrator deficit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Escrow Balance Display */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Token Escrow Balance</span>
                <span className="text-sm text-muted-foreground">
                  {selectedVault?.maker_token}
                </span>
              </div>
              <p className="text-2xl font-bold">
                ${selectedVault?.escrow_balance.toLocaleString()}
              </p>
            </div>

            {/* Orchestrator Deficit */}
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Orchestrator Deficit</p>
                  <p className="text-lg font-bold text-destructive">
                    ${selectedVault?.orchestrator_deficit.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum replenish amount allowed
                  </p>
                </div>
              </div>
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token">Replenish Using Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger id="token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex justify-between items-center w-full">
                        <span>{token.symbol}</span>
                        <span className="text-xs text-muted-foreground ml-4">
                          Balance: ${token.escrow_balance.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Replenish Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={replenishAmount}
                  onChange={(e) => setReplenishAmount(e.target.value)}
                  className={`pl-7 ${!isAmountValid() ? 'border-destructive' : ''}`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Maximum: ${getMaxReplenishAmount().toLocaleString()}</span>
                {replenishAmount && !isAmountValid() && (
                  <span className="text-destructive">Amount exceeds limit</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplenishDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReplenishSubmit}
              disabled={!replenishAmount || !isAmountValid()}
            >
              Confirm Replenish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}