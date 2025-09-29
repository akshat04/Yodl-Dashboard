import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/SearchBar";

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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-95"></div>
        <div className="relative container mx-auto px-4 md:px-6 py-8 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-primary-foreground">
                <div>
                  <Badge variant="secondary" className="mb-2 bg-success/20 text-success-foreground border-success/30">
                    {hasRole('curator') ? 'Curator Portal' : 'Operator Portal'}
                  </Badge>
                  <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
                    {hasRole('curator') ? 'CURATOR' : 'OPERATOR'} HISTORICAL DATA
                  </h1>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <p className="text-primary-foreground/80 text-sm md:text-lg">Historical analytics for {profile?.full_name}</p>
                    <Badge variant={hasRole('curator') ? 'default' : 'secondary'} className="w-fit bg-success/20 text-success-foreground border-success/30">
                      {hasRole('curator') ? 'Curator' : 'Operator'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 w-fit border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={signOut} 
                  className="flex items-center gap-2 border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
                >
                  Sign Out
                </Button>
              </div>
            </div>

            <Tabs defaultValue={hasRole('curator') ? "analytics" : "performance"} className="w-full">
              <div className="mb-6">
                <TabsList className="grid w-full h-auto p-1 bg-card/50 backdrop-blur-sm border border-border/20">
                  {hasRole('curator') ? (
                    <>
                      <TabsTrigger 
                        value="overview" 
                        className="px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-success/20 data-[state=active]:text-success-foreground"
                      >
                        <span className="hidden sm:inline">Overview</span>
                        <span className="sm:hidden">Info</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="analytics" 
                        className="px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-success/20 data-[state=active]:text-success-foreground"
                      >
                        Analytics
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reports" 
                        className="px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-success/20 data-[state=active]:text-success-foreground"
                      >
                        Reports
                      </TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger 
                        value="performance" 
                        className="px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground"
                      >
                        <span className="hidden md:inline">Performance & Earnings</span>
                        <span className="md:hidden">Performance</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="trading" 
                        className="px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground"
                      >
                        <span className="hidden md:inline">Quotes, Trades & Rebalancing</span>
                        <span className="md:hidden">Trading</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="risks" 
                        className="px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground"
                      >
                        <span className="hidden md:inline">Risks, Costs & Challenges</span>
                        <span className="md:hidden">Risks</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="reports" 
                        className="px-2 py-2 text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent-foreground"
                      >
                        Reports
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>

              {hasRole('curator') && (
                <TabsContent value="overview" className="space-y-6">
                  <div className="border-2 border-success/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6">
                    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                      {sections.map((section, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow border-success/20">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-success/20 rounded-lg text-success">
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
                            <Button variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/10">
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Performance & Earnings Tab for Operators */}
              <TabsContent value="performance" className="space-y-6">
                <div className="border-2 border-accent/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-card-foreground">Performance & Earnings</h2>
                    <SearchBar placeholder="Search performance charts..." />
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                      <ProfitEarnedWidget />
                      <FeeAPRGaugeWidget />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FeeTransferred1InchWidget />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FeeEarnedPerBatchChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <OperatorCumulativeFeeEarnedChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FeeClaimedChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <OperatorFeeBreakupByTokenChart />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Quotes, Trades & Rebalancing Tab for Operators */}
              <TabsContent value="trading" className="space-y-6">
                <div className="border-2 border-accent/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-card-foreground">Quotes, Trades & Rebalancing</h2>
                    <SearchBar placeholder="Search trading charts..." />
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid gap-4 md:gap-6">
                      <QuotesSubmittedChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <QuotesAcceptedChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <QuoteAcceptanceRateChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <QuoteAcceptancePerBatchChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <CoWCloseTimeHistogram />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <CoWCloseTimePerBatchChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <CoWPercentagePerBatchChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FallbackTradesChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FallbackSwapPercentageChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <RebalancingTimeChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <YodlConsumedChart />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Risks, Costs & Challenges Tab for Operators */}
              <TabsContent value="risks" className="space-y-6">
                <div className="border-2 border-accent/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-card-foreground">Risks, Costs & Challenges</h2>
                    <SearchBar placeholder="Search risk charts..." />
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    <div className="grid gap-4 md:gap-6">
                      <SlippagePaidChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <GasPaidChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <DEXFeePaidChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <FallbackTypesChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <ChallengesRaisedOperatorChart />
                    </div>
                    
                    <div className="grid gap-4 md:gap-6">
                      <ChallengeAmountClaimedOperatorChart />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {hasRole('curator') && (
                  <div className="border-2 border-success/30 bg-card/95 backdrop-blur-sm rounded-lg p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-4">
                      <h2 className="text-xl md:text-2xl font-bold text-card-foreground">Analytics</h2>
                      <SearchBar placeholder="Search analytics..." />
                    </div>
                    <div className="space-y-6 md:space-y-8">
                      <div className="grid gap-4 md:gap-6">
                        <AmountDelegatedPerVaultChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <VaultsDelegatedChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <CumulativeFeeEarnedChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <FeeClaimedByCuratorChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <FeeBreakupByTokenChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <DelegationPerformanceChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <ChallengesRaisedChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <ChallengeAmountClaimedChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <FallbackImpactChart />
                      </div>
                      
                      <div className="grid gap-4 md:gap-6">
                        <AverageRebalancingTimeChart />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <div className="border-2 border-border/30 bg-card/95 backdrop-blur-sm rounded-lg">
                  <Card className="border-0">
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
                </div>
              </TabsContent>
            </Tabs>
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