import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, Clock, RefreshCw, Vault, AlertCircle, CheckCircle2, DollarSign, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnalogTimer } from "@/components/ui/analog-timer";
import { useAuth } from "@/hooks/useAuth";

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
  total_pre_slashed: number;
  orchestrator_balance: number;
}

interface VaultTimer {
  vaultId: string;
  countdown: number;
  isActive: boolean;
}

interface EscrowToken {
  id: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  isListed: boolean;
}

interface RebalanceReplenishTabProps {
  vaultTimers: VaultTimer[];
  setVaultTimers: React.Dispatch<React.SetStateAction<VaultTimer[]>>;
  sharedVaults?: SharedVaultData[];
  onVaultsUpdate?: (vaults: SharedVaultData[]) => void;
  escrowTokens?: EscrowToken[];
  onEscrowTokensUpdate?: (tokens: EscrowToken[]) => void;
}

interface SharedVaultData {
  id: string;
  vault_name: string;
  maker_token: string;
  escrow_amount: number;
  orchestrator_balance: number;
  total_pre_slashed: number;
}

// Token prices for USD conversion and token-to-token conversion
const TOKEN_PRICES: Record<string, number> = {
  'USDC': 1,
  'USDT': 1,
  'DAI': 1,
  'WETH': 4480.49,
  'WBTC': 120409.15,
  'BNB': 1131.35,
  'MATIC': 0.24
};

export function RebalanceReplenishTab({ vaultTimers, setVaultTimers, sharedVaults, onVaultsUpdate, escrowTokens, onEscrowTokensUpdate }: RebalanceReplenishTabProps) {
  const [vaults, setVaults] = useState<VaultRebalance[]>([]);
  const [preSlashed, setPreSlashed] = useState<PreSlashedVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [replenishDialogOpen, setReplenishDialogOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<PreSlashedVault | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, string>>({});
  const [healthScore, setHealthScore] = useState<number>(0);
  const [restoreAmount, setRestoreAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'unlisted' | 'listed'>('unlisted');
  const [activeVaultTab, setActiveVaultTab] = useState<'needs' | 'requested'>('needs');
  const { toast } = useToast();
  const { hasRole, profile } = useAuth();
  
  // Determine current user role
  const isCurator = hasRole('curator');
  const isOperator = hasRole('operator');

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
      const [vaultRes, preSlashedRes, healthRes] = await Promise.all([
        supabase.from('vault_outstanding_rebalances').select('*'),
        supabase.from('delegated_vault_pre_slashing').select('*'),
        supabase.from('operator_liquidation_health').select('health_score').single()
      ]);

      // Set health score (default to 75 if no data)
      setHealthScore(healthRes.data?.health_score || 75);

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
          orchestrator_deficit: Math.min(5000, 15000),
          escrow_balance: 25000,
          total_pre_slashed: 20000,
          orchestrator_balance: 15000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: Math.min(8000, 20000),
          escrow_balance: 18000,
          total_pre_slashed: 4,
          orchestrator_balance: 1
        },
        {
          id: '3',
          vault_name: 'DAI Vault',
          maker_token: 'DAI',
          utilized_amount: 4500,
          total_allocated: 10000,
          utilization_percentage: 45,
          orchestrator_deficit: Math.min(3500, 10000),
          escrow_balance: 30000,
          total_pre_slashed: 15000,
          orchestrator_balance: 10500
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
        orchestrator_deficit: Math.min(Math.random() * 10000, p.total_allocated),
        escrow_balance: Math.random() * 50000,
        total_pre_slashed: p.total_allocated || Math.random() * 20000,
        orchestrator_balance: (p.total_allocated || 0) - (p.utilized_amount || 0)
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
          orchestrator_deficit: Math.min(5000, 15000),
          escrow_balance: 25000,
          total_pre_slashed: 20000,
          orchestrator_balance: 15000
        },
        {
          id: '2',
          vault_name: 'WETH Vault',
          maker_token: 'WETH',
          utilized_amount: 12000,
          total_allocated: 20000,
          utilization_percentage: 60,
          orchestrator_deficit: Math.min(8000, 20000),
          escrow_balance: 18000,
          total_pre_slashed: 4,
          orchestrator_balance: 1
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
    setRestoreAmount('');
    setActiveTab('unlisted');
    setReplenishDialogOpen(true);
  };

  const handleTokenToggle = (tokenSymbol: string) => {
    setSelectedTokens(prev => {
      const isRemoving = prev.includes(tokenSymbol);
      if (isRemoving) {
        // Clear amount when deselecting
        setTokenAmounts(prevAmounts => {
          const { [tokenSymbol]: _, ...rest } = prevAmounts;
          return rest;
        });
        return prev.filter(t => t !== tokenSymbol);
      }
      return [...prev, tokenSymbol];
    });
  };

  const handleAmountChange = (tokenSymbol: string, value: string) => {
    setTokenAmounts(prev => ({
      ...prev,
      [tokenSymbol]: value
    }));
  };

  const convertToken = (fromToken: string, amount: number, toToken: string): number => {
    const fromPrice = TOKEN_PRICES[fromToken] || 0;
    const toPrice = TOKEN_PRICES[toToken] || 1;
    return (amount * fromPrice) / toPrice;
  };

  const calculateConversion = (fromToken: string, amount: string, toToken: string): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return '0';
    return convertToken(fromToken, numAmount, toToken).toFixed(6);
  };

  const convertFromMakerToken = (amountInMakerToken: number, targetTokenSymbol: string): number => {
    if (!selectedVault) return 0;
    return convertToken(selectedVault.maker_token, amountInMakerToken, targetTokenSymbol);
  };

  const handleTokenMax = (tokenSymbol: string) => {
    if (!selectedVault) return;
    
    // Find the token in escrow
    const token = escrowTokens?.find(t => t.token_symbol === tokenSymbol);
    if (!token) return;
    
    // Calculate orchestrator deficit
    const deficit = Math.max(0, selectedVault.total_pre_slashed - selectedVault.orchestrator_balance);
    
    // Get the restore amount (amount already being restored from maker token)
    const restoreAmountNum = parseFloat(restoreAmount) || 0;
    
    // Calculate amounts from other selected tokens (in maker token)
    const otherTokensCovered = selectedTokens
      .filter(sym => sym !== tokenSymbol)
      .reduce((sum, sym) => {
        const amt = parseFloat(tokenAmounts[sym] || '0');
        if (!amt) return sum;
        return sum + convertToken(sym, amt, selectedVault.maker_token);
      }, 0);
    
    // Calculate remaining deficit after restore and other tokens
    const remainingDeficit = Math.max(0, deficit - restoreAmountNum - otherTokensCovered);
    
    // If no remaining deficit, set to 0
    if (remainingDeficit <= 0) {
      handleAmountChange(tokenSymbol, '0');
      return;
    }
    
    // Convert remaining deficit from maker token to this token
    const maxInTargetToken = convertFromMakerToken(remainingDeficit, tokenSymbol);
    
    // Cap by available escrow balance
    const cappedMax = Math.min(maxInTargetToken, token.amount);
    
    // Set the amount
    handleAmountChange(tokenSymbol, cappedMax.toFixed(6));
  };

  const calculateTotalAmount = (): string => {
    if (!selectedVault) return '0';
    
    let total = 0;
    
    // Add restore amount (already in vault token)
    if (restoreAmount && parseFloat(restoreAmount) > 0) {
      total += parseFloat(restoreAmount);
    }
    
    // Add converted amounts from selected tokens
    selectedTokens.forEach(tokenSymbol => {
      const amount = tokenAmounts[tokenSymbol];
      if (amount && parseFloat(amount) > 0) {
        const converted = calculateConversion(tokenSymbol, amount, selectedVault.maker_token);
        total += parseFloat(converted);
      }
    });
    
    return total.toFixed(2);
  };

  const handleReplenishSubmit = () => {
    if (!selectedVault) return;
    
    // Validate amounts
    let totalReplenishInVaultToken = 0;
    const errors: string[] = [];

    // Validate restore amount
    const restoreValue = parseFloat(restoreAmount || '0');
    if (restoreValue > 0) {
      const vaultEscrowToken = escrowTokens?.find(t => t.token_symbol === selectedVault.maker_token);
      if (vaultEscrowToken && restoreValue > vaultEscrowToken.amount) {
        errors.push(`Restore amount (${restoreValue}) exceeds escrow balance (${vaultEscrowToken.amount}) for ${selectedVault.maker_token}`);
      } else {
        totalReplenishInVaultToken += restoreValue;
      }
    }

    for (const tokenSymbol of selectedTokens) {
      const amount = parseFloat(tokenAmounts[tokenSymbol] || '0');
      
      if (amount <= 0) {
        errors.push(`Please enter a valid amount for ${tokenSymbol}`);
        continue;
      }

      // Check if amount exceeds escrow balance
      const escrowToken = escrowTokens?.find(t => t.token_symbol === tokenSymbol);
      if (escrowToken && amount > escrowToken.amount) {
        errors.push(`${tokenSymbol} amount (${amount}) exceeds escrow balance (${escrowToken.amount})`);
        continue;
      }

      // Convert to vault token
      const converted = convertToken(tokenSymbol, amount, selectedVault.maker_token);
      totalReplenishInVaultToken += converted;
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join('. '),
        variant: "destructive"
      });
      return;
    }

    // Calculate orchestrator deficit (Total pre-slashed - orchestrator balance)
    const deficit = Math.max(0, selectedVault.total_pre_slashed - selectedVault.orchestrator_balance);
    
    if (totalReplenishInVaultToken > deficit) {
      toast({
        title: "Validation Error",
        description: `Total replenish amount (${totalReplenishInVaultToken.toFixed(6)} ${selectedVault.maker_token}) exceeds deficit (${deficit.toFixed(6)} ${selectedVault.maker_token})`,
        variant: "destructive"
      });
      return;
    }

    // Update orchestrator balance for the specific vault
    const newOrchestratorBalance = (selectedVault.total_allocated - selectedVault.utilized_amount) + totalReplenishInVaultToken;
    
    // Update vault in sharedVaults
    if (sharedVaults && onVaultsUpdate) {
      const updatedVaults = sharedVaults.map(v => 
        v.vault_name === selectedVault.vault_name
          ? { ...v, orchestrator_balance: v.orchestrator_balance + totalReplenishInVaultToken }
          : v
      );
      onVaultsUpdate(updatedVaults);
    }

    // Update escrow tokens
    if (escrowTokens && onEscrowTokensUpdate) {
      const updatedEscrowTokens = escrowTokens.map(token => {
        // Handle restore amount for vault's native token
        if (token.token_symbol === selectedVault.maker_token && restoreValue > 0) {
          const newAmount = token.amount - restoreValue;
          const tokenPrice = TOKEN_PRICES[token.token_symbol] || 1;
          return {
            ...token,
            amount: newAmount,
            usd_value: newAmount * tokenPrice
          };
        }
        // Handle selected tokens
        if (selectedTokens.includes(token.token_symbol)) {
          const usedAmount = parseFloat(tokenAmounts[token.token_symbol] || '0');
          const newAmount = token.amount - usedAmount;
          const tokenPrice = TOKEN_PRICES[token.token_symbol] || 1;
          return {
            ...token,
            amount: newAmount,
            usd_value: newAmount * tokenPrice
          };
        }
        return token;
      });
      onEscrowTokensUpdate(updatedEscrowTokens);
    }

    // Show success message with details
    const replenishDetails: string[] = [];
    if (restoreValue > 0) {
      replenishDetails.push(`${restoreValue} ${selectedVault.maker_token} (Restore)`);
    }
    replenishDetails.push(...selectedTokens.map(tokenSymbol => {
      const amount = tokenAmounts[tokenSymbol];
      const converted = calculateConversion(tokenSymbol, amount, selectedVault.maker_token);
      return `${amount} ${tokenSymbol} (≈ ${converted} ${selectedVault.maker_token})`;
    }));

    toast({
      title: "Vault Replenished",
      description: `Successfully replenished ${selectedVault.vault_name} using ${replenishDetails.join(', ')}`,
    });

    // Close dialog and reset selection
    setReplenishDialogOpen(false);
    setSelectedTokens([]);
    setTokenAmounts({});
    setRestoreAmount('');
    setSelectedVault(null);
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
      escrow_balance: vault.escrow_amount,
      total_pre_slashed: vault.total_pre_slashed,
      orchestrator_balance: vault.orchestrator_balance
    };
    
    setSelectedVault(adaptedVault);
    setSelectedTokens([]);
    setRestoreAmount('');
    setActiveTab('unlisted');
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

  // Calculate deficit in USD for sorting
  const calculateDeficitUsd = (vault: VaultRebalance) => {
    const deficit = vault.total_pre_slashed - vault.orchestrator_balance;
    const tokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
    return deficit * tokenPrice;
  };

  // Calculate YODL USD value (fallback + 1% buffer)
  const calculateYodlUsdValue = (vault: VaultRebalance) => {
    return vault.approx_fallback_yodl * 1.01;
  };

  // Categorize vaults into "Needs Rebalancing" and "Rebalance Requested"
  const needsRebalancingVaults = vaults.filter(vault => 
    !vaultTimers.find(t => t.vaultId === vault.id && t.isActive)
  );

  const rebalanceRequestedVaults = vaults.filter(vault => 
    vaultTimers.find(t => t.vaultId === vault.id && t.isActive)
  );

  // Sort "Needs Rebalancing" by deficit in USD (descending)
  const sortedNeedsRebalancing = [...needsRebalancingVaults].sort((a, b) => {
    return calculateDeficitUsd(b) - calculateDeficitUsd(a);
  });

  // Sort "Rebalance Requested" by remaining time (ascending)
  const sortedRebalanceRequested = [...rebalanceRequestedVaults].sort((a, b) => {
    const timerA = getVaultTimer(a.id);
    const timerB = getVaultTimer(b.id);
    if (timerA && timerB) {
      return timerA.countdown - timerB.countdown;
    }
    return 0;
  });

  // Helper component for vertical progress bar with segmented fluid design
  const VerticalProgressBar = ({ value }: { value: number }) => {
    const segments = 10;
    const filledSegments = Math.ceil((value / 100) * segments);
    
    const getSegmentColor = (index: number) => {
      const threshold = ((index + 1) / segments) * 100;
      if (threshold >= 90) return 'bg-red-500/90';
      if (threshold >= 70) return 'bg-orange-500/90';
      if (threshold >= 50) return 'bg-yellow-500/90';
      return 'bg-emerald-500/90';
    };

    return (
      <div className="h-full w-4 hover:w-5 bg-secondary/20 rounded-full overflow-hidden flex flex-col-reverse gap-0.5 p-0.5 border border-border/30 transition-all duration-300 cursor-pointer">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 rounded-sm transition-all duration-500 ease-out ${
              index < filledSegments 
                ? `${getSegmentColor(index)} shadow-inner animate-pulse` 
                : 'bg-transparent'
            }`}
            style={{
              transitionDelay: `${index * 50}ms`,
              animationDelay: `${index * 100}ms`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    );
  };

  // Position Status calculations
  const totalAssetsSlashed = sharedVaults?.reduce((sum, v) => {
    const price = TOKEN_PRICES[v.maker_token] || 1;
    return sum + (v.total_pre_slashed * price);
  }, 0) || 0;
  
  const totalAssetsInCustody = sharedVaults?.reduce((sum, v) => {
    const price = TOKEN_PRICES[v.maker_token] || 1;
    return sum + ((v.escrow_amount + v.orchestrator_balance) * price);
  }, 0) || 0;
  
  const unrealisedPL = totalAssetsInCustody - totalAssetsSlashed;
  const unrealisedPercentage = totalAssetsSlashed > 0 ? (unrealisedPL / totalAssetsSlashed) * 100 : 0;
  const isUnrealisedProfit = unrealisedPL >= 0;
  
  const numAssetsSlashed = sharedVaults?.filter(v => v.total_pre_slashed > 0).length || 0;
  const numAssetsHeld = new Set(sharedVaults?.map(v => v.maker_token) || []).size;

  return (
    <div className="space-y-6">
      {/* Active Vaults Ready for Rebalance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Vault className="h-5 w-5" />
              Active Vaults
            </CardTitle>
            
            {/* Health Factor Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Health Factor</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Health Factor indicates your distance from liquidation. 
                      Safe (green): ≥70%, Warning (yellow): 40-70%, Danger (red): &lt;40%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative w-48 h-3 bg-muted rounded-full overflow-hidden">
                  {/* Danger zone (0-40%) */}
                  <div className="absolute left-0 top-0 h-full w-[40%] bg-destructive/30" />
                  {/* Warning zone (40-70%) */}
                  <div className="absolute left-[40%] top-0 h-full w-[30%] bg-yellow-500/30" />
                  {/* Safe zone (70-100%) */}
                  <div className="absolute left-[70%] top-0 h-full w-[30%] bg-emerald-500/30" />
                  
                  {/* Current position indicator */}
                  <div 
                    className="absolute top-0 h-full transition-all duration-500"
                    style={{ 
                      left: 0,
                      width: `${healthScore}%`,
                      background: healthScore >= 70 
                        ? 'hsl(var(--chart-2))' 
                        : healthScore >= 40 
                          ? 'hsl(47 95% 53%)' 
                          : 'hsl(var(--destructive))'
                    }}
                  />
                  
                  {/* Marker */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-full shadow-lg transition-all duration-500"
                    style={{ left: `${healthScore}%`, marginLeft: '-2px' }}
                  />
                </div>
                
                <span className={`text-sm font-semibold min-w-[3rem] ${
                  healthScore >= 70 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : healthScore >= 40 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-destructive'
                }`}>
                  {healthScore.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Position Status Cards */}
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Value of Assets Slashed */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Current Value of Assets Slashed</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total USD value of assets currently locked as collateral from pre-slashing across all vaults.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold mb-2">${totalAssetsSlashed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">No. of Assets Slashed: {numAssetsSlashed}</p>
              </div>

              {/* Current Value of Assets in Custody */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Current Value of Assets in Custody</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Total USD value of assets held in escrow and orchestrator balances available for operations.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-3xl font-bold mb-2">${totalAssetsInCustody.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">No. of Assets Held: {numAssetsHeld}</p>
              </div>

              {/* Unrealised P/L */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Unrealised P/L</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Potential profit or loss on current open positions, calculated as the difference between assets in custody and slashed assets.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {isUnrealisedProfit ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                  <p className={`text-3xl font-bold ${isUnrealisedProfit ? 'text-green-600' : 'text-destructive'}`}>
                    ${Math.abs(unrealisedPL).toLocaleString()}
                  </p>
                </div>
                <p className={`text-xs ${isUnrealisedProfit ? 'text-green-600' : 'text-destructive'}`}>
                  {isUnrealisedProfit ? '+' : '-'}{Math.abs(unrealisedPercentage).toFixed(2)}%
                </p>
              </div>
            </div>
          </TooltipProvider>

          {/* Nested Tabs */}
          <Tabs value={activeVaultTab} onValueChange={(v) => setActiveVaultTab(v as 'needs' | 'requested')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="needs">
                Needs Rebalancing ({sortedNeedsRebalancing.length})
              </TabsTrigger>
              <TabsTrigger value="requested">
                Rebalance Requested ({sortedRebalanceRequested.length})
              </TabsTrigger>
            </TabsList>

            {/* Needs Rebalancing Tab */}
            <TabsContent value="needs" className="space-y-3 mt-0">
              {sortedNeedsRebalancing.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vaults need rebalancing
                </div>
              ) : (
                sortedNeedsRebalancing.map((vault, index) => {
                  const deficit = vault.total_pre_slashed - vault.orchestrator_balance;
                  const yodlUsdValue = calculateYodlUsdValue(vault);
                  const utilizationPercent = ((vault.total_pre_slashed - vault.orchestrator_balance) / vault.total_pre_slashed) * 100;
                  
                  return (
                    <Collapsible key={vault.id}>
                      <div className="rounded-lg border">
                        <CollapsibleTrigger className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 group">
                          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                          
                          {/* Vault Info */}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium">{vault.curator_name}: {vault.maker_token} Vault - {vault.maker_token}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>Deficit: <span className="text-destructive font-medium">{deficit.toLocaleString()} {vault.maker_token}</span></span>
                              <span>YODL USD: <span className="text-foreground font-medium">~${yodlUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></span>
                            </div>
                          </div>

                          {/* Vertical Progress Bar */}
                          <div className="h-12 w-4 flex-shrink-0">
                            <VerticalProgressBar value={utilizationPercent} />
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="p-4 pt-0 space-y-4 border-t">
                            {/* Vault Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Total Pre-Slashed</p>
                                <p className="font-medium">{vault.total_pre_slashed.toLocaleString()} {vault.maker_token}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Orchestrator Balance</p>
                                <p className="font-medium">{vault.orchestrator_balance.toLocaleString()} {vault.maker_token}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Escrow Balance</p>
                                <p className="font-medium">
                                  {(() => {
                                    const escrowToken = escrowTokens?.find(t => t.token_symbol === vault.maker_token);
                                    const escrowBalance = escrowToken?.amount ?? 0;
                                    return `${escrowBalance.toLocaleString()} ${vault.maker_token}`;
                                  })()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">YODL Fallback Qty</p>
                                <p className="font-medium flex items-center gap-2">
                                  {vault.approx_fallback_yodl.toLocaleString()} YODL
                                  <span className="text-xs text-primary animate-pulse">●</span>
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
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
                })
              )}
            </TabsContent>

            {/* Rebalance Requested Tab */}
            <TabsContent value="requested" className="space-y-3 mt-0">
              {sortedRebalanceRequested.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No rebalance requests pending
                </div>
              ) : (
                sortedRebalanceRequested.map((vault) => {
                  const timer = getVaultTimer(vault.id);
                  const deficit = vault.total_pre_slashed - vault.orchestrator_balance;
                  const yodlUsdValue = calculateYodlUsdValue(vault);
                  const utilizationPercent = ((vault.total_pre_slashed - vault.orchestrator_balance) / vault.total_pre_slashed) * 100;
                  
                  return (
                    <Collapsible key={vault.id}>
                      <div className="rounded-lg border border-primary/30 bg-primary/5">
                        <CollapsibleTrigger className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 group">
                          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                          
                          {/* Vault Info with Timer */}
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-3">
                              <p className="font-medium">{vault.curator_name}: {vault.maker_token} Vault - {vault.maker_token}</p>
                              {timer && <AnalogTimer remainingSeconds={timer.countdown} totalSeconds={600} size={40} />}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>Deficit: <span className="text-destructive font-medium">{deficit.toLocaleString()} {vault.maker_token}</span></span>
                              <span>YODL USD: <span className="text-foreground font-medium">~${yodlUsdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></span>
                            </div>
                          </div>

                          {/* Vertical Progress Bar */}
                          <div className="h-12 w-4 flex-shrink-0">
                            <VerticalProgressBar value={utilizationPercent} />
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="p-4 pt-0 space-y-4 border-t">
                            {/* Vault Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Total Pre-Slashed</p>
                                <p className="font-medium">{vault.total_pre_slashed.toLocaleString()} {vault.maker_token}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Orchestrator Balance</p>
                                <p className="font-medium">{vault.orchestrator_balance.toLocaleString()} {vault.maker_token}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Escrow Balance</p>
                                <p className="font-medium">
                                  {(() => {
                                    const escrowToken = escrowTokens?.find(t => t.token_symbol === vault.maker_token);
                                    const escrowBalance = escrowToken?.amount ?? 0;
                                    return `${escrowBalance.toLocaleString()} ${vault.maker_token}`;
                                  })()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">YODL Fallback Qty</p>
                                <p className="font-medium flex items-center gap-2">
                                  {vault.approx_fallback_yodl.toLocaleString()} YODL
                                  <span className="text-xs text-primary animate-pulse">●</span>
                                </p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
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
                })
              )}
            </TabsContent>
          </Tabs>
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
            {/* Orchestrator Deficit */}
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Orchestrator Deficit</p>
                  <p className="text-lg font-bold text-destructive">
                    {Math.max(0, (selectedVault?.total_pre_slashed || 0) - (selectedVault?.orchestrator_balance || 0)).toLocaleString()} {selectedVault?.maker_token}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum replenish amount allowed (cannot exceed total pre-slashed: {selectedVault?.total_pre_slashed.toLocaleString()} {selectedVault?.maker_token})
                  </p>
                </div>
              </div>
            </div>

            {/* Restore Funds Card */}
            <div className="bg-blue-50/30 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Restore Funds</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Token:</span>
                  <span className="font-medium text-blue-900">{selectedVault?.maker_token}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="restore-amount" className="text-blue-700">Amount to Restore</Label>
                  <div className="flex gap-2">
                    <Input
                      id="restore-amount"
                      type="number"
                      placeholder="0.00"
                      value={restoreAmount}
                      onChange={(e) => setRestoreAmount(e.target.value)}
                      className="border-blue-300 focus:border-blue-500 text-foreground"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!selectedVault) return;
                        const vaultToken = escrowTokens?.find(t => t.token_symbol === selectedVault.maker_token);
                        if (!vaultToken) return;
                        const deficit = Math.max(0, selectedVault.total_pre_slashed - selectedVault.orchestrator_balance);
                        const maxAmount = Math.min(vaultToken.amount, deficit);
                        setRestoreAmount(maxAmount.toFixed(6));
                      }}
                      className="shrink-0"
                    >
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-blue-600">
                    Available: {(() => {
                      const vaultToken = escrowTokens?.find(t => t.token_symbol === selectedVault?.maker_token);
                      return vaultToken ? vaultToken.amount.toLocaleString() : '0';
                    })()} {selectedVault?.maker_token} (Escrow)
                  </p>
                </div>
              </div>
            </div>

            {/* Tabbed Token Selection */}
            <div className="space-y-3">
              {(() => {
                const deficitFullyCovered = (() => {
                  if (!selectedVault || !restoreAmount) return false;
                  const restoreAmountNum = parseFloat(restoreAmount);
                  if (isNaN(restoreAmountNum) || restoreAmountNum <= 0) return false;
                  const deficit = Math.max(0, selectedVault.total_pre_slashed - selectedVault.orchestrator_balance);
                  return restoreAmountNum >= deficit;
                })();

                return (
                  <>
                    {deficitFullyCovered && (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-xs text-green-700 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Orchestrator deficit is fully covered by restore funds. Additional tokens not needed.
                        </p>
                      </div>
                    )}
                    <div className={deficitFullyCovered ? 'opacity-50 pointer-events-none' : ''}>
                      <Label>Replenish Using Tokens (Multi-select)</Label>
                      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'unlisted' | 'listed')}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger 
                            value="unlisted" 
                            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 data-[state=active]:border-orange-500 data-[state=inactive]:text-gray-700 data-[state=inactive]:text-foreground"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Unlisted
                          </TabsTrigger>
                          <TabsTrigger 
                            value="listed"
                            className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-500 data-[state=inactive]:text-gray-700 data-[state=inactive]:text-foreground"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Listed
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="unlisted" className="mt-3">
                          <div className="space-y-3 border border-orange-200 rounded-lg p-3 max-h-96 overflow-y-auto bg-orange-50/30">
                            {escrowTokens?.filter(token => !token.isListed).map((token) => (
                              <div key={token.token_symbol} className="space-y-2">
                                <div className="flex items-center space-x-3 py-2">
                                  <Checkbox
                                    id={`token-${token.token_symbol}`}
                                    checked={selectedTokens.includes(token.token_symbol)}
                                    onCheckedChange={() => handleTokenToggle(token.token_symbol)}
                                    className="border-orange-400 data-[state=checked]:bg-orange-500"
                                  />
                                  <label
                                    htmlFor={`token-${token.token_symbol}`}
                                    className="flex-1 flex justify-between items-center cursor-pointer"
                                  >
                                    <span className="font-medium">{token.token_symbol}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Balance: {token.amount.toLocaleString()} {token.token_symbol}
                                    </span>
                                  </label>
                                </div>
                                
                                {selectedTokens.includes(token.token_symbol) && (
                                  <div className="ml-9 space-y-1">
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        placeholder={`Enter ${token.token_symbol} amount`}
                                        value={tokenAmounts[token.token_symbol] || ''}
                                        onChange={(e) => handleAmountChange(token.token_symbol, e.target.value)}
                                        step="0.000001"
                                        min="0"
                                        max={token.amount}
                                        className="flex-1 border-orange-300 focus:ring-orange-500 text-foreground"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTokenMax(token.token_symbol)}
                                        className="shrink-0"
                                      >
                                        Max
                                      </Button>
                                    </div>
                                    {tokenAmounts[token.token_symbol] && parseFloat(tokenAmounts[token.token_symbol]) > 0 && selectedVault && (
                                      <p className="text-xs text-orange-600">
                                        ≈ {calculateConversion(token.token_symbol, tokenAmounts[token.token_symbol], selectedVault.maker_token)} {selectedVault.maker_token}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {escrowTokens?.filter(token => !token.isListed).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">No unlisted tokens available</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="listed" className="mt-3">
                          <div className="space-y-3 border border-green-200 rounded-lg p-3 max-h-96 overflow-y-auto bg-green-50/30">
                          
                            {escrowTokens?.filter(token => token.isListed && token.token_symbol !== selectedVault?.maker_token).map((token) => (
                              <div key={token.token_symbol} className="space-y-2">
                                <div className="flex items-center space-x-3 py-2">
                                  <Checkbox
                                    id={`token-${token.token_symbol}`}
                                    checked={selectedTokens.includes(token.token_symbol)}
                                    onCheckedChange={() => handleTokenToggle(token.token_symbol)}
                                    className="border-green-400 data-[state=checked]:bg-green-500"
                                  />
                                  <label
                                    htmlFor={`token-${token.token_symbol}`}
                                    className="flex-1 flex justify-between items-center cursor-pointer"
                                  >
                                    <span className="font-medium">{token.token_symbol}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Balance: {token.amount.toLocaleString()} {token.token_symbol}
                                    </span>
                                  </label>
                                </div>
                                
                                {selectedTokens.includes(token.token_symbol) && (
                                  <div className="ml-9 space-y-1">
                                    <div className="flex gap-2">
                                      <Input
                                        type="number"
                                        placeholder={`Enter ${token.token_symbol} amount`}
                                        value={tokenAmounts[token.token_symbol] || ''}
                                        onChange={(e) => handleAmountChange(token.token_symbol, e.target.value)}
                                        step="0.000001"
                                        min="0"
                                        max={token.amount}
                                        className="flex-1 border-green-300 focus:ring-green-500 text-foreground"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleTokenMax(token.token_symbol)}
                                        className="shrink-0"
                                      >
                                        Max
                                      </Button>
                                    </div>
                                    {tokenAmounts[token.token_symbol] && parseFloat(tokenAmounts[token.token_symbol]) > 0 && selectedVault && (
                                      <p className="text-xs text-green-600">
                                        ≈ {calculateConversion(token.token_symbol, tokenAmounts[token.token_symbol], selectedVault.maker_token)} {selectedVault.maker_token}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                            {escrowTokens?.filter(token => token.isListed && token.token_symbol !== selectedVault?.maker_token).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">No listed tokens available</p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>

                      {selectedTokens.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedTokens.join(', ')}
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Total Amount Display */}
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">{calculateTotalAmount()} {selectedVault?.maker_token}</span>
              </div>
            </div>

          </div>

          <DialogFooter className="flex w-full justify-between items-center gap-4">
            <Button 
              onClick={handleReplenishSubmit}
              disabled={selectedTokens.length === 0 && !restoreAmount}
              className="mr-auto"
            >
              Replenish
            </Button>
            <Button 
              onClick={() => {
                if (selectedVault) {
                  // Find the corresponding VaultRebalance from the vaults array
                  const matchingVault = vaults.find(v => 
                    v.maker_token === selectedVault.maker_token &&
                    `${v.curator_name}: ${v.maker_token} Vault` === selectedVault.vault_name
                  );
                  
                  if (matchingVault) {
                    setReplenishDialogOpen(false);
                    handleRebalance(matchingVault);
                  }
                }
              }}
              className="ml-auto"
            >
              Rebalance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}