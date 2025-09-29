import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { date: "Jan", timeBetween: 24.5, impact: 2.3 },
  { date: "Feb", timeBetween: 28.7, impact: 1.8 },
  { date: "Mar", timeBetween: 32.1, impact: 3.1 },
  { date: "Apr", timeBetween: 21.3, impact: 1.2 },
  { date: "May", timeBetween: 35.8, impact: 4.2 },
  { date: "Jun", timeBetween: 26.4, impact: 2.7 },
  { date: "Jul", timeBetween: 29.9, impact: 2.1 },
  { date: "Aug", timeBetween: 23.7, impact: 1.5 },
];

const chartConfig = {
  timeBetween: {
    label: "Time Between Events (hours)",
    color: "hsl(var(--primary))",
  },
  impact: {
    label: "Impact on Capital (%)",
    color: "hsl(var(--secondary))",
  },
};

export function RebalancingTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Between Rebalancing Events</CardTitle>
        <CardDescription>Showing impact and frequency correlation</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="timeBetween" 
                stroke="var(--color-timeBetween)"
                strokeWidth={3}
                dot={{ fill: "var(--color-timeBetween)", strokeWidth: 2, r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="impact" 
                stroke="var(--color-impact)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-impact)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
            <span>Time Between Events (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--secondary))" }}></div>
            <span>Capital Impact % (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}