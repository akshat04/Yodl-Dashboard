import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const mockData = [
  { token: "ETH", share: 35, usdValue: 45200 },
  { token: "USDC", share: 28, usdValue: 36100 },
  { token: "USDT", share: 22, usdValue: 28400 },
  { token: "WBTC", share: 10, usdValue: 12900 },
  { token: "DAI", share: 5, usdValue: 6400 },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
  "hsl(var(--destructive))",
];

export function FeeBreakupByTokenChart() {
  const chartConfig = {
    ETH: { label: "ETH", color: COLORS[0] },
    USDC: { label: "USDC", color: COLORS[1] },
    USDT: { label: "USDT", color: COLORS[2] },
    WBTC: { label: "WBTC", color: COLORS[3] },
    DAI: { label: "DAI", color: COLORS[4] },
  };

  const totalUSD = mockData.reduce((sum, item) => sum + item.usdValue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Break-up by Token</CardTitle>
        <div className="text-2xl font-bold text-primary">
          ${totalUSD.toLocaleString()} Total
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={mockData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="share"
                    label={({ token, share }) => `${token}: ${share}%`}
                  >
                    {mockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Token Breakdown</h4>
            {mockData.map((item, index) => (
              <div key={item.token} className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <div className="font-medium">{item.token}</div>
                    <div className="text-sm text-muted-foreground">{item.share}% share</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${item.usdValue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">USD Value</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}