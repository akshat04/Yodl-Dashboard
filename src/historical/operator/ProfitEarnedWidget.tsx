import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, DollarSign } from "lucide-react";

const mockData = [
  { date: "Jan", profit: 12500, trend: 8.5 },
  { date: "Feb", profit: 15800, trend: 12.2 },
  { date: "Mar", profit: 18900, trend: 15.8 },
  { date: "Apr", profit: 22100, trend: 18.9 },
  { date: "May", profit: 19500, trend: 16.2 },
  { date: "Jun", profit: 24300, trend: 21.4 },
];

const chartConfig = {
  profit: {
    label: "Profit Earned",
    color: "hsl(var(--primary))",
  },
  trend: {
    label: "Trend %",
    color: "hsl(var(--secondary))",
  },
};

export function ProfitEarnedWidget() {
  const currentProfit = 24300;
  const profitChange = 12.8;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Profit Earned</CardTitle>
          <CardDescription>Total profit with historical trend</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-primary" />
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{profitChange}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary mb-4">
          ${currentProfit.toLocaleString()}
        </div>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="var(--color-profit)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-profit)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}