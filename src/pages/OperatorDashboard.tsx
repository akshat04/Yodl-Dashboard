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
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {hasRole('curator') ? 'CURATOR DASHBOARD' : 'OPERATOR DASHBOARD'}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
              <Badge variant={hasRole('curator') ? 'default' : 'secondary'}>
                {hasRole('curator') ? 'Curator' : 'Operator'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/historical')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Historical Data
            </Button>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Operator Widgets - Only visible to operators */}
          {!hasRole('curator') && (
            <div>
              <WidgetCarousel slides={operatorSlides} />
            </div>
          )}
          
          {/* Curator Widgets - Only visible to curators */}
          {hasRole('curator') && (
            <div>
              <WidgetCarousel slides={curatorSlides} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}