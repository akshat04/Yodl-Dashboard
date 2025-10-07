import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Wallet, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Reserve Tab Component

interface YodlBalance {
  id: string;
  operator_id: string;
  balance: number;
  usd_value: number;
  operator: { name: string };
  curator_name: string;
  maker_token: string;
  total_pre_slashed: number;
  total_slashable: number;
  isSlashing?: boolean;
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

interface VaultData {
  id: string;
  vault_name: string;
  maker_token: string;
  escrow_amount: number;
  orchestrator_balance: number;
  total_pre_slashed: number;
}

interface EscrowToken {
  id: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  isListed: boolean;
}


interface ReserveTabProps {
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

export function ReserveTab({ sharedVaults, onVaultsUpdate, escrowTokens: propEscrowTokens, onEscrowTokensUpdate }: ReserveTabProps) {
  const [yodlBalances, setYodlBalances] = useState<YodlBalance[]>([]);
  const [preSlashedData, setPreSlashedData] = useState<PreSlashedData[]>([]);
  const [delegations, setDelegations] = useState<DelegationData[]>([]);
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [escrowTokens, setEscrowTokens] = useState<EscrowToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [slashDialogOpen, setSlashDialogOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<YodlBalance | null>(null);
  const [slashAmount, setSlashAmount] = useState("");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<EscrowToken | null>(null);
  const [selectedRestoreVault, setSelectedRestoreVault] = useState<string>("");
  const [restoreAmount, setRestoreAmount] = useState("");
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [swapSelectedToken, setSwapSelectedToken] = useState<EscrowToken | null>(null);
  const [swapTargetVault, setSwapTargetVault] = useState<string>("");
  const [swapAmount, setSwapAmount] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize from prop if provided
  useEffect(() => {
    if (propEscrowTokens && propEscrowTokens.length > 0) {
      setEscrowTokens(propEscrowTokens);
    }
  }, [propEscrowTokens]);

  // Sync with shared vaults from parent
  useEffect(() => {
    if (sharedVaults && sharedVaults.length > 0) {
      setVaults(sharedVaults);
      setLoading(false); // ensure UI renders immediately when parent provides data
    }
  }, [sharedVaults]);

  // Initialize shared vaults in parent when vaults are first loaded
  useEffect(() => {
    if (vaults.length > 0 && onVaultsUpdate) {
      onVaultsUpdate(vaults);
    }
  }, [vaults]);

  // Notify parent when escrowTokens change
  useEffect(() => {
    if (escrowTokens.length > 0 && onEscrowTokensUpdate) {
      onEscrowTokensUpdate(escrowTokens);
    }
  }, [escrowTokens, onEscrowTokensUpdate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [yodlRes, preSlashedRes, delegationRes] = await Promise.all([
        supabase.from('yodl_staked_balances').select('*, operator:operators(name)'),
        supabase.from('delegated_vault_pre_slashing').select('*'),
        supabase.from('operator_delegations').select('*')
      ]);

      // Token prices for USD conversion
      const TOKEN_PRICES: Record<string, number> = {
        'USDC': 1,
        'USDT': 1,
        'DAI': 1,
        'WETH': 4480.49,
        'WBTC': 120409.15,
        'BNB': 1131.35,
        'MATIC': 0.24
      };

      // Use real data or fallback to mock data for demo
      const mockYodlBalances: YodlBalance[] = [
        { 
          id: '1', 
          operator_id: 'op1', 
          balance: 50000, 
          usd_value: 20000, 
          operator: { name: 'USDC Vault' },
          curator_name: 'RE7',
          maker_token: 'USDC',
          total_pre_slashed: 20000,
          total_slashable: 40000
        },
        { 
          id: '2', 
          operator_id: 'op2', 
          balance: 30000, 
          usd_value: 17921.96, 
          operator: { name: 'WETH Vault' },
          curator_name: 'CryptoMax',
          maker_token: 'WETH',
          total_pre_slashed: 4,
          total_slashable: 10
        },
        { 
          id: '3', 
          operator_id: 'op3', 
          balance: 20000, 
          usd_value: 20000, 
          operator: { name: 'DAI Vault' },
          curator_name: 'VaultGuard',
          maker_token: 'DAI',
          total_pre_slashed: 20000,
          total_slashable: 35000
        },
        { 
          id: '4', 
          operator_id: 'op4', 
          balance: 40000, 
          usd_value: 25000, 
          operator: { name: 'USDT Vault' },
          curator_name: 'RE7',
          maker_token: 'USDT',
          total_pre_slashed: 25000,
          total_slashable: 50000
        },
        { 
          id: '5', 
          operator_id: 'op5', 
          balance: 15000, 
          usd_value: 481636.60, 
          operator: { name: 'WBTC Vault' },
          curator_name: 'BitKeeper',
          maker_token: 'WBTC',
          total_pre_slashed: 4,
          total_slashable: 10
        }
      ];

      const mockPreSlashedData: PreSlashedData[] = [
        { id: '1', vault_address: '0x1234...5678', vault_name: 'USDC Vault', utilized_amount: 10000, remaining_amount: 10000, total_allocated: 20000, utilization_percentage: 50 },
        { id: '2', vault_address: '0xabcd...ef12', vault_name: 'WETH Vault', utilized_amount: 19000, remaining_amount: 1000, total_allocated: 20000, utilization_percentage: 95 },
        { id: '3', vault_address: '0x9876...ba98', vault_name: 'DAI Vault', utilized_amount: 21000, remaining_amount: 0, total_allocated: 20000, utilization_percentage: 100 },
        { id: '4', vault_address: '0x1111...0000', vault_name: 'USDT Vault', utilized_amount: 10000, remaining_amount: 15000, total_allocated: 25000, utilization_percentage: 40 },
        { id: '5', vault_address: '0xaaaa...ffff', vault_name: 'WBTC Vault', utilized_amount: 2000, remaining_amount: 6000, total_allocated: 8000, utilization_percentage: 25 }
      ];

      const mockDelegations: DelegationData[] = [
        { id: '1', operator_id: 'op1', amount: 1000000, usd_value: 1000000, token_type: 'USDC' },
        { id: '2', operator_id: 'op2', amount: 500, usd_value: 800000, token_type: 'WETH' },
        { id: '3', operator_id: 'op3', amount: 10, usd_value: 600000, token_type: 'WBTC' }
      ];

      setYodlBalances(mockYodlBalances);
      setPreSlashedData((preSlashedRes.data && preSlashedRes.data.length > 0) ? preSlashedRes.data : mockPreSlashedData);
      setDelegations((delegationRes.data && delegationRes.data.length > 0) ? delegationRes.data : mockDelegations);

      // Mock vault data for Position Status - must match format: "curator_name: maker_token Vault"
      const mockVaults: VaultData[] = [
        { id: '1', vault_name: 'RE7: USDC Vault', maker_token: 'USDC', escrow_amount: 10000, orchestrator_balance: 1000, total_pre_slashed: 20000 },
        { id: '2', vault_name: 'CryptoMax: WETH Vault', maker_token: 'WETH', escrow_amount: 3, orchestrator_balance: 1, total_pre_slashed: 4 },
        { id: '3', vault_name: 'VaultGuard: DAI Vault', maker_token: 'DAI', escrow_amount: 21000, orchestrator_balance: 1000, total_pre_slashed: 20000 },
        { id: '4', vault_name: 'RE7: USDT Vault', maker_token: 'USDT', escrow_amount: 0, orchestrator_balance: 15000, total_pre_slashed: 25000 },
        { id: '5', vault_name: 'BitKeeper: WBTC Vault', maker_token: 'WBTC', escrow_amount: 3, orchestrator_balance: 1, total_pre_slashed: 4 }
      ];

      if (!sharedVaults || sharedVaults.length === 0) {
        setVaults(mockVaults);
      }

      // Mock escrow tokens
      const mockEscrowTokens: EscrowToken[] = [
        { id: '1', token_symbol: 'USDC', amount: 850000, usd_value: 850000, isListed: true },
        { id: '2', token_symbol: 'WETH', amount: 320, usd_value: 800000, isListed: true },
        { id: '3', token_symbol: 'USDT', amount: 600000, usd_value: 600000, isListed: true },
        { id: '4', token_symbol: 'DAI', amount: 400000, usd_value: 400000, isListed: true },
        { id: '5', token_symbol: 'WBTC', amount: 12, usd_value: 720000, isListed: true },
        { id: '6', token_symbol: 'BNB', amount: 500, usd_value: 250000, isListed: false },
        { id: '7', token_symbol: 'MATIC', amount: 150000, usd_value: 180000, isListed: false },
      ];

      const listedTokens = new Set(mockVaults.map(v => v.maker_token));
      const tokensWithStatus = mockEscrowTokens.map(token => {
        const price = TOKEN_PRICES[token.token_symbol] || 1;
        return {
          ...token,
          usd_value: token.amount * price,
          isListed: listedTokens.has(token.token_symbol)
        };
      });

      // Load persisted tokens if available and normalize using current prices and listings
      const persisted = localStorage.getItem('escrowTokens');
      let initialTokens = tokensWithStatus;
      if (persisted) {
        try {
          const parsed: EscrowToken[] = JSON.parse(persisted);
          initialTokens = parsed.map(t => ({
            ...t,
            usd_value: (TOKEN_PRICES[t.token_symbol] || 1) * t.amount,
            isListed: listedTokens.has(t.token_symbol)
          }));
        } catch {}
      }

      setEscrowTokens(initialTokens);
      localStorage.setItem('escrowTokens', JSON.stringify(initialTokens));
    } catch (error) {
      console.error('Error fetching reserve data:', error);
      // Fallback to mock data on error
      setYodlBalances([
        { 
          id: '1', 
          operator_id: 'op1', 
          balance: 50000, 
          usd_value: 20000, 
          operator: { name: 'USDC Vault' },
          curator_name: 'RE7',
          maker_token: 'USDC',
          total_pre_slashed: 20000,
          total_slashable: 40000
        },
        { 
          id: '2', 
          operator_id: 'op2', 
          balance: 30000, 
          usd_value: 20000, 
          operator: { name: 'WETH Vault' },
          curator_name: 'CryptoMax',
          maker_token: 'WETH',
          total_pre_slashed: 8,
          total_slashable: 15
        },
        { 
          id: '3', 
          operator_id: 'op3', 
          balance: 20000, 
          usd_value: 20000, 
          operator: { name: 'DAI Vault' },
          curator_name: 'VaultGuard',
          maker_token: 'DAI',
          total_pre_slashed: 20000,
          total_slashable: 35000
        },
        { 
          id: '4', 
          operator_id: 'op4', 
          balance: 40000, 
          usd_value: 25000, 
          operator: { name: 'USDT Vault' },
          curator_name: 'RE7',
          maker_token: 'USDT',
          total_pre_slashed: 25000,
          total_slashable: 50000
        },
        { 
          id: '5', 
          operator_id: 'op5', 
          balance: 15000, 
          usd_value: 8000, 
          operator: { name: 'WBTC Vault' },
          curator_name: 'BitKeeper',
          maker_token: 'WBTC',
          total_pre_slashed: 0.13,
          total_slashable: 0.25
        }
      ]);
      setPreSlashedData([
        { id: '1', vault_address: '0x1234...5678', vault_name: 'USDC Vault', utilized_amount: 10000, remaining_amount: 10000, total_allocated: 20000, utilization_percentage: 50 },
        { id: '2', vault_address: '0xabcd...ef12', vault_name: 'WETH Vault', utilized_amount: 19000, remaining_amount: 1000, total_allocated: 20000, utilization_percentage: 95 },
        { id: '3', vault_address: '0x9876...ba98', vault_name: 'DAI Vault', utilized_amount: 21000, remaining_amount: 0, total_allocated: 20000, utilization_percentage: 100 },
        { id: '4', vault_address: '0x1111...0000', vault_name: 'USDT Vault', utilized_amount: 10000, remaining_amount: 15000, total_allocated: 25000, utilization_percentage: 40 },
        { id: '5', vault_address: '0xaaaa...ffff', vault_name: 'WBTC Vault', utilized_amount: 2000, remaining_amount: 6000, total_allocated: 8000, utilization_percentage: 25 }
      ]);
      setDelegations([
        { id: '1', operator_id: 'op1', amount: 1000000, usd_value: 1000000, token_type: 'USDC' },
        { id: '2', operator_id: 'op2', amount: 500, usd_value: 800000, token_type: 'WETH' },
        { id: '3', operator_id: 'op3', amount: 10, usd_value: 600000, token_type: 'WBTC' }
      ]);
      
      // Fallback vault data - must match format: "curator_name: maker_token Vault"
      const mockVaults: VaultData[] = [
        { id: '1', vault_name: 'RE7: USDC Vault', maker_token: 'USDC', escrow_amount: 10000, orchestrator_balance: 1000, total_pre_slashed: 20000 },
        { id: '2', vault_name: 'CryptoMax: WETH Vault', maker_token: 'WETH', escrow_amount: 19000, orchestrator_balance: 1000, total_pre_slashed: 20000 }
      ];

      const mockEscrowTokens: EscrowToken[] = [
        { id: '1', token_symbol: 'USDC', amount: 850000, usd_value: 850000, isListed: true },
        { id: '2', token_symbol: 'WETH', amount: 320, usd_value: 800000, isListed: true },
        { id: '6', token_symbol: 'BNB', amount: 500, usd_value: 250000, isListed: false },
      ];

      if (!sharedVaults || sharedVaults.length === 0) {
        setVaults(mockVaults);
      }

      const listedTokens = new Set(mockVaults.map(v => v.maker_token));
      const tokensWithStatus = mockEscrowTokens.map(token => {
        const price = TOKEN_PRICES[token.token_symbol] || 1;
        return {
          ...token,
          usd_value: token.amount * price,
          isListed: listedTokens.has(token.token_symbol)
        };
      });
      
      // Load persisted tokens if available and normalize
      const persisted = localStorage.getItem('escrowTokens');
      let initialTokens = tokensWithStatus;
      if (persisted) {
        try {
          const parsed: EscrowToken[] = JSON.parse(persisted);
          initialTokens = parsed.map(t => ({
            ...t,
            usd_value: (TOKEN_PRICES[t.token_symbol] || 1) * t.amount,
            isListed: listedTokens.has(t.token_symbol)
          }));
        } catch {}
      }

      setEscrowTokens(initialTokens);
      localStorage.setItem('escrowTokens', JSON.stringify(initialTokens));
    } finally {
      setLoading(false);
    }
  };

  const handleSlashPreFund = (vault: YodlBalance) => {
    setSelectedVault(vault);
    setSlashAmount("");
    setSlashDialogOpen(true);
  };

  const handleSlashSubmit = () => {
    if (!selectedVault) return;
    
    const amount = parseFloat(slashAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const tokenPrice = TOKEN_PRICES[selectedVault.maker_token] || 1;
    const maxSlashableUsd = (selectedVault.total_slashable - selectedVault.total_pre_slashed) * tokenPrice;
    
    if (amount > maxSlashableUsd) {
      toast({
        title: "Amount Exceeds Limit",
        description: `Maximum slashable amount is $${maxSlashableUsd.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Update vault balances with animation
    const updatedYodlBalances = yodlBalances.map(v => 
      v.id === selectedVault.id 
        ? { ...v, isSlashing: true }
        : v
    );

    setYodlBalances(updatedYodlBalances);

    // Remove animation flag after animation completes
    setTimeout(() => {
      setYodlBalances(prev => 
        prev.map(v => v.id === selectedVault.id ? { ...v, isSlashing: false } : v)
      );
    }, 1000);

    const vaultDisplayName = `${selectedVault.curator_name}: ${selectedVault.maker_token} Vault`;
    toast({
      title: "Slash/Pre-Fund Successful",
      description: `Slashed $${amount.toLocaleString()} from ${vaultDisplayName}`,
    });
    
    setSlashDialogOpen(false);
    setSlashAmount("");
  };

  const handleRestore = (token: EscrowToken) => {
    setSelectedToken(token);
    setSelectedRestoreVault("");
    setRestoreAmount("");
    setRestoreDialogOpen(true);
  };

  const handleRestoreSubmit = () => {
    if (!selectedToken || !selectedRestoreVault) {
      toast({
        title: "Missing Information",
        description: "Please select a vault and enter an amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(restoreAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Find the selected vault from yodlBalances
    const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
    if (!vault) {
      toast({
        title: "Vault Not Found",
        description: "Selected vault not found",
        variant: "destructive"
      });
      return;
    }

    // Calculate available capacity in the vault (using data from Active Vaults)
    const vaultData = vaults.find(v => v.vault_name === `${vault.curator_name}: ${vault.maker_token} Vault`);
    if (!vaultData) {
      toast({
        title: "Vault Data Not Found",
        description: "Could not find corresponding vault data",
        variant: "destructive"
      });
      return;
    }
    
    const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
    const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
    const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
    const availableCapacityUsd = availableCapacity * vaultTokenPrice;

    // Calculate how much of the selected token we can use (in USD)
    const selectedTokenUsd = selectedToken.amount * tokenPrice;

    // Check if amount exceeds available capacity
    if (amount > availableCapacityUsd) {
      toast({
        title: "Amount Exceeds Capacity",
        description: `Maximum restorable amount to this vault is $${availableCapacityUsd.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Check if amount exceeds available escrow balance
    if (amount > selectedTokenUsd) {
      toast({
        title: "Insufficient Escrow Balance",
        description: `Available escrow balance is $${selectedTokenUsd.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Convert amount to target vault's token
    const tokenQuantityUsed = amount / tokenPrice;
    const vaultTokenQuantity = amount / vaultTokenPrice;

    // Update escrow token balance and persist
    const updatedTokens = escrowTokens.map(t =>
      t.id === selectedToken.id
        ? { ...t, amount: t.amount - tokenQuantityUsed, usd_value: (t.amount - tokenQuantityUsed) * (TOKEN_PRICES[t.token_symbol] || 1) }
        : t
    );
    setEscrowTokens(updatedTokens);
    localStorage.setItem('escrowTokens', JSON.stringify(updatedTokens));

    // Update vault orchestrator balance in Active Vaults data and notify parent immediately
    const updatedVaults = vaults.map(v =>
      v.id === vaultData.id
        ? { ...v, orchestrator_balance: v.orchestrator_balance + vaultTokenQuantity }
        : v
    );
    
    setVaults(updatedVaults);
    
    // Notify parent component of vault updates immediately
    if (onVaultsUpdate) {
      onVaultsUpdate(updatedVaults);
    }

    const conversionMessage = selectedToken.token_symbol !== vault.maker_token
      ? ` (converted from ${tokenQuantityUsed.toFixed(4)} ${selectedToken.token_symbol})`
      : '';

    toast({
      title: "Restore Successful",
      description: `Restored ${vaultTokenQuantity.toFixed(4)} ${vault.maker_token}${conversionMessage} to ${vault.curator_name}: ${vault.maker_token} Vault`,
    });

    setRestoreDialogOpen(false);
  };

  const handleSwap = (token: EscrowToken) => {
    setSwapSelectedToken(token);
    setSwapTargetVault("");
    setSwapAmount("");
    setSwapDialogOpen(true);
  };

  const handleSwapSubmit = () => {
    if (!swapSelectedToken || !swapTargetVault) {
      toast({
        title: "Missing Information",
        description: "Please select a target vault and enter an amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    // Find the target vault
    const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
    if (!targetVault) {
      toast({
        title: "Vault Not Found",
        description: "Selected vault not found",
        variant: "destructive"
      });
      return;
    }

    const targetVaultData = vaults.find(v => v.vault_name === `${targetVault.curator_name}: ${targetVault.maker_token} Vault`);
    if (!targetVaultData) {
      toast({
        title: "Vault Data Not Found",
        description: "Could not find corresponding vault data",
        variant: "destructive"
      });
      return;
    }

    // Calculate available capacity
    const vaultTokenPrice = TOKEN_PRICES[targetVault.maker_token] || 1;
    const availableCapacity = targetVaultData.total_pre_slashed - targetVaultData.orchestrator_balance;
    const availableCapacityUsd = availableCapacity * vaultTokenPrice;

    if (amount > availableCapacityUsd) {
      toast({
        title: "Amount Exceeds Capacity",
        description: `Maximum restorable amount to this vault is $${availableCapacityUsd.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Check if amount exceeds available escrow balance
    const unlistedTokenPrice = TOKEN_PRICES[swapSelectedToken.token_symbol] || 1;
    const swapTokenAvailableUsd = swapSelectedToken.amount * unlistedTokenPrice;

    if (amount > swapTokenAvailableUsd) {
      toast({
        title: "Insufficient Escrow Balance",
        description: `Available escrow balance is $${swapTokenAvailableUsd.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    // Update escrow token balance (remove the un-listed token) and persist
    const tokenQuantityUsed = amount / unlistedTokenPrice;
    const updatedTokens = escrowTokens.map(t =>
      t.id === swapSelectedToken.id
        ? { ...t, amount: t.amount - tokenQuantityUsed, usd_value: (t.amount - tokenQuantityUsed) * (TOKEN_PRICES[t.token_symbol] || 1) }
        : t
    );
    setEscrowTokens(updatedTokens);
    localStorage.setItem('escrowTokens', JSON.stringify(updatedTokens));

    // Update vault orchestrator balance and notify parent immediately
    const targetTokenQuantity = amount / vaultTokenPrice;
    const updatedVaults = vaults.map(v =>
      v.id === targetVaultData.id
        ? { ...v, orchestrator_balance: v.orchestrator_balance + targetTokenQuantity, escrow_amount: v.escrow_amount - targetTokenQuantity }
        : v
    );
    
    setVaults(updatedVaults);
    
    // Notify parent component of vault updates immediately
    if (onVaultsUpdate) {
      onVaultsUpdate(updatedVaults);
    }

    toast({
      title: "Swap & Restore Successful",
      description: `Swapped ${tokenQuantityUsed.toFixed(4)} ${swapSelectedToken.token_symbol} and restored ${targetTokenQuantity.toFixed(4)} ${targetVault.maker_token} to vault`,
    });

    setSwapDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Token prices for USD conversion
  const TOKEN_PRICES: Record<string, number> = {
    'USDC': 1,
    'USDT': 1,
    'DAI': 1,
    'WETH': 4480.49,
    'WBTC': 120409.15,
    'BNB': 1131.35,
    'MATIC': 0.24
  };

  const totalYodlStaked = yodlBalances.reduce((sum, b) => sum + b.balance, 0);
  const totalYodlUsd = yodlBalances.reduce((sum, b) => sum + b.usd_value, 0);
  
  // Calculate total pre-slashed and total slashable in USD
  const totalPreSlashedUsd = yodlBalances.reduce((sum, b) => {
    const price = TOKEN_PRICES[b.maker_token] || 1;
    return sum + (b.total_pre_slashed * price);
  }, 0);
  
  const totalSlashableUsd = yodlBalances.reduce((sum, b) => {
    const price = TOKEN_PRICES[b.maker_token] || 1;
    return sum + (b.total_slashable * price);
  }, 0);

  // Position Status calculations
  const totalAssetsSlashed = vaults.reduce((sum, v) => {
    const price = TOKEN_PRICES[v.maker_token] || 1;
    return sum + (v.total_pre_slashed * price);
  }, 0);
  
  const totalAssetsInCustody = vaults.reduce((sum, v) => {
    const price = TOKEN_PRICES[v.maker_token] || 1;
    return sum + ((v.escrow_amount + v.orchestrator_balance) * price);
  }, 0);
  
  const grossProfitLoss = totalAssetsInCustody - totalAssetsSlashed;
  const profitLossPercentage = totalAssetsSlashed > 0 ? (grossProfitLoss / totalAssetsSlashed) * 100 : 0;
  const isProfit = grossProfitLoss >= 0;
  const numAssetsSlashed = vaults.filter(v => v.total_pre_slashed > 0).length;
  const numAssetsHeld = new Set(vaults.map(v => v.maker_token)).size;

  return (
    <div className="space-y-6">
      {/* Vault Reserve Balance with Slash/Pre-Fund Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vault Reserve Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Staked</p>
              <p className="text-2xl font-bold">${totalYodlUsd.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Total Pre-Slashed vs Total Slashable</p>
              <p className="text-lg font-bold">
                ${totalPreSlashedUsd.toLocaleString()} / ${totalSlashableUsd.toLocaleString()}
              </p>
              <Progress value={(totalPreSlashedUsd / totalSlashableUsd) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {((totalPreSlashedUsd / totalSlashableUsd) * 100).toFixed(1)}% Utilized
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {yodlBalances.map((balance) => {
              const tokenPrice = TOKEN_PRICES[balance.maker_token] || 1;
              const preSlashedUsd = balance.total_pre_slashed * tokenPrice;
              const totalSlashableUsd = balance.total_slashable * tokenPrice;
              const utilizationPercent = totalSlashableUsd > 0 ? (preSlashedUsd / totalSlashableUsd) * 100 : 0;
              const vaultDisplayName = `${balance.curator_name}: ${balance.maker_token} Vault`;
              
              return (
                <Collapsible key={balance.id}>
                  <CollapsibleTrigger className="flex items-center gap-4 w-full p-4 rounded-lg hover:bg-muted/50">
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    
                    {/* Left Side - Vault Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <p className="font-medium whitespace-nowrap">{vaultDisplayName}</p>
                        <p className="text-sm">
                          {balance.total_pre_slashed.toLocaleString()} {balance.maker_token} / {balance.total_slashable.toLocaleString()} {balance.maker_token}
                        </p>
                        <p className="text-sm text-cyan-500 whitespace-nowrap">
                          (Total Pre-Slashed / Total Slashable)
                        </p>
                      </div>
                      <Progress value={utilizationPercent} className={`h-2 mb-1 transition-all duration-1000 ${balance.isSlashing ? 'animate-pulse' : ''}`} />
                      <p className="text-xs text-muted-foreground">
                        Utilization %: {utilizationPercent.toFixed(0)}%
                      </p>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 pt-0 space-y-4 bg-muted/20 rounded-b-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Staked</p>
                          <p className="font-medium">{balance.balance.toLocaleString()} YODL</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">USD Value</p>
                          <p className="font-medium">${balance.usd_value.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Pre-Slashed</p>
                          <p className="font-medium">{balance.total_pre_slashed.toLocaleString()} {balance.maker_token}</p>
                          <p className="text-xs text-muted-foreground">${preSlashedUsd.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Slashable</p>
                          <p className="font-medium text-green-600">{balance.total_slashable.toLocaleString()} {balance.maker_token}</p>
                          <p className="text-xs text-muted-foreground">${totalSlashableUsd.toLocaleString()}</p>
                        </div>
                      </div>

                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlashPreFund(balance);
                        }}
                      >
                        Slash/Pre-Fund
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Slash/Pre-Fund Dialog */}
      <Dialog open={slashDialogOpen} onOpenChange={setSlashDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slash/Pre-Fund - {selectedVault && `${selectedVault.curator_name}: ${selectedVault.maker_token} Vault`}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to slash/pre-fund from this vault
            </DialogDescription>
          </DialogHeader>
          
          {selectedVault && (() => {
            const tokenPrice = TOKEN_PRICES[selectedVault.maker_token] || 1;
            const totalSlashableUsd = selectedVault.total_slashable * tokenPrice;
            const preSlashedUsd = selectedVault.total_pre_slashed * tokenPrice;
            const maxAvailableUsd = totalSlashableUsd - preSlashedUsd;
            
            return (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Slashable:</span>
                    <span className="font-medium">
                      {selectedVault.total_slashable.toLocaleString()} {selectedVault.maker_token} (${totalSlashableUsd.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Pre-Slashed:</span>
                    <span className="font-medium">
                      {selectedVault.total_pre_slashed.toLocaleString()} {selectedVault.maker_token} (${preSlashedUsd.toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Maximum Available:</span>
                    <span className="text-green-600">
                      {(selectedVault.total_slashable - selectedVault.total_pre_slashed).toLocaleString()} {selectedVault.maker_token} (${maxAvailableUsd.toLocaleString()})
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slash-amount">Slash Amount (USD)</Label>
                  <Input
                    id="slash-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={slashAmount}
                    onChange={(e) => setSlashAmount(e.target.value)}
                    min="0"
                    max={maxAvailableUsd}
                  />
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSlashDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSlashSubmit}>
              Confirm Slash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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

      {/* Position Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Position Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Value of Assets Slashed */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current Value of Assets Slashed</p>
              <p className="text-3xl font-bold mb-2">${totalAssetsSlashed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">No. of Assets Slashed: {numAssetsSlashed}</p>
            </div>

            {/* Current Value of Assets in Custody */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Current Value of Assets in Custody</p>
              <p className="text-3xl font-bold mb-2">${totalAssetsInCustody.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">No. of Assets Held: {numAssetsHeld}</p>
            </div>

            {/* Gross Profit/Loss */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Gross Profit/Loss</p>
              <div className="flex items-center gap-2 mb-2">
                {isProfit ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <p className={`text-3xl font-bold ${isProfit ? 'text-green-600' : 'text-destructive'}`}>
                  ${Math.abs(grossProfitLoss).toLocaleString()}
                </p>
              </div>
              <p className={`text-xs ${isProfit ? 'text-green-600' : 'text-destructive'}`}>
                {isProfit ? '+' : '-'}{Math.abs(profitLossPercentage).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Assets in Escrow Table */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Assets in Escrow</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token Name</TableHead>
                  <TableHead className="text-right">Token Quantity</TableHead>
                  <TableHead className="text-right">Token Amount in USD</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escrowTokens.map((token) => (
                  <TableRow key={token.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-xs text-primary">
                            {token.token_symbol.substring(0, 2)}
                          </span>
                        </div>
                        {token.token_symbol}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {token.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${token.usd_value.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={token.isListed ? "default" : "secondary"}>
                        {token.isListed ? "Listed" : "Un-Listed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {token.isListed ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRestore(token)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleSwap(token)}
                        >
                          Swap
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Funds to Vault</DialogTitle>
            <DialogDescription>
              Transfer funds from escrow to a vault. The system will automatically convert tokens if needed.
            </DialogDescription>
          </DialogHeader>

          {selectedToken && (
            <div className="space-y-4">
              {/* Selected Token Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Selected Token</p>
                  <p className="font-semibold">{selectedToken.token_symbol}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Available in Escrow</p>
                  <p className="font-medium">
                    {selectedToken.amount.toLocaleString()} {selectedToken.token_symbol}
                    <span className="text-sm text-muted-foreground ml-2">
                      (${selectedToken.usd_value.toLocaleString()})
                    </span>
                  </p>
                </div>
              </div>

              {/* Vault Selection */}
              <div className="space-y-2">
                <Label htmlFor="restore-vault">Select Vault</Label>
                <Select value={selectedRestoreVault} onValueChange={setSelectedRestoreVault}>
                  <SelectTrigger id="restore-vault">
                    <SelectValue placeholder="Choose a vault" />
                  </SelectTrigger>
                  <SelectContent>
                    {yodlBalances.map((vault) => {
                      const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return null;
                      
                      const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                      const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const availableCapacityUsd = availableCapacity * vaultTokenPrice;
                      
                      return (
                        <SelectItem key={vault.id} value={vault.id}>
                          <div className="flex flex-col">
                            <span>{vaultDisplayName}</span>
                            <span className="text-xs text-muted-foreground">
                              Available capacity: {availableCapacity.toLocaleString()} {vault.maker_token} (${availableCapacityUsd.toLocaleString()})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="restore-amount">
                  {selectedRestoreVault && (() => {
                    const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                    return vault ? `Amount (${vault.maker_token})` : 'Amount (USD)';
                  })() || 'Amount (USD)'}
                </Label>
                <Input
                  id="restore-amount"
                  type="number"
                  placeholder={selectedRestoreVault && (() => {
                    const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                    return vault ? `Enter amount in ${vault.maker_token}` : 'Enter amount in USD';
                  })() || 'Enter amount in USD'}
                  value={restoreAmount}
                  onChange={(e) => setRestoreAmount(e.target.value)}
                  min="0"
                />
              </div>

              {/* Preview Calculation */}
              {selectedRestoreVault && restoreAmount && (() => {
                const amount = parseFloat(restoreAmount);
                if (isNaN(amount) || amount <= 0) return null;

                const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                if (!vault) return null;

                const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                const tokenQuantityUsed = amount / tokenPrice;
                const vaultTokenQuantity = amount / vaultTokenPrice;

                return (
                  <div className="p-4 bg-primary/10 rounded-lg space-y-2 text-sm">
                    <p className="font-semibold">Preview:</p>
                    <p>• Using: {tokenQuantityUsed.toFixed(4)} {selectedToken.token_symbol}</p>
                    <p>• Restoring: {vaultTokenQuantity.toFixed(4)} {vault.maker_token}</p>
                    <p>• To: {vault.curator_name}: {vault.maker_token} Vault</p>
                  </div>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestoreSubmit}>
              Confirm Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={swapDialogOpen} onOpenChange={setSwapDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Swap & Restore Un-Listed Token</DialogTitle>
            <DialogDescription>
              Choose target vault and amount to restore.
            </DialogDescription>
          </DialogHeader>

          {swapSelectedToken && (
            <div className="space-y-4">
              {/* Selected Token Info */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Un-Listed Token</p>
                  <p className="font-semibold">{swapSelectedToken.token_symbol}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Available in Escrow</p>
                  <p className="font-medium">
                    {swapSelectedToken.amount.toLocaleString()} {swapSelectedToken.token_symbol}
                    <span className="text-sm text-muted-foreground ml-2">
                      (${swapSelectedToken.usd_value.toLocaleString()})
                    </span>
                  </p>
                </div>
              </div>

              {/* Select Target Vault */}
              <div className="space-y-2">
                <Label htmlFor="swap-target-vault">Select Target Vault to Restore</Label>
                <Select value={swapTargetVault} onValueChange={setSwapTargetVault}>
                  <SelectTrigger id="swap-target-vault">
                    <SelectValue placeholder="Choose a vault" />
                  </SelectTrigger>
                  <SelectContent>
                    {yodlBalances.map((vault) => {
                      const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return null;
                      
                      const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const availableCapacityUsd = availableCapacity * vaultTokenPrice;
                      
                      return (
                        <SelectItem key={vault.id} value={vault.id}>
                          <div className="flex flex-col">
                            <span>{vaultDisplayName}</span>
                            <span className="text-xs text-muted-foreground">
                              Available capacity: {availableCapacity.toLocaleString()} {vault.maker_token} (${availableCapacityUsd.toLocaleString()})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="swap-amount">
                  {swapTargetVault && (() => {
                    const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                    return targetVault ? `Amount to Restore (${targetVault.maker_token})` : 'Amount to Restore (USD)';
                  })() || 'Amount to Restore (USD)'}
                </Label>
                <Input
                  id="swap-amount"
                  type="number"
                  placeholder={swapTargetVault && (() => {
                    const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                    return targetVault ? `Enter amount in ${targetVault.maker_token}` : 'Enter amount in USD';
                  })() || 'Enter amount in USD'}
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSwapDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSwapSubmit}>
              Confirm Swap & Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}