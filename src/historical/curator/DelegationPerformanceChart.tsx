import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const mockData = [
  { operator: "Operator A", successRate: 95.2, fallbackRate: 4.8, successCount: 156, fallbackCount: 8 },
  { operator: "Operator B", successRate: 92.8, fallbackRate: 7.2, successCount: 142, fallbackCount: 11 },
  { operator: "Operator C", successRate: 97.1, fallbackRate: 2.9, successCount: 168, fallbackCount: 5 },
  { operator: "Operator D", successRate: 89.5, fallbackRate: 10.5, successCount: 128, fallbackCount: 15 },
  { operator: "Operator E", successRate: 94.3, fallbackRate: 5.7, successCount: 149, fallbackCount: 9 },
];

export function DelegationPerformanceChart() {
  const [showCounts, setShowCounts] = useState(false);

  const chartConfig = {
    successRate: { label: "Success Rate", color: "hsl(var(--primary))" },
    fallbackRate: { label: "Fallback Rate", color: "hsl(var(--destructive))" },
    successCount: { label: "Success Count", color: "hsl(var(--primary))" },
    fallbackCount: { label: "Fallback Count", color: "hsl(var(--destructive))" },
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Delegation Performance per Operator</CardTitle>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-counts"
            checked={showCounts}
            onCheckedChange={setShowCounts}
          />
          <Label htmlFor="show-counts">
            Show {showCounts ? "Counts" : "Percentages"}
          </Label>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm font-medium">Success {showCounts ? "Count" : "Rate"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm font-medium">Fallback {showCounts ? "Count" : "Rate"}</span>
          </div>
        </div>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <XAxis dataKey="operator" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey={showCounts ? "successCount" : "successRate"} 
                fill="var(--color-successRate)" 
              />
              <Bar 
                dataKey={showCounts ? "fallbackCount" : "fallbackRate"} 
                fill="var(--color-fallbackRate)" 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {mockData.map((operator) => (
            <div key={operator.operator} className="p-3 rounded-lg bg-muted">
              <div className="font-medium">{operator.operator}</div>
              <div className="text-muted-foreground">
                Success: {operator.successRate}% ({operator.successCount})
              </div>
              <div className="text-muted-foreground">
                Fallback: {operator.fallbackRate}% ({operator.fallbackCount})
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}