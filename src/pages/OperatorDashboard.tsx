import { useState, useEffect } from "react";
import { LiquidationHealthWidget } from "@/components/widgets/curator/LiquidationHealthWidget";
import { ActiveRebalancingTimersWidget } from "@/components/widgets/curator/ActiveRebalancingTimersWidget";
import { TimedOutRebalanceRequestsWidget } from "@/components/widgets/curator/TimedOutRebalanceRequestsWidget";
import { CuratorUnclaimedFeesWidget } from "@/components/widgets/curator/CuratorUnclaimedFeesWidget";
import { TotalDelegationChartWidget } from "@/components/widgets/curator/TotalDelegationChartWidget";
import { OutstandingRebalanceBarWidget } from "@/components/widgets/curator/OutstandingRebalanceBarWidget";
import { PreSlashedUtilizedWidget } from "@/components/widgets/curator/PreSlashedUtilizedWidget";
import { PreSlashedRemainingWidget } from "@/components/widgets/curator/PreSlashedRemainingWidget";
import { ReserveTab } from "@/components/dashboard/operator/ReserveTab";
import { RebalanceReplenishTab } from "@/components/dashboard/operator/RebalanceReplenishTab";
import { ClaimFeeTab } from "@/components/dashboard/operator/ClaimFeeTab";
import { ChallengeTab } from "@/components/dashboard/operator/ChallengeTab";
import { MoveFundToEscrowTab } from "@/components/dashboard/operator/MoveFundToEscrowTab";
import { LiquidationsTab } from "@/components/dashboard/operator/LiquidationsTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { LogOut, BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface OperatorStatus {
  status: string;
  name: string;
}

interface YodlPrice {
  price_usd: number;
  change_24h: number;
}

interface VaultTimer {
  vaultId: string;
  countdown: number;
  isActive: boolean;
}

interface UnclaimedFee {
  id: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  operator_id: string;
}

interface SharedVaultData {
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

export default function OperatorDashboard() {
  const { profile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [operatorStatus, setOperatorStatus] = useState<OperatorStatus | null>(null);
  const [yodlPrice, setYodlPrice] = useState<YodlPrice | null>(null);
  const [vaultTimers, setVaultTimers] = useState<VaultTimer[]>([]);
  const [unclaimedFees, setUnclaimedFees] = useState<UnclaimedFee[]>([]);
  const [sharedVaults, setSharedVaults] = useState<SharedVaultData[]>([]);
  const [escrowTokens, setEscrowTokens] = useState<EscrowToken[]>([]);

  useEffect(() => {
    if (!hasRole('curator')) {
      fetchOperatorStatus();
      fetchYodlPrice();
    }
  }, [hasRole]);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setVaultTimers(prev => prev.map(timer => ({
        ...timer,
        countdown: timer.countdown > 0 ? timer.countdown - 1 : 0
      })).filter(timer => timer.countdown > 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchOperatorStatus = async () => {
    try {
      const { data } = await supabase
        .from('operators')
        .select('status, name')
        .single();
      if (data) setOperatorStatus(data);
    } catch (error) {
      console.error('Error fetching operator status:', error);
    }
  };

  const fetchYodlPrice = async () => {
    try {
      const { data } = await supabase
        .from('yodl_price_data')
        .select('price_usd, change_24h')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setYodlPrice(data);
      } else {
        // Mock data for demo
        setYodlPrice({
          price_usd: Math.random() * 100 + 50,
          change_24h: (Math.random() * 10) - 5
        });
      }
    } catch (error) {
      console.error('Error fetching YODL price:', error);
      // Mock data for demo
      setYodlPrice({
        price_usd: Math.random() * 100 + 50,
        change_24h: (Math.random() * 10) - 5
      });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'de-listed': return 'destructive';
      case 'pending': return 'secondary';
      case 'blacklisted': return 'destructive';
      default: return 'outline';
    }
  };

  // Curator-specific widgets
  const curatorSlides = [
    {
      title: "Liquidation & Health Management",
      widgets: [
        <LiquidationHealthWidget key="liquidation-health" />,
        <ActiveRebalancingTimersWidget key="rebalancing-timers" />,
        <TimedOutRebalanceRequestsWidget key="timed-out-requests" />,
        <CuratorUnclaimedFeesWidget key="curator-unclaimed-fees" />
      ]
    },
    {
      title: "Delegation & Rebalance Analytics",
      widgets: [
        <TotalDelegationChartWidget key="delegation-chart" />,
        <OutstandingRebalanceBarWidget key="outstanding-rebalance" />,
        <PreSlashedUtilizedWidget key="pre-slashed-utilized" />,
        <PreSlashedRemainingWidget key="pre-slashed-remaining" />
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-95"></div>
        <div className="relative container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
              <div className="text-primary-foreground">
                <Badge variant="secondary" className="mb-4 bg-success/20 text-success-foreground border-success/30">
                  {hasRole('curator') ? 'Curator Portal' : 'Operator Portal'}
                </Badge>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {hasRole('curator') ? 'CURATOR DASHBOARD' : 'OPERATOR DASHBOARD'}
                </h1>
                <p className="text-primary-foreground/80 text-base md:text-lg">Welcome back, {profile?.full_name}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Operator Status and YODL Price - Top Right */}
                {!hasRole('curator') && (
                  <>
                    <Card className="p-3 bg-card/95 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-card-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge variant={getStatusVariant(operatorStatus?.status || 'active')}>
                            {operatorStatus?.status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                    {yodlPrice && (
                      <Card className="p-3 bg-card/95 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">YODL Price</p>
                            <p className="text-lg font-bold text-card-foreground">${yodlPrice.price_usd.toFixed(4)}</p>
                          </div>
                          <div className={`flex items-center gap-1 text-sm ${yodlPrice.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {yodlPrice.change_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {Math.abs(yodlPrice.change_24h).toFixed(2)}%
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/historical')}
                  className="flex items-center gap-2 border-foreground/20 text-foreground bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Historical Data</span>
                  <span className="sm:hidden">Historical</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={signOut} 
                  className="flex items-center gap-2 border-foreground/20 text-foreground bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Operator Tabs - Only visible to operators */}
              {!hasRole('curator') && (
                <Tabs defaultValue="rebalance" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="rebalance">Rebalance/Replenish</TabsTrigger>
                    <TabsTrigger value="reserve">Reserve</TabsTrigger>
                    <TabsTrigger value="movefund">Move Fund to Escrow</TabsTrigger>
                    <TabsTrigger value="challenge">Challenge</TabsTrigger>
                    <TabsTrigger value="liquidations">Liquidations</TabsTrigger>
                    <TabsTrigger value="claim">Claim Fee</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="rebalance" forceMount className="mt-6">
                    <RebalanceReplenishTab 
                      vaultTimers={vaultTimers}
                      setVaultTimers={setVaultTimers}
                      sharedVaults={sharedVaults}
                      onVaultsUpdate={setSharedVaults}
                      escrowTokens={escrowTokens}
                      onEscrowTokensUpdate={setEscrowTokens}
                    />
                  </TabsContent>
                  
                  <TabsContent value="reserve" forceMount className="mt-6">
                    <ReserveTab 
                      sharedVaults={sharedVaults}
                      onVaultsUpdate={setSharedVaults}
                      escrowTokens={escrowTokens}
                      onEscrowTokensUpdate={setEscrowTokens}
                    />
                  </TabsContent>
                  
                  <TabsContent value="movefund" className="mt-6">
                    <MoveFundToEscrowTab />
                  </TabsContent>
                  
                  <TabsContent value="challenge" className="mt-6">
                    <ChallengeTab />
                  </TabsContent>
                  
                  <TabsContent value="liquidations" className="mt-6">
                    <LiquidationsTab />
                  </TabsContent>
                  
                  <TabsContent value="claim" className="mt-6">
                    <ClaimFeeTab 
                      unclaimedFees={unclaimedFees}
                      setUnclaimedFees={setUnclaimedFees}
                    />
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Curator Widgets - Only visible to curators */}
              {hasRole('curator') && (
                <div className="space-y-8">
                  {curatorSlides.map((slide, index) => (
                    <div key={index} className="border-2 border-success/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6 hover:border-success/50 transition-all duration-300 hover:shadow-xl">
                      <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-4 md:mb-6">{slide.title}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                        {slide.widgets}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/20 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 Yodl. Yield Orchestration & Distribution Layer.</p>
        </div>
      </footer>
    </div>
  );
}