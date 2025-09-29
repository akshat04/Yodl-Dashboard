import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

const mockData = [
  { 
    operator: "Operator A", 
    claimed: 25000, 
    lost: 3000, 
    total: 28000,
    annotation: "High success rate"
  },
  { 
    operator: "Operator B", 
    claimed: 18000, 
    lost: 12000, 
    total: 30000,
    annotation: "Needs improvement"
  },
  { 
    operator: "Operator C", 
    claimed: 32000, 
    lost: 2000, 
    total: 34000,
    annotation: "Excellent performance"
  },
  { 
    operator: "Operator D", 
    claimed: 15000, 
    lost: 18000, 
    total: 33000,
    annotation: "High risk"
  },
  { 
    operator: "Operator E", 
    claimed: 28000, 
    lost: 5000, 
    total: 33000,
    annotation: "Good performance"
  },
];

export function ChallengeAmountClaimedChart() {
  const chartConfig = {
    claimed: { label: "Amount Claimed", color: "hsl(var(--primary))" },
    lost: { label: "Amount Lost", color: "hsl(var(--destructive))" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Challenge Amount: Claimed vs Lost</CardTitle>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-medium">Amount Claimed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-medium">Amount Lost</span>
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
              <Bar dataKey="claimed" fill="var(--color-claimed)" />
              <Bar dataKey="lost" fill="var(--color-lost)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.map((item) => {
              const successRate = (item.claimed / item.total) * 100;
              const badgeVariant = successRate >= 80 ? "default" : successRate >= 60 ? "secondary" : "destructive";
              
              return (
                <div key={item.operator} className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{item.operator}</div>
                    <Badge variant={badgeVariant}>
                      {successRate.toFixed(1)}% Success
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Claimed:</span>
                      <span className="font-medium text-primary">
                        ${item.claimed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lost:</span>
                      <span className="font-medium text-destructive">
                        ${item.lost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-2">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">
                        ${item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {item.annotation && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      {item.annotation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}