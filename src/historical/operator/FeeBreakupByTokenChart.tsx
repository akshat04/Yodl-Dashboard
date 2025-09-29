import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockData = [
  { token: "USDC", amount: 45000, percentage: 45, color: "hsl(var(--primary))" },
  { token: "WETH", amount: 25000, percentage: 25, color: "hsl(var(--secondary))" },
  { token: "USDT", amount: 20000, percentage: 20, color: "hsl(var(--accent))" },
  { token: "DAI", amount: 10000, percentage: 10, color: "hsl(var(--muted))" },
];

const chartConfig = {
  USDC: {
    label: "USDC",
    color: "hsl(var(--primary))",
  },
  WETH: {
    label: "WETH",
    color: "hsl(var(--secondary))",
  },
  USDT: {
    label: "USDT",
    color: "hsl(var(--accent))",
  },
  DAI: {
    label: "DAI",
    color: "hsl(var(--muted))",
  },
};

export function FeeBreakupByTokenChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Break-up by Token</CardTitle>
        <CardDescription>Distribution showing share and USD value for each token</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pie">
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={mockData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ token, percentage }) => `${token}: ${percentage}%`}
                  >
                    {mockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="bar">
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="token" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {mockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}