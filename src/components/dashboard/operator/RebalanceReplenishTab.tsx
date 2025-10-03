import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  curator_name: string;
  orchestrator_balance: number;
  total_pre_slashed: number;
  utilization_percentage: number;
  approx_fallback_yodl: number;
  isRestoring?: boolean;
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
  sharedVaults?: SharedVaultData[];
  onVaultsUpdate?: (vaults: SharedVaultData[]) => void;
}

interface SharedVaultData {
  id: string;
  vault_name: string;
  maker_token: string;
  escrow_amount: number;
  orchestrator_balance: number;
  total_pre_slashed: number;
}

export function RebalanceReplenishTab({ vaultTimers, setVaultTimers, sharedVaults, onVaultsUpdate }: RebalanceReplenishTabProps) {
  const [vaults, setVaults] = useState<VaultRebalance[]>([]);
  const [preSlashed, setPreSlashed] = useState<PreSlashedVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<PreSlashedVault | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
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

  // Update local vaults when shared vaults change
  useEffect(() => {
    if (sharedVaults && sharedVaults.length > 0) {
      setVaults(prev => prev.map(vault => {
        const shared = sharedVaults.find(sv => 
          sv.vault_name === `${vault.curator_name}: ${vault.maker_token} Vault`
        );
        if (shared) {
          // Recalculate utilization percentage based on new orchestrator balance
          const newUtilization = shared.total_pre_slashed > 0 
            ? ((shared.total_pre_slashed - shared.orchestrator_balance) / shared.total_pre_slashed) * 100 
            : 0;
          
          return {
            ...vault,
            orchestrator_balance: shared.orchestrator_balance,
            escrow_amount: shared.escrow_amount,
            total_pre_slashed: shared.total_pre_slashed,
            utilization_percentage: newUtilization,
          };
        }
        return vault;
      }));
    }
  }, [sharedVaults]);

  const fetchData = async () => {
    try {
      const [vaultRes, preSlashedRes] = await Promise.all([
        supabase.from('vault_outstanding_rebalances').select('*'),
        supabase.from('delegated_vault_pre_slashing').select('*')
      ]);

      // Mock data for vaults - Testing 3 restore cases
      const mockVaults: VaultRebalance[] = [
        // Case 1: escrow_amount (10000) < deficit (19000)
        {
          id: '1',
          vault_address: '0x1234567890abcdef1234567890abcdef12345678',
          vault_name: 'USDC Vault',
          maker_token: 'USDC',
          reserve_amount: 45000,
          escrow_amount: 10000,
          rebalance_amount: 8500,
          isActive: false,
          curator_name: 'RE7',
          orchestrator_balance: 1000,
          total_pre_slashed: 20000,
          utilization_percentage: 95,
          approx_fallback_yodl: 450
        },
        // Case 2: escrow_amount (3) = deficit (3)
        {
          id: '2',
          vault_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          reserve_amount: 3.2,
          escrow_amount: 3,
          rebalance_amount: 2,
          isActive: false,
          curator_name: 'CryptoMax',
          orchestrator_balance: 1,
          total_pre_slashed: 4,
          utilization_percentage: 75,
          approx_fallback_yodl: 320
        },
        // Case 3: escrow_amount (21000) > deficit (19000)
        {
          id: '3',
          vault_address: '0x9876543210fedcba9876543210fedcba98765432',
          vault_name: 'DAI Vault',
          maker_token: 'DAI',
          reserve_amount: 28000,
          escrow_amount: 21000,
          rebalance_amount: 3900,
          isActive: false,
          curator_name: 'VaultGuard',
          orchestrator_balance: 1000,
          total_pre_slashed: 20000,
          utilization_percentage: 95,
          approx_fallback_yodl: 280
        },
        // Additional vault with no escrow (for variety)
        {
          id: '4',
          vault_address: '0x1111222233334444555566667777888899990000',
          vault_name: 'USDT Vault',
          maker_token: 'USDT',
          reserve_amount: 52000,
          escrow_amount: 0,
          rebalance_amount: 0,
          isActive: false,
          curator_name: 'RE7',
          orchestrator_balance: 15000,
          total_pre_slashed: 25000,
          utilization_percentage: 40,
          approx_fallback_yodl: 520
        },
        // Additional vault with healthy balance
        {
          id: '5',
          vault_address: '0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff',
          vault_name: 'WBTC Vault',
          maker_token: 'WBTC',
          reserve_amount: 5,
          escrow_amount: 3,
          rebalance_amount: 0,
          isActive: false,
          curator_name: 'BitKeeper',
          orchestrator_balance: 1,
          total_pre_slashed: 4,
          utilization_percentage: 75,
          approx_fallback_yodl: 150
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
          orchestrator_deficit: Math.min(5000, 15000), // Cannot exceed total_allocated
          escrow_balance: 25000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: Math.min(8000, 20000), // Cannot exceed total_allocated
          escrow_balance: 18000
        },
        {
          id: '3',
          vault_name: 'DAI Vault',
          maker_token: 'DAI',
          utilized_amount: 4500,
          total_allocated: 10000,
          utilization_percentage: 45,
          orchestrator_deficit: Math.min(3500, 10000), // Cannot exceed total_allocated
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
        isActive: false,
        curator_name: 'Unknown',
        orchestrator_balance: Math.random() * 5000,
        total_pre_slashed: Math.random() * 20000,
        utilization_percentage: Math.random() * 100,
        approx_fallback_yodl: Math.random() * 500
      })) : mockVaults);
      
      setPreSlashed(preSlashedRes.data?.length ? (preSlashedRes.data || []).map(p => ({
        id: p.id,
        vault_name: p.vault_name,
        maker_token: 'USDC', // Default value, should come from API
        utilized_amount: p.utilized_amount,
        total_allocated: p.total_allocated,
        utilization_percentage: p.utilization_percentage,
        orchestrator_deficit: Math.min(Math.random() * 10000, p.total_allocated), // Cannot exceed total_allocated
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
          escrow_amount: 10000,
          rebalance_amount: 8500,
          isActive: false,
          curator_name: 'RE7',
          orchestrator_balance: 1000,
          total_pre_slashed: 20000,
          utilization_percentage: 95,
          approx_fallback_yodl: 450
        },
        {
          id: '2',
          vault_address: '0xabcdef1234567890abcdef1234567890abcdef12',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          reserve_amount: 32000,
          escrow_amount: 9500,
          rebalance_amount: 5200,
          isActive: false,
          curator_name: 'CryptoMax',
          orchestrator_balance: 2500,
          total_pre_slashed: 15000,
          utilization_percentage: 83.33,
          approx_fallback_yodl: 320
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
          orchestrator_deficit: Math.min(5000, 15000), // Cannot exceed total_allocated
          escrow_balance: 25000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: Math.min(8000, 20000), // Cannot exceed total_allocated
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
    setSelectedTokens([]);
    setReplenishDialogOpen(true);
  };

  const handleReplenishSubmit = () => {
    if (!selectedVault || selectedTokens.length === 0) {
      toast({
        title: "No Tokens Selected",
        description: "Please select at least one token to replenish",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Replenish Successful",
      description: `Replenished ${selectedVault.vault_name} using ${selectedTokens.join(', ')}`,
    });

    setReplenishDialogOpen(false);
  };

  const handleTokenToggle = (token: string) => {
    setSelectedTokens(prev => 
      prev.includes(token) 
        ? prev.filter(t => t !== token)
        : [...prev, token]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDeficitSurplus = (vault: VaultRebalance) => {
    const total = vault.total_pre_slashed;
    const combined = vault.escrow_amount + vault.orchestrator_balance;
    const amount = total - combined;
    return {
      amount: Math.abs(amount),
      type: amount > 0 ? 'deficit' : 'surplus'
    };
  };

  const handleRestore = (vault: VaultRebalance) => {
    // Calculate how much can be restored
    const deficit = vault.total_pre_slashed - vault.orchestrator_balance;
    const amountToRestore = Math.min(vault.escrow_amount, deficit);
    
    // Update vault data
    const newEscrowBalance = vault.escrow_amount - amountToRestore;
    const newOrchestratorBalance = vault.orchestrator_balance + amountToRestore;
    const newUtilization = ((vault.total_pre_slashed - newOrchestratorBalance) / vault.total_pre_slashed) * 100;

    const updatedVault: VaultRebalance = {
      ...vault,
      escrow_amount: newEscrowBalance,
      orchestrator_balance: newOrchestratorBalance,
      utilization_percentage: newUtilization,
      isRestoring: true
    };

    // Update local state and propagate to parent
    setVaults(prev => {
      const newVaults = prev.map(v => v.id === vault.id ? updatedVault : v);
      if (onVaultsUpdate) {
        const shared = newVaults.map(v => ({
          id: v.id,
          vault_name: `${v.curator_name}: ${v.maker_token} Vault`,
          maker_token: v.maker_token,
          escrow_amount: v.escrow_amount,
          orchestrator_balance: v.orchestrator_balance,
          total_pre_slashed: v.total_pre_slashed,
        }));
        onVaultsUpdate(shared);
      }
      return newVaults;
    });

    // Remove animation flag after animation completes
    setTimeout(() => {
      setVaults(prev => 
        prev.map(v => v.id === vault.id ? { ...v, isRestoring: false } : v)
      );
    }, 1000);

    toast({
      title: "Restore Successful",
      description: `Restored ${amountToRestore.toLocaleString()} ${vault.maker_token} to orchestrator balance`,
    });
  };

  const handleReplenishVault = (vault: VaultRebalance) => {
    // Convert VaultRebalance to PreSlashedVault format for the dialog
    const orchestratorDeficit = Math.max(
      0, 
      Math.min(
        vault.total_pre_slashed - vault.orchestrator_balance,
        vault.total_pre_slashed
      )
    );
    
    const adaptedVault: PreSlashedVault = {
      id: vault.id,
      vault_name: `${vault.curator_name}: ${vault.maker_token} Vault`,
      maker_token: vault.maker_token,
      utilized_amount: vault.total_pre_slashed - vault.orchestrator_balance,
      total_allocated: vault.total_pre_slashed,
      utilization_percentage: ((vault.total_pre_slashed - vault.orchestrator_balance) / vault.total_pre_slashed) * 100,
      orchestrator_deficit: orchestratorDeficit,
      escrow_balance: vault.escrow_amount
    };
    
    setSelectedVault(adaptedVault);
    setSelectedTokens([]);
    setReplenishDialogOpen(true);
  };

  const handleRebalance = (vault: VaultRebalance) => {
    // Start the timer for this specific vault
    setVaultTimers(prev => {
      // Don't add duplicate timers
      if (prev.some(t => t.vaultId === vault.id)) {
        return prev;
      }
      return [...prev, { vaultId: vault.id, countdown: 600, isActive: true }];
    });

    toast({
      title: "Rebalance Initiated",
      description: `Rebalancing ${vault.curator_name}: ${vault.maker_token} Vault`,
    });
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
    
    // Both have active timers - sort by remaining time (least time first)
    if (timerA?.isActive && timerB?.isActive) {
      return timerA.countdown - timerB.countdown;
    }
    
    // Active timers come before inactive
    if (timerA?.isActive && !timerB?.isActive) return -1;
    if (!timerA?.isActive && timerB?.isActive) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Active Vaults Ready for Rebalance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vault className="h-5 w-5" />
            Active Vaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedVaults.map((vault, index) => {
            const timer = getVaultTimer(vault.id);
            const deficitSurplus = calculateDeficitSurplus(vault);
            const calculatedUtilization = ((vault.total_pre_slashed - vault.orchestrator_balance) / vault.total_pre_slashed) * 100;
            const barValue = (vault.orchestrator_balance / vault.total_pre_slashed) * 100;
            
            return (
              <Collapsible key={vault.id}>
                <div 
                  className={`border rounded-lg transition-all duration-500 ease-in-out ${
                    isRebalancing ? 'animate-fade-in' : ''
                  }`}
                  style={{
                    transitionDelay: isRebalancing ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <CollapsibleTrigger className="flex items-center gap-4 w-full p-4 hover:bg-muted/50">
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    
                    {/* Left Side - Vault Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <p className="font-medium whitespace-nowrap">{vault.curator_name}: {vault.maker_token} Vault</p>
                        <p className="text-sm">
                          {vault.orchestrator_balance.toLocaleString()} {vault.maker_token} /{vault.total_pre_slashed.toLocaleString()} {vault.maker_token}
                        </p>
                        <p className="text-sm text-cyan-500 whitespace-nowrap">
                          (Orchestrator Balance out of Total Pre-Slashed Balance)
                        </p>
                      </div>
                      <Progress 
                        value={barValue} 
                        className={`h-2 mb-1 transition-all duration-1000 ${vault.isRestoring ? 'animate-pulse' : ''}`} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Utilization %: {calculatedUtilization.toFixed(0)}%
                      </p>
                    </div>

                    {/* Right Side - Badges */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {needsRebalancing(vault) && (
                        <Badge variant="destructive" className="whitespace-nowrap">
                          Rebalancing Requested
                        </Badge>
                      )}
                      {timer?.isActive && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-black text-white">
                          <Clock className="h-3 w-3" />
                          {formatTime(timer.countdown)}
                        </Badge>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4 bg-muted/20">
                      {/* Vault Details Grid */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Escrow Balance</p>
                          <p className="font-medium">{vault.escrow_amount.toLocaleString()} {vault.maker_token}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{deficitSurplus.type === 'deficit' ? 'Deficit' : 'Surplus'}</p>
                          <p className={`font-medium ${deficitSurplus.type === 'deficit' ? 'text-destructive' : 'text-green-600'}`}>
                            {deficitSurplus.amount.toLocaleString()} {vault.maker_token}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Approx Fallback Qty in YODL</p>
                          <p className="font-medium">{vault.approx_fallback_yodl.toLocaleString()} YODL</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(vault);
                          }}
                        >
                          Restore
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReplenishVault(vault);
                          }}
                        >
                          Replenish
                        </Button>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRebalance(vault);
                          }}
                        >
                          Rebalance
                        </Button>
                      </div>

                      {/* Vault Address */}
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
                <span className="text-sm font-medium">
                  Current {selectedVault?.maker_token} Escrow Balance
                </span>
                <span className="text-sm text-muted-foreground">
                  {selectedVault?.maker_token}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {selectedVault?.escrow_balance.toLocaleString()} {selectedVault?.maker_token}
              </p>
            </div>

            {/* Orchestrator Deficit */}
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Orchestrator Deficit</p>
                  <p className="text-lg font-bold text-destructive">
                    {selectedVault?.orchestrator_deficit.toLocaleString()} {selectedVault?.maker_token}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum replenish amount allowed (cannot exceed total pre-slashed: {selectedVault?.total_allocated.toLocaleString()} {selectedVault?.maker_token})
                  </p>
                </div>
              </div>
            </div>

            {/* Token Multi-Selection */}
            <div className="space-y-3">
              <Label>Replenish Using Tokens (Multi-select)</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {availableTokens.map((token) => (
                  <div key={token.symbol} className="flex items-center space-x-3 py-2">
                    <Checkbox
                      id={`token-${token.symbol}`}
                      checked={selectedTokens.includes(token.symbol)}
                      onCheckedChange={() => handleTokenToggle(token.symbol)}
                    />
                    <label
                      htmlFor={`token-${token.symbol}`}
                      className="flex-1 flex justify-between items-center cursor-pointer"
                    >
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        Balance: {token.escrow_balance.toLocaleString()} {token.symbol}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {selectedTokens.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedTokens.join(', ')}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplenishDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReplenishSubmit}
              disabled={selectedTokens.length === 0}
            >
              Confirm Replenish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}