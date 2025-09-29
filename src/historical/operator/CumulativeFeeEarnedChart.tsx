import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { date: "Jan", cumulative: 12500 },
  { date: "Feb", cumulative: 28300 },
  { date: "Mar", cumulative: 47200 },
  { date: "Apr", cumulative: 69300 },
  { date: "May", cumulative: 88800 },
  { date: "Jun", cumulative: 113200 },
  { date: "Jul", cumulative: 140600 },
  { date: "Aug", cumulative: 172800 },
];

const chartConfig = {
  cumulative: {
    label: "Cumulative Fee Earned ($)",
    color: "hsl(var(--primary))",
  },
};

export function CumulativeFeeEarnedChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Fee Earned</CardTitle>
        <CardDescription>Running total over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="var(--color-cumulative)"
                strokeWidth={3}
                dot={{ fill: "var(--color-cumulative)", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}