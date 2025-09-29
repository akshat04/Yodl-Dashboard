import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const mockData = [
  { month: "Jan", curatorA: 12000, curatorB: 8500, curatorC: 6200 },
  { month: "Feb", curatorA: 15000, curatorB: 9800, curatorC: 7500 },
  { month: "Mar", curatorA: 18500, curatorB: 11200, curatorC: 8800 },
  { month: "Apr", curatorA: 22000, curatorB: 13500, curatorC: 10200 },
  { month: "May", curatorA: 25500, curatorB: 15800, curatorC: 11800 },
  { month: "Jun", curatorA: 29000, curatorB: 18200, curatorC: 13500 },
];

export function FeeClaimedByCuratorChart() {
  const chartConfig = {
    curatorA: { label: "Curator Alpha", color: "hsl(var(--primary))" },
    curatorB: { label: "Curator Beta", color: "hsl(var(--secondary))" },
    curatorC: { label: "Curator Gamma", color: "hsl(var(--accent))" },
  };

  const totalFees = mockData[mockData.length - 1];
  const grandTotal = totalFees.curatorA + totalFees.curatorB + totalFees.curatorC;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Claimed by Curator (USD)</CardTitle>
        <div className="text-2xl font-bold text-primary">
          ${grandTotal.toLocaleString()} Total
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm font-medium">{config.label}</span>
              <span className="text-sm text-muted-foreground">
                ${totalFees[key as keyof typeof totalFees].toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="curatorA" 
                stroke="var(--color-curatorA)" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="curatorB" 
                stroke="var(--color-curatorB)" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="curatorC" 
                stroke="var(--color-curatorC)" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}