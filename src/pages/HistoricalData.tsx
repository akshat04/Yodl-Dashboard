import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HistoricalData() {
  const { profile, hasRole, signOut } = useAuth();
  const navigate = useNavigate();

  const operatorHistoricalSections = [
    {
      title: "Quote Limit Usage History",
      description: "Track your quota utilization patterns over time",
      icon: <TrendingUp className="h-5 w-5" />,
      content: "Historical data showing how your quote limits have been utilized across different time periods."
    },
    {
      title: "Delegation History",
      description: "View changes in delegated amounts and token distributions",
      icon: <BarChart3 className="h-5 w-5" />,
      content: "Complete history of delegation changes, including token amounts and USD values over time."
    },
    {
      title: "Fee Collection History",
      description: "Track all claimed and unclaimed fees",
      icon: <PieChart className="h-5 w-5" />,
      content: "Historical record of fee collections, claims, and pending amounts across all time periods."
    },
    {
      title: "Pre-Slashing Events",
      description: "Historical record of pre-slashing activities",
      icon: <Calendar className="h-5 w-5" />,
      content: "Complete timeline of pre-slashing events, amounts, and their impact on your operations."
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

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

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Deep dive into historical patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced analytics charts and visualizations will be displayed here</p>
                  <p className="text-sm mt-2">Including time-series data, trend analysis, and comparative metrics</p>
                </div>
              </CardContent>
            </Card>
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