import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockData = [
  { date: "Jan", operator1: 8500, operator2: 7200, operator3: 6800 },
  { date: "Feb", operator1: 12300, operator2: 9800, operator3: 8600 },
  { date: "Mar", operator1: 15600, operator2: 12100, operator3: 10900 },
  { date: "Apr", operator1: 18900, operator2: 14500, operator3: 13200 },
  { date: "May", operator1: 22100, operator2: 17800, operator3: 15400 },
  { date: "Jun", operator1: 25400, operator2: 20200, operator3: 17600 },
];

const chartConfig = {
  operator1: {
    label: "Operator 1",
    color: "hsl(var(--primary))",
  },
  operator2: {
    label: "Operator 2",
    color: "hsl(var(--secondary))",
  },
  operator3: {
    label: "Operator 3",
    color: "hsl(var(--accent))",
  },
};

export function FeeClaimedChart() {
  const [selectedView, setSelectedView] = useState("all");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Claimed (USD)</CardTitle>
            <CardDescription>Per operator with historical comparison</CardDescription>
          </div>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operators</SelectItem>
              <SelectItem value="operator1">Operator 1</SelectItem>
              <SelectItem value="operator2">Operator 2</SelectItem>
              <SelectItem value="operator3">Operator 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              {(selectedView === "all" || selectedView === "operator1") && (
                <Line 
                  type="monotone" 
                  dataKey="operator1" 
                  stroke="var(--color-operator1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-operator1)", r: 4 }}
                />
              )}
              {(selectedView === "all" || selectedView === "operator2") && (
                <Line 
                  type="monotone" 
                  dataKey="operator2" 
                  stroke="var(--color-operator2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-operator2)", r: 4 }}
                />
              )}
              {(selectedView === "all" || selectedView === "operator3") && (
                <Line 
                  type="monotone" 
                  dataKey="operator3" 
                  stroke="var(--color-operator3)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-operator3)", r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}