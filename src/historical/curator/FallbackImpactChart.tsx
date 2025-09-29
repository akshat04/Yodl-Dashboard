import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

const mockData = [
  { 
    operator: "Operator A", 
    positive: 45000, 
    negative: -12000,
    net: 33000,
    impactDescription: "Strong positive impact from yield strategies"
  },
  { 
    operator: "Operator B", 
    positive: 32000, 
    negative: -28000,
    net: 4000,
    impactDescription: "Minimal net impact, balanced performance"
  },
  { 
    operator: "Operator C", 
    positive: 58000, 
    negative: -8000,
    net: 50000,
    impactDescription: "Excellent fallback management"
  },
  { 
    operator: "Operator D", 
    positive: 22000, 
    negative: -35000,
    net: -13000,
    impactDescription: "Needs improvement in risk management"
  },
  { 
    operator: "Operator E", 
    positive: 41000, 
    negative: -18000,
    net: 23000,
    impactDescription: "Good overall performance"
  },
];

export function FallbackImpactChart() {
  const chartConfig = {
    positive: { label: "Positive Fallbacks", color: "hsl(var(--primary))" },
    negative: { label: "Negative Fallbacks", color: "hsl(var(--destructive))" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positive vs Negative Fallbacks Impacting Delegated Capital</CardTitle>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-medium">Positive Impact</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-medium">Negative Impact</span>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <XAxis dataKey="operator" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="positive" fill="var(--color-positive)" />
              <Bar dataKey="negative" fill="var(--color-negative)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Impact Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.map((item) => {
              const isPositiveNet = item.net > 0;
              
              return (
                <div key={item.operator} className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium">{item.operator}</div>
                    <div className={`flex items-center gap-1 font-bold ${
                      isPositiveNet ? 'text-primary' : 'text-destructive'
                    }`}>
                      {isPositiveNet ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      ${Math.abs(item.net).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Positive Impact:</span>
                      <span className="font-medium text-primary">
                        +${item.positive.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Negative Impact:</span>
                      <span className="font-medium text-destructive">
                        ${item.negative.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {item.impactDescription}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h5 className="font-medium mb-2">Summary Insights</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Total Positive Impact: ${mockData.reduce((sum, item) => sum + item.positive, 0).toLocaleString()}</div>
              <div>• Total Negative Impact: ${Math.abs(mockData.reduce((sum, item) => sum + item.negative, 0)).toLocaleString()}</div>
              <div>• Net Impact: ${mockData.reduce((sum, item) => sum + item.net, 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}