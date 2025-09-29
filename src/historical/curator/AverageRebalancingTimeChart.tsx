import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";

const mockData = [
  { 
    month: "Jan", 
    avgTime: 4.2, 
    delegationCapital: 850000,
    correlation: 0.85,
    impactScore: "High"
  },
  { 
    month: "Feb", 
    avgTime: 3.8, 
    delegationCapital: 920000,
    correlation: 0.78,
    impactScore: "High"
  },
  { 
    month: "Mar", 
    avgTime: 5.1, 
    delegationCapital: 780000,
    correlation: -0.65,
    impactScore: "Negative"
  },
  { 
    month: "Apr", 
    avgTime: 3.5, 
    delegationCapital: 1050000,
    correlation: 0.92,
    impactScore: "Very High"
  },
  { 
    month: "May", 
    avgTime: 4.0, 
    delegationCapital: 980000,
    correlation: 0.71,
    impactScore: "High"
  },
  { 
    month: "Jun", 
    avgTime: 2.9, 
    delegationCapital: 1180000,
    correlation: 0.88,
    impactScore: "Very High"
  },
];

export function AverageRebalancingTimeChart() {
  const chartConfig = {
    avgTime: { label: "Avg Time (hours)", color: "hsl(var(--primary))" },
    delegationCapital: { label: "Delegation Capital", color: "hsl(var(--secondary))" },
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.8) return "text-primary";
    if (correlation > 0.5) return "text-secondary";
    if (correlation > 0) return "text-accent";
    return "text-destructive";
  };

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case "Very High": return "default";
      case "High": return "secondary";
      case "Negative": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Time Between Rebalancing</CardTitle>
        <div className="text-sm text-muted-foreground">
          Shows correlation between rebalancing frequency and delegation capital impact
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={mockData}>
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                yAxisId="right"
                dataKey="delegationCapital" 
                fill="var(--color-delegationCapital)"
                opacity={0.3}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgTime" 
                stroke="var(--color-avgTime)" 
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Trend Correlation Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.map((item) => (
              <div key={item.month} className="p-4 rounded-lg bg-muted">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{item.month}</div>
                  <Badge variant={getImpactBadgeVariant(item.impactScore)}>
                    {item.impactScore}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="font-medium">{item.avgTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital:</span>
                    <span className="font-medium">
                      ${(item.delegationCapital / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Correlation:</span>
                    <span className={`font-medium ${getCorrelationColor(item.correlation)}`}>
                      {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h5 className="font-medium mb-2">Key Insights</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Faster rebalancing (2.9-3.8h) correlates with higher delegation capital</div>
              <div>• Slower response times (5.1h) show negative impact on capital efficiency</div>
              <div>• Optimal rebalancing time appears to be under 4 hours for maximum capital retention</div>
              <div>• Strong positive correlation (0.85-0.92) observed in high-performance months</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}