import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Gauge } from "lucide-react";

const currentAPR = 14.7;
const data = [
  { name: "Current APR", value: currentAPR },
  { name: "Remaining", value: 30 - currentAPR },
];

const COLORS = {
  high: "hsl(var(--destructive))", // Above 20%
  medium: "hsl(var(--primary))", // 10-20%
  low: "hsl(var(--muted))", // Below 10%
  remaining: "hsl(var(--muted-foreground) / 0.1)",
};

const chartConfig = {
  apr: {
    label: "Fee APR",
    color: "hsl(var(--primary))",
  },
};

export function FeeAPRGaugeWidget() {
  const getAPRColor = (apr: number) => {
    if (apr >= 20) return COLORS.high;
    if (apr >= 10) return COLORS.medium;
    return COLORS.low;
  };

  const getAPRStatus = (apr: number) => {
    if (apr >= 20) return "High";
    if (apr >= 10) return "Medium";
    return "Low";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Fee APR</CardTitle>
          <CardDescription>Real-time annual percentage rate</CardDescription>
        </div>
        <Gauge className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  <Cell fill={getAPRColor(currentAPR)} />
                  <Cell fill={COLORS.remaining} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: getAPRColor(currentAPR) }}>
                {currentAPR}%
              </div>
              <div className="text-sm text-muted-foreground">
                {getAPRStatus(currentAPR)} APR
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Target: 15%</span>
          <span className="text-muted-foreground">Max: 30%</span>
        </div>
      </CardContent>
    </Card>
  );
}