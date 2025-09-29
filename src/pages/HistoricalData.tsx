import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Curator Historical Charts
import { AmountDelegatedPerVaultChart } from "@/historical/curator/AmountDelegatedPerVaultChart";
import { VaultsDelegatedChart } from "@/historical/curator/VaultsDelegatedChart";
import { CumulativeFeeEarnedChart } from "@/historical/curator/CumulativeFeeEarnedChart";
import { FeeClaimedByCuratorChart } from "@/historical/curator/FeeClaimedByCuratorChart";
import { FeeBreakupByTokenChart } from "@/historical/curator/FeeBreakupByTokenChart";
import { DelegationPerformanceChart } from "@/historical/curator/DelegationPerformanceChart";
import { ChallengesRaisedChart } from "@/historical/curator/ChallengesRaisedChart";
import { ChallengeAmountClaimedChart } from "@/historical/curator/ChallengeAmountClaimedChart";
import { FallbackImpactChart } from "@/historical/curator/FallbackImpactChart";
import { AverageRebalancingTimeChart } from "@/historical/curator/AverageRebalancingTimeChart";

// Operator Historical Charts - Performance & Earnings
import { ProfitEarnedWidget } from "@/historical/operator/ProfitEarnedWidget";
import { FeeAPRGaugeWidget } from "@/historical/operator/FeeAPRGaugeWidget";
import { FeeTransferred1InchWidget } from "@/historical/operator/FeeTransferred1InchWidget";
import { FeeEarnedPerBatchChart } from "@/historical/operator/FeeEarnedPerBatchChart";
import { CumulativeFeeEarnedChart as OperatorCumulativeFeeEarnedChart } from "@/historical/operator/CumulativeFeeEarnedChart";
import { FeeClaimedChart } from "@/historical/operator/FeeClaimedChart";
import { FeeBreakupByTokenChart as OperatorFeeBreakupByTokenChart } from "@/historical/operator/FeeBreakupByTokenChart";

// Operator Historical Charts - Quotes, Trades & Rebalancing
import { QuotesSubmittedChart } from "@/historical/operator/QuotesSubmittedChart";
import { QuotesAcceptedChart } from "@/historical/operator/QuotesAcceptedChart";
import { QuoteAcceptanceRateChart } from "@/historical/operator/QuoteAcceptanceRateChart";
import { QuoteAcceptancePerBatchChart } from "@/historical/operator/QuoteAcceptancePerBatchChart";
import { CoWCloseTimeHistogram } from "@/historical/operator/CoWCloseTimeHistogram";
import { CoWCloseTimePerBatchChart } from "@/historical/operator/CoWCloseTimePerBatchChart";
import { CoWPercentagePerBatchChart } from "@/historical/operator/CoWPercentagePerBatchChart";
import { FallbackTradesChart } from "@/historical/operator/FallbackTradesChart";
import { FallbackSwapPercentageChart } from "@/historical/operator/FallbackSwapPercentageChart";
import { RebalancingTimeChart } from "@/historical/operator/RebalancingTimeChart";
import { YodlConsumedChart } from "@/historical/operator/YodlConsumedChart";

// Operator Historical Charts - Risks, Costs & Challenges
import { SlippagePaidChart } from "@/historical/operator/SlippagePaidChart";
import { GasPaidChart } from "@/historical/operator/GasPaidChart";
import { DEXFeePaidChart } from "@/historical/operator/DEXFeePaidChart";
import { FallbackTypesChart } from "@/historical/operator/FallbackTypesChart";
import { ChallengesRaisedOperatorChart } from "@/historical/operator/ChallengesRaisedOperatorChart";
import { ChallengeAmountClaimedOperatorChart } from "@/historical/operator/ChallengeAmountClaimedOperatorChart";

export default function HistoricalData() {
  const { profile, hasRole, signOut } = useAuth();
  const navigate = useNavigate();

  const operatorHistoricalSections = [
    {
      title: "Performance & Earnings",
      description: "Track profit, fees, and APR performance over time",
      icon: <TrendingUp className="h-5 w-5" />,
      content: "Historical data showing profit earned, fee APR, transfers to 1Inch, and earnings breakdown by token and batch."
    },
    {
      title: "Quotes, Trades & Rebalancing Activity", 
      description: "Monitor quote acceptance rates and trading performance",
      icon: <BarChart3 className="h-5 w-5" />,
      content: "Complete history of quotes submitted/accepted, CoW closing times, fallback trades, and rebalancing event timelines."
    },
    {
      title: "Risks, Costs & Challenges",
      description: "Analyze slippage, gas costs, and challenge events",
      icon: <PieChart className="h-5 w-5" />,
      content: "Historical record of slippage paid, gas costs, DEX fees, fallback types, and challenges raised across time periods."
    }
  ];

  const curatorHistoricalSections = [
    {
      title: "Liquidation Events History",
      description: "Complete record of all liquidation activities",
      icon: <TrendingUp className="h-5 w-5" />,
      content: "Historical data of liquidation events, health scores, and operator compliance records."
    },
    {
      title: "Vault Rebalancing History",
      description: "Track all rebalancing operations and timelines",
      icon: <BarChart3 className="h-5 w-5" />,
      content: "Complete history of vault rebalancing requests, timeouts, and operator compliance."
    },
    {
      title: "Pre-Slashed Vault Analytics",
      description: "Historical trends in delegated vault pre-slashing",
      icon: <PieChart className="h-5 w-5" />,
      content: "Long-term analytics of pre-slashed amounts in delegated vaults, utilization patterns, and remaining quotas."
    },
    {
      title: "System-wide Fee Analytics",
      description: "Comprehensive fee collection and distribution history",
      icon: <Calendar className="h-5 w-5" />,
      content: "Historical analysis of fees collected across the system, distribution patterns, and unclaimed amounts."
    }
  ];

  const sections = hasRole('curator') ? curatorHistoricalSections : operatorHistoricalSections;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {hasRole('curator') ? 'CURATOR' : 'OPERATOR'} HISTORICAL DATA
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">Historical analytics for {profile?.full_name}</p>
                <Badge variant={hasRole('curator') ? 'default' : 'secondary'}>
                  {hasRole('curator') ? 'Curator' : 'Operator'}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue={hasRole('curator') ? "analytics" : "performance"} className="w-full">
          <TabsList className={`grid w-full ${hasRole('curator') ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {hasRole('curator') ? (
              <>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="performance">Performance & Earnings</TabsTrigger>
                <TabsTrigger value="trading">Quotes, Trades & Rebalancing</TabsTrigger>
                <TabsTrigger value="risks">Risks, Costs & Challenges</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </>
            )}
          </TabsList>

          {hasRole('curator') && (
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {sections.map((section, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {section.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {section.content}
                      </p>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Performance & Earnings Tab for Operators */}
          <TabsContent value="performance" className="space-y-6">
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <ProfitEarnedWidget />
                <FeeAPRGaugeWidget />
              </div>
              
              <div className="grid gap-6">
                <FeeTransferred1InchWidget />
              </div>
              
              <div className="grid gap-6">
                <FeeEarnedPerBatchChart />
              </div>
              
              <div className="grid gap-6">
                <OperatorCumulativeFeeEarnedChart />
              </div>
              
              <div className="grid gap-6">
                <FeeClaimedChart />
              </div>
              
              <div className="grid gap-6">
                <OperatorFeeBreakupByTokenChart />
              </div>
            </div>
          </TabsContent>

          {/* Quotes, Trades & Rebalancing Tab for Operators */}
          <TabsContent value="trading" className="space-y-6">
            <div className="space-y-8">
              <div className="grid gap-6">
                <QuotesSubmittedChart />
              </div>
              
              <div className="grid gap-6">
                <QuotesAcceptedChart />
              </div>
              
              <div className="grid gap-6">
                <QuoteAcceptanceRateChart />
              </div>
              
              <div className="grid gap-6">
                <QuoteAcceptancePerBatchChart />
              </div>
              
              <div className="grid gap-6">
                <CoWCloseTimeHistogram />
              </div>
              
              <div className="grid gap-6">
                <CoWCloseTimePerBatchChart />
              </div>
              
              <div className="grid gap-6">
                <CoWPercentagePerBatchChart />
              </div>
              
              <div className="grid gap-6">
                <FallbackTradesChart />
              </div>
              
              <div className="grid gap-6">
                <FallbackSwapPercentageChart />
              </div>
              
              <div className="grid gap-6">
                <RebalancingTimeChart />
              </div>
              
              <div className="grid gap-6">
                <YodlConsumedChart />
              </div>
            </div>
          </TabsContent>

          {/* Risks, Costs & Challenges Tab for Operators */}
          <TabsContent value="risks" className="space-y-6">
            <div className="space-y-8">
              <div className="grid gap-6">
                <SlippagePaidChart />
              </div>
              
              <div className="grid gap-6">
                <GasPaidChart />
              </div>
              
              <div className="grid gap-6">
                <DEXFeePaidChart />
              </div>
              
              <div className="grid gap-6">
                <FallbackTypesChart />
              </div>
              
              <div className="grid gap-6">
                <ChallengesRaisedOperatorChart />
              </div>
              
              <div className="grid gap-6">
                <ChallengeAmountClaimedOperatorChart />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {hasRole('curator') && (
              <div className="space-y-8">
                <div className="grid gap-6">
                  <AmountDelegatedPerVaultChart />
                </div>
                
                <div className="grid gap-6">
                  <VaultsDelegatedChart />
                </div>
                
                <div className="grid gap-6">
                  <CumulativeFeeEarnedChart />
                </div>
                
                <div className="grid gap-6">
                  <FeeClaimedByCuratorChart />
                </div>
                
                <div className="grid gap-6">
                  <FeeBreakupByTokenChart />
                </div>
                
                <div className="grid gap-6">
                  <DelegationPerformanceChart />
                </div>
                
                <div className="grid gap-6">
                  <ChallengesRaisedChart />
                </div>
                
                <div className="grid gap-6">
                  <ChallengeAmountClaimedChart />
                </div>
                
                <div className="grid gap-6">
                  <FallbackImpactChart />
                </div>
                
                <div className="grid gap-6">
                  <AverageRebalancingTimeChart />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historical Reports</CardTitle>
                <CardDescription>
                  Generate and download detailed historical reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Report generation interface will be displayed here</p>
                  <p className="text-sm mt-2">Including PDF exports, CSV downloads, and scheduled reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}