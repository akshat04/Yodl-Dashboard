import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

const mockData = [
  { date: "Jan 15", amount: 2500, event: "Challenge #001", type: "resolved" },
  { date: "Feb 03", amount: 1800, event: "Challenge #002", type: "resolved" },
  { date: "Feb 28", amount: 4200, event: "Challenge #003", type: "major" },
  { date: "Mar 12", amount: 1200, event: "Challenge #004", type: "resolved" },
  { date: "Apr 05", amount: 3600, event: "Challenge #005", type: "major" },
  { date: "Apr 22", amount: 900, event: "Challenge #006", type: "resolved" },
  { date: "May 18", amount: 5100, event: "Challenge #007", type: "critical" },
  { date: "Jun 08", amount: 2200, event: "Challenge #008", type: "resolved" },
];

const chartConfig = {
  amount: {
    label: "Challenge Amount ($)",
    color: "hsl(var(--primary))",
  },
};

const getEventColor = (type: string) => {
  switch (type) {
    case "critical": return "hsl(var(--destructive))";
    case "major": return "hsl(var(--warning))";
    default: return "hsl(var(--primary))";
  }
};

export function ChallengeAmountClaimedOperatorChart() {
  const totalClaimed = mockData.reduce((sum, item) => sum + item.amount, 0);
  const criticalEvents = mockData.filter(item => item.type === "critical").length;
  const majorEvents = mockData.filter(item => item.type === "major").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Challenge Amount Claimed</CardTitle>
            <CardDescription>With event annotations and trends</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${totalClaimed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Claimed</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="text-primary">
            {mockData.length} Total Events
          </Badge>
          <Badge variant="outline" className="text-warning">
            {majorEvents} Major
          </Badge>
          <Badge variant="outline" className="text-destructive">
            {criticalEvents} Critical
          </Badge>
        </div>

        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
              <ReferenceLine y={3000} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="var(--color-amount)"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={6} 
                      fill={getEventColor(payload.type)}
                      stroke="white"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Reference line at $3,000 indicates significant challenge threshold</p>
        </div>
      </CardContent>
    </Card>
  );
}