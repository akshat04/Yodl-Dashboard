import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Wallet, ChevronDown, TrendingUp, TrendingDown, Info, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

interface CreditLineData {
  id: string;
  vault_name: string;
  vault_address: string;
  token: string;
  delegated: number;
  borrowed_quantity: number;
  available_credit_percent: number;
  interest_percent: number;
}

export function ReserveTab({ sharedVaults, onVaultsUpdate, escrowTokens: propEscrowTokens, onEscrowTokensUpdate }: ReserveTabProps) {
  // Tab state for listed/unlisted tokens
  const [tokenTab, setTokenTab] = useState<'listed' | 'unlisted'>('listed');
  const [yodlBalances, setYodlBalances] = useState<YodlBalance[]>([]);
  const [preSlashedData, setPreSlashedData] = useState<PreSlashedData[]>([]);
  const [delegations, setDelegations] = useState<DelegationData[]>([]);
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [escrowTokens, setEscrowTokens] = useState<EscrowToken[]>([]);
  const [creditLineData, setCreditLineData] = useState<CreditLineData[]>([]);
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
  const [liquiditySourceRestore, setLiquiditySourceRestore] = useState<string>("uniswap");
  const [liquiditySourceSwap, setLiquiditySourceSwap] = useState<string>("uniswap");
  const [slippageRestore, setSlippageRestore] = useState<string>("0.5");
  const [slippageSwap, setSlippageSwap] = useState<string>("0.5");
  const [sortColumn, setSortColumn] = useState<'available_credit' | 'interest' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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

  // Generate credit line data when yodlBalances and delegations are loaded
  useEffect(() => {
    if (yodlBalances.length > 0 && delegations.length > 0) {
      const TOKEN_PRICES: Record<string, number> = {
        'USDC': 1,
        'USDT': 1,
        'DAI': 1,
        'WETH': 4480.49,
        'WBTC': 120409.15,
        'BNB': 1131.35,
        'MATIC': 0.24
      };

      const creditData: CreditLineData[] = yodlBalances
        .map((balance) => {
          const delegation = delegations.find(d => d.token_type === balance.maker_token);
          const tokenPrice = TOKEN_PRICES[balance.maker_token] || 1;
          const availableCredit = balance.total_slashable > 0 
            ? ((balance.total_slashable - balance.total_pre_slashed) / balance.total_slashable) * 100 
            : 0;
          
          return {
            id: balance.id,
            vault_name: `${balance.curator_name}: ${balance.maker_token} Vault`,
            vault_address: `0x${Math.random().toString(16).slice(2, 42)}`,
            token: balance.maker_token,
            delegated: delegation?.usd_value || 0,
            borrowed_quantity: balance.total_pre_slashed,
            available_credit_percent: availableCredit,
            interest_percent: 0,
          };
        })
        .filter(item => item.delegated > 0);

      setCreditLineData(creditData);
      loadInterestRates();
    }
  }, [yodlBalances, delegations]);

  const loadInterestRates = () => {
    const stored = localStorage.getItem('vaultFees');
    if (stored) {
      try {
        const feeData = JSON.parse(stored);
        setCreditLineData(prev => prev.map(vault => {
          // Find fee by matching mapped_to field to vault_name
          const feeInfo = feeData.find((f: any) => 
            f.mapped_to === vault.vault_name
          );
          return {
            ...vault,
            interest_percent: feeInfo?.fee_percentage || vault.interest_percent
          };
        }));
      } catch (error) {
        console.error('Error loading interest rates:', error);
      }
    }
  };

  // Listen for storage changes to update interest rates in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      loadInterestRates();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event from same tab
    window.addEventListener('vaultFeesUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vaultFeesUpdated', handleStorageChange);
    };
  }, [creditLineData]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSort = (column: 'available_credit' | 'interest') => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortedCreditLineData = () => {
    if (!sortColumn) return creditLineData;

    return [...creditLineData].sort((a, b) => {
      let aValue: number;
      let bValue: number;

      if (sortColumn === 'available_credit') {
        aValue = a.available_credit_percent;
        bValue = b.available_credit_percent;
      } else {
        aValue = a.interest_percent;
        bValue = b.interest_percent;
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const renderSortIcon = (column: 'available_credit' | 'interest') => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline" />
      : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

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

  const handleBuyAndStake = () => {
    toast({
      title: "Buy and Stake",
      description: "Opening YODL purchase interface...",
    });
  };

  const handleBorrow = (vault: CreditLineData) => {
    toast({
      title: "Borrow from Vault",
      description: `Initiating borrow from ${vault.vault_name}`,
    });
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
  
  // Calculate P/L metrics
  const unrealisedPL = totalAssetsInCustody - totalAssetsSlashed;
  const unrealisedPercentage = totalAssetsSlashed > 0 ? (unrealisedPL / totalAssetsSlashed) * 100 : 0;
  const isUnrealisedProfit = unrealisedPL >= 0;
  
  // Realised P/L (placeholder - would need historical trade data)
  const realisedPL = 0; // This would be calculated from completed trades
  const isRealisedProfit = realisedPL >= 0;
  
  const numAssetsSlashed = vaults.filter(v => v.total_pre_slashed > 0).length;
  const numAssetsHeld = new Set(vaults.map(v => v.maker_token)).size;

  // Split tokens by listed/unlisted
  const listedTokens = escrowTokens.filter(t => t.isListed);
  const unlistedTokens = escrowTokens.filter(t => !t.isListed);

  return (
    <div className="space-y-6">
      {/* Vault Reserve Balance with Slash/Pre-Fund Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Borrowed Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Slashed Card */}
          <div className="p-6 bg-primary/10 rounded-lg space-y-4">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* a. Total USD value of Pre-slashed */}
              <div>
                <p className="text-xs text-muted-foreground">Total Pre-Slashed (USD)</p>
                <p className="text-xl font-bold">${totalPreSlashedUsd.toLocaleString()}</p>
              </div>
              
              {/* b. Total USD value of Delegation */}
              <div>
                <p className="text-xs text-muted-foreground">Total Delegation (USD)</p>
                <p className="text-xl font-bold">${delegations.reduce((sum, d) => sum + d.usd_value, 0).toLocaleString()}</p>
              </div>
              
              {/* c. % of Credit Line Available */}
              <div>
                <p className="text-xs text-muted-foreground">Credit Line Available</p>
                <p className="text-xl font-bold text-green-600">
                  {totalSlashableUsd > 0 ? (((totalSlashableUsd - totalPreSlashedUsd) / totalSlashableUsd) * 100).toFixed(1) : 0}%
                </p>
              </div>

              {/* d. YODL staked */}
              <div>
                <p className="text-xs text-muted-foreground">YODL Staked</p>
                <p className="text-xl font-bold">{totalYodlStaked.toLocaleString()} YODL</p>
              </div>
              
              {/* e. Amount Available (USD) for Loan */}
              <div>
                <p className="text-xs text-muted-foreground">Available for Borrowing</p>
                <p className="text-xl font-bold">${(totalSlashableUsd - totalPreSlashedUsd).toLocaleString()}</p>
              </div>

              {/* f. Execution multiplier */}
              <div>
                <p className="text-xs text-muted-foreground">Execution Multiplier</p>
                <p className="text-xl font-bold">2.5x</p>
              </div>
              
              {/* g. Buy and Stake button */}
              <div className="flex items-end">
                <Button className="w-full" onClick={handleBuyAndStake}>
                  Buy and Stake YODL
                </Button>
              </div>
            </div>
          </div>

          {/* 
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
          */}

          {/* Credit Line Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Credit Line Available</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Vault Name</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Delegated</TableHead>
                  <TableHead className="text-right">Borrowed Quantity</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('available_credit')}
                  >
                    Available Quantity
                    {renderSortIcon('available_credit')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('interest')}
                  >
                    Fee %
                    {renderSortIcon('interest')}
                  </TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedCreditLineData().map((vault) => (
                  <TableRow key={vault.id}>
                    {/* Vault Name */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{vault.vault_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {truncateAddress(vault.vault_address)}
                        </span>
                      </div>
                    </TableCell>
                    
                    {/* Token */}
                    <TableCell className="font-medium">{vault.token}</TableCell>
                    
                    {/* Delegated */}
                    <TableCell className="text-right">
                      ${vault.delegated.toLocaleString()}
                    </TableCell>
                    
                    {/* Borrowed Quantity */}
                    <TableCell className="text-right">
                      {vault.borrowed_quantity.toLocaleString()} {vault.token}
                    </TableCell>
                    
                    {/* Available Credit */}
                    <TableCell className="text-right">
                      <Badge variant={vault.available_credit_percent > 50 ? "default" : "destructive"}>
                        {vault.available_credit_percent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    
                    {/* Interest */}
                    <TableCell className="text-right font-semibold">
                      {vault.interest_percent.toFixed(2)}%
                    </TableCell>
                    
                    {/* Borrow Button */}
                    <TableCell className="text-center">
                      <Button 
                        size="sm"
                        onClick={() => handleBorrow(vault)}
                      >
                        Borrow
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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



      {/* Position Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Position Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TooltipProvider>
            {/* Key Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Realised P/L */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-muted-foreground">Realised P/L</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Actual profit or loss from completed trades and settled positions, representing realized gains or losses.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {isRealisedProfit ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                  <p className={`text-3xl font-bold ${isRealisedProfit ? 'text-green-600' : 'text-destructive'}`}>
                    ${Math.abs(realisedPL).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">From completed trades</p>
              </div>
            </div>
          </TooltipProvider>

          {/* Assets in Escrow Table - Tabbed Version */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Assets in Escrow</h3>
            <Tabs value={tokenTab} onValueChange={v => setTokenTab(v as 'listed' | 'unlisted')} className="w-full">
              <TabsList className="mb-2 flex w-full">
                <TabsTrigger value="listed" className="flex-1">Listed Tokens</TabsTrigger>
                <TabsTrigger value="unlisted" className="flex-1">Unlisted Tokens</TabsTrigger>
              </TabsList>
              <TabsContent value="listed">
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
                    {listedTokens.map((token) => (
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
                          <Badge variant="default">Listed</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRestore(token)}
                          >
                            Restore
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="unlisted">
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
                    {unlistedTokens.map((token) => (
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
                          <Badge variant="secondary">Un-Listed</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleSwap(token)}
                          >
                            Swap
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  <SelectTrigger id="restore-vault" className="bg-background text-foreground">
                    <SelectValue placeholder="Choose a vault" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    {yodlBalances
                      .filter((vault) => {
                        const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                        const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                        if (!vaultData) return false;
                        const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                        return availableCapacity > 0 && vault.maker_token === selectedToken.token_symbol;
                      })
                      .map((vault) => {
                        const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                        const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                        if (!vaultData) return null;
                        
                        const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                        const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                        const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                        const availableCapacityUsd = availableCapacity * vaultTokenPrice;
                        
                        return (
                          <SelectItem key={vault.id} value={vault.id} className="text-foreground">
                            <div className="flex flex-col">
                              <span>{vaultDisplayName}</span>
                              <span className="text-xs text-foreground">
                                Available capacity: {availableCapacity.toLocaleString()} {vault.maker_token} (${availableCapacityUsd.toLocaleString()})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Liquidity Source and Slippage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liquidity-source-restore">Liquidity Source</Label>
                  <Select value={liquiditySourceRestore} onValueChange={setLiquiditySourceRestore}>
                    <SelectTrigger id="liquidity-source-restore" className="bg-background text-foreground">
                      <SelectValue placeholder="Select liquidity source" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      <SelectItem value="uniswap" className="text-foreground">Uniswap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slippage-restore">Slippage (%)</Label>
                  <Input
                    id="slippage-restore"
                    type="number"
                    placeholder="0.5"
                    value={slippageRestore}
                    onChange={(e) => setSlippageRestore(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="restore-amount">
                  {selectedRestoreVault && (() => {
                    const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                    return vault ? `Amount (${vault.maker_token})` : 'Amount (USD)';
                  })() || 'Amount (USD)'}
                </Label>
                <div className="flex gap-2">
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
                    max={selectedRestoreVault && (() => {
                      const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                      if (!vault) return undefined;
                      
                      const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return undefined;
                      
                      const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                      const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const escrowBalanceInVaultToken = (selectedToken.amount * tokenPrice) / vaultTokenPrice;
                      
                      return Math.min(escrowBalanceInVaultToken, availableCapacity);
                    })() || undefined}
                    className="bg-background text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!selectedRestoreVault) return;
                      
                      const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                      if (!vault) return;
                      
                      const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return;
                      
                      const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                      const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const escrowBalanceInVaultToken = (selectedToken.amount * tokenPrice) / vaultTokenPrice;
                      
                      const maxAmount = Math.min(escrowBalanceInVaultToken, availableCapacity);
                      setRestoreAmount(maxAmount.toFixed(6));
                    }}
                  >
                    Max
                  </Button>
                </div>
                
                {/* Max Amount Display */}
                {selectedRestoreVault && (() => {
                  const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                  if (!vault) return null;
                  
                  const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                  const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                  if (!vaultData) return null;
                  
                  const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                  const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                  const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                  const escrowBalanceInVaultToken = (selectedToken.amount * tokenPrice) / vaultTokenPrice;
                  
                  const maxAmount = Math.min(escrowBalanceInVaultToken, availableCapacity);
                  
                  return (
                    <p className="text-xs text-muted-foreground">
                      Max: {maxAmount.toLocaleString()} {vault.maker_token}
                    </p>
                  );
                })()}
                
                {/* Escrow Token Usage Display */}
                {selectedRestoreVault && restoreAmount && (() => {
                  const amount = parseFloat(restoreAmount);
                  if (isNaN(amount) || amount <= 0) return null;

                  const vault = yodlBalances.find(v => v.id === selectedRestoreVault);
                  if (!vault) return null;

                  const tokenPrice = TOKEN_PRICES[selectedToken.token_symbol] || 1;
                  const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                  const tokenQuantityUsed = (amount * vaultTokenPrice) / tokenPrice;

                  return (
                    <p className="text-xs text-blue-600">
                      Using: {tokenQuantityUsed.toFixed(4)} {selectedToken.token_symbol}
                    </p>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
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
                  <SelectTrigger id="swap-target-vault" className="bg-background text-foreground">
                    <SelectValue placeholder="Choose a vault" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    {yodlBalances
                      .filter((vault) => {
                        const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                        const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                        if (!vaultData) return false;
                        const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                        return availableCapacity > 0;
                      })
                      .map((vault) => {
                        const vaultDisplayName = `${vault.curator_name}: ${vault.maker_token} Vault`;
                        const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                        if (!vaultData) return null;
                        
                        const vaultTokenPrice = TOKEN_PRICES[vault.maker_token] || 1;
                        const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                        const availableCapacityUsd = availableCapacity * vaultTokenPrice;
                        
                        return (
                          <SelectItem key={vault.id} value={vault.id} className="text-foreground">
                            <div className="flex flex-col">
                              <span>{vaultDisplayName}</span>
                              <span className="text-xs text-foreground">
                                Available capacity: {availableCapacity.toLocaleString()} {vault.maker_token} (${availableCapacityUsd.toLocaleString()})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Liquidity Source and Slippage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liquidity-source-swap">Liquidity Source</Label>
                  <Select value={liquiditySourceSwap} onValueChange={setLiquiditySourceSwap}>
                    <SelectTrigger id="liquidity-source-swap" className="bg-background text-foreground">
                      <SelectValue placeholder="Select liquidity source" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground">
                      <SelectItem value="uniswap" className="text-foreground">Uniswap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slippage-swap">Slippage (%)</Label>
                  <Input
                    id="slippage-swap"
                    type="number"
                    placeholder="0.5"
                    value={slippageSwap}
                    onChange={(e) => setSlippageSwap(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="swap-amount">
                  {swapTargetVault && (() => {
                    const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                    return targetVault ? `Amount to Restore (${targetVault.maker_token})` : 'Amount to Restore (USD)';
                  })() || 'Amount to Restore (USD)'}
                </Label>
                <div className="flex gap-2">
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
                    max={swapTargetVault && (() => {
                      const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                      if (!targetVault) return undefined;
                      
                      const vaultDisplayName = `${targetVault.curator_name}: ${targetVault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return undefined;
                      
                      const tokenPrice = TOKEN_PRICES[swapSelectedToken.token_symbol] || 1;
                      const vaultTokenPrice = TOKEN_PRICES[targetVault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const escrowBalanceInVaultToken = (swapSelectedToken.amount * tokenPrice) / vaultTokenPrice;
                      
                      return Math.min(escrowBalanceInVaultToken, availableCapacity);
                    })() || undefined}
                    className="bg-background text-foreground"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!swapTargetVault) return;
                      
                      const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                      if (!targetVault) return;
                      
                      const vaultDisplayName = `${targetVault.curator_name}: ${targetVault.maker_token} Vault`;
                      const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                      if (!vaultData) return;
                      
                      const tokenPrice = TOKEN_PRICES[swapSelectedToken.token_symbol] || 1;
                      const vaultTokenPrice = TOKEN_PRICES[targetVault.maker_token] || 1;
                      const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                      const escrowBalanceInVaultToken = (swapSelectedToken.amount * tokenPrice) / vaultTokenPrice;
                      
                      const maxAmount = Math.min(escrowBalanceInVaultToken, availableCapacity);
                      setSwapAmount(maxAmount.toFixed(6));
                    }}
                  >
                    Max
                  </Button>
                </div>
                
                {/* Max Amount Display */}
                {swapTargetVault && (() => {
                  const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                  if (!targetVault) return null;
                  
                  const vaultDisplayName = `${targetVault.curator_name}: ${targetVault.maker_token} Vault`;
                  const vaultData = vaults.find(v => v.vault_name === vaultDisplayName);
                  if (!vaultData) return null;
                  
                  const tokenPrice = TOKEN_PRICES[swapSelectedToken.token_symbol] || 1;
                  const vaultTokenPrice = TOKEN_PRICES[targetVault.maker_token] || 1;
                  const availableCapacity = vaultData.total_pre_slashed - vaultData.orchestrator_balance;
                  const escrowBalanceInVaultToken = (swapSelectedToken.amount * tokenPrice) / vaultTokenPrice;
                  
                  const maxAmount = Math.min(escrowBalanceInVaultToken, availableCapacity);
                  
                  return (
                    <p className="text-xs text-muted-foreground">
                      Max: {maxAmount.toLocaleString()} {targetVault.maker_token}
                    </p>
                  );
                })()}
                
                {/* Unlisted Token Usage Display */}
                {swapTargetVault && swapAmount && (() => {
                  const amount = parseFloat(swapAmount);
                  if (isNaN(amount) || amount <= 0) return null;

                  const targetVault = yodlBalances.find(v => v.id === swapTargetVault);
                  if (!targetVault) return null;

                  const tokenPrice = TOKEN_PRICES[swapSelectedToken.token_symbol] || 1;
                  const vaultTokenPrice = TOKEN_PRICES[targetVault.maker_token] || 1;
                  const tokenQuantityUsed = (amount * vaultTokenPrice) / tokenPrice;

                  return (
                    <p className="text-xs text-blue-600">
                      Using: {tokenQuantityUsed.toFixed(4)} {swapSelectedToken.token_symbol}
                    </p>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleSwapSubmit}>
              Confirm Swap & Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}