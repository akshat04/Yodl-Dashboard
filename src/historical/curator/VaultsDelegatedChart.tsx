import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const mockData = [
  { type: "Yield Vaults", count: 8, value: 45 },
  { type: "Liquidity Vaults", count: 6, value: 30 },
  { type: "Strategy Vaults", count: 4, value: 25 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
];

export function VaultsDelegatedChart() {
  const totalVaults = mockData.reduce((sum, item) => sum + item.count, 0);

  const chartConfig = {
    "Yield Vaults": { label: "Yield Vaults", color: COLORS[0] },
    "Liquidity Vaults": { label: "Liquidity Vaults", color: COLORS[1] },
    "Strategy Vaults": { label: "Strategy Vaults", color: COLORS[2] },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Vaults Delegated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{totalVaults}</div>
            <p className="text-muted-foreground">Active Vault Delegations</p>
          </div>
          <div className="mt-6 space-y-2">
            {mockData.map((item, index) => (
              <div key={item.type} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm">{item.type}</span>
                </div>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delegation Distribution by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ type, value }) => `${type}: ${value}%`}
                >
                  {mockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}