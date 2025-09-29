import { OperatorStatusWidget } from "@/components/widgets/operator/OperatorStatusWidget";
import { DelegationWidget } from "@/components/widgets/operator/DelegationWidget";
import { PreSlashingWidget } from "@/components/widgets/operator/PreSlashingWidget";
import { UnclaimedFeesWidget } from "@/components/widgets/operator/UnclaimedFeesWidget";
import { CountdownTimerWidget } from "@/components/widgets/operator/CountdownTimerWidget";
import { YodlStakedBalanceWidget } from "@/components/widgets/operator/YodlStakedBalanceWidget";
import { YodlPriceTickerWidget } from "@/components/widgets/operator/YodlPriceTickerWidget";
import { QuoteLimitWidget } from "@/components/widgets/operator/QuoteLimitWidget";
import { QuoteLimitGaugeWidget } from "@/components/widgets/operator/QuoteLimitGaugeWidget";
import { QuoteLimitUsageWidget } from "@/components/widgets/operator/QuoteLimitUsageWidget";
import { ChallengeAmountWidget } from "@/components/widgets/operator/ChallengeAmountWidget";
import { VaultRebalanceWidget } from "@/components/widgets/operator/VaultRebalanceWidget";
import { PreSlashingUtilizationWidget } from "@/components/widgets/operator/PreSlashingUtilizationWidget";
import { OrchestratorBalancesWidget } from "@/components/widgets/operator/OrchestratorBalancesWidget";
import { VaultRiskWidget } from "@/components/widgets/operator/VaultRiskWidget";
import { EscrowTransactionsWidget } from "@/components/widgets/operator/EscrowTransactionsWidget";
import { FallbackLiabilityWidget } from "@/components/widgets/operator/FallbackLiabilityWidget";
import { LiquidationHealthWidget } from "@/components/widgets/curator/LiquidationHealthWidget";
import { ActiveRebalancingTimersWidget } from "@/components/widgets/curator/ActiveRebalancingTimersWidget";
import { TimedOutRebalanceRequestsWidget } from "@/components/widgets/curator/TimedOutRebalanceRequestsWidget";
import { CuratorUnclaimedFeesWidget } from "@/components/widgets/curator/CuratorUnclaimedFeesWidget";
import { TotalDelegationChartWidget } from "@/components/widgets/curator/TotalDelegationChartWidget";
import { OutstandingRebalanceBarWidget } from "@/components/widgets/curator/OutstandingRebalanceBarWidget";
import { PreSlashedUtilizedWidget } from "@/components/widgets/curator/PreSlashedUtilizedWidget";
import { PreSlashedRemainingWidget } from "@/components/widgets/curator/PreSlashedRemainingWidget";
import { WidgetCarousel } from "@/components/WidgetCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function OperatorDashboard() {
  const { profile, signOut, hasRole } = useAuth();
  const navigate = useNavigate();

  // Common operator widgets
  const operatorSlides = [
    {
      title: "Core Operations & Status",
      widgets: [
        <OperatorStatusWidget key="operator-status" />,
        <DelegationWidget key="delegation" />,
        <PreSlashingWidget key="pre-slashing" />,
        <UnclaimedFeesWidget key="unclaimed-fees" />,
        <CountdownTimerWidget key="countdown-timer" />
      ]
    },
    {
      title: "YODL & Quote Management",
      widgets: [
        <YodlStakedBalanceWidget key="yodl-balance" />,
        <YodlPriceTickerWidget key="yodl-price" />,
        <QuoteLimitWidget key="quote-limit" />,
        <QuoteLimitGaugeWidget key="quote-gauge" />
      ]
    },
    {
      title: "Usage Analytics & Challenges",
      widgets: [
        <QuoteLimitUsageWidget key="quote-usage" />,
        <ChallengeAmountWidget key="challenge-amount" />,
        <VaultRebalanceWidget key="vault-rebalance" />,
        <PreSlashingUtilizationWidget key="pre-slashing-util" />
      ]
    },
    {
      title: "Risk Management & Transactions",
      widgets: [
        <OrchestratorBalancesWidget key="orchestrator-balances" />,
        <VaultRiskWidget key="vault-risk" />,
        <EscrowTransactionsWidget key="escrow-transactions" />,
        <FallbackLiabilityWidget key="fallback-liability" />
      ]
    }
  ];

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
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
              <div className="text-primary-foreground">
                <Badge variant="secondary" className="mb-4 bg-success/20 text-success-foreground border-success/30">
                  {hasRole('curator') ? 'Curator Portal' : 'Operator Portal'}
                </Badge>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {hasRole('curator') ? 'CURATOR DASHBOARD' : 'OPERATOR DASHBOARD'}
                </h1>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="text-primary-foreground/80 text-base md:text-lg">Welcome back, {profile?.full_name}</p>
                  <Badge variant={hasRole('curator') ? 'default' : 'secondary'} className="bg-success/20 text-success-foreground border-success/30 w-fit">
                    {hasRole('curator') ? 'Curator' : 'Operator'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              {/* Operator Widgets - Only visible to operators */}
              {!hasRole('curator') && (
                <div className="space-y-8">
                  {operatorSlides.map((slide, index) => (
                    <div key={index} className="border-2 border-accent/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-xl">
                      <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-4 md:mb-6">{slide.title}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {slide.widgets}
                      </div>
                    </div>
                  ))}
                </div>
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
      <footer className="border-t border-border/20 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 Yodl. Yield Orchestration & Distribution Layer.</p>
        </div>
      </footer>
    </div>
  );
}