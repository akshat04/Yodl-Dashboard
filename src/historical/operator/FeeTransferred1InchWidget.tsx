import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ArrowUpRight, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockData = [
  { date: "Jan", transferred: 8500, pending: 1200 },
  { date: "Feb", transferred: 12300, pending: 800 },
  { date: "Mar", transferred: 15600, pending: 1500 },
  { date: "Apr", transferred: 18900, pending: 900 },
  { date: "May", transferred: 22100, pending: 1100 },
  { date: "Jun", transferred: 25400, pending: 600 },
];

const chartConfig = {
  transferred: {
    label: "Transferred",
    color: "hsl(var(--primary))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--secondary))",
  },
};

export function FeeTransferred1InchWidget() {
  const totalTransferred = 25400;
  const pendingAmount = 600;
  const transferGrowth = 14.9;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Fee Transferred to 1Inch</CardTitle>
            <CardDescription>Status, total, and breakdown over time</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Total Transferred</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${totalTransferred.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+{transferGrowth}% from last month</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-muted-foreground">Pending Transfer</span>
            </div>
            <div className="text-2xl font-bold text-secondary">
              ${pendingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Awaiting next batch</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="transferred"
                stackId="1"
                stroke="var(--color-transferred)"
                fill="var(--color-transferred)"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke="var(--color-pending)"
                fill="var(--color-pending)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}