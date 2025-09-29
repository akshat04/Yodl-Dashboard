import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// Mock data
const mockData = [
  { vault: "Vault A", jan: 150000, feb: 180000, mar: 220000, apr: 195000 },
  { vault: "Vault B", jan: 120000, feb: 140000, mar: 165000, apr: 175000 },
  { vault: "Vault C", jan: 90000, feb: 110000, mar: 135000, apr: 145000 },
  { vault: "Vault D", jan: 75000, feb: 85000, mar: 95000, apr: 105000 },
];

const vaultOptions = ["All Vaults", "Vault A", "Vault B", "Vault C", "Vault D"];

export function AmountDelegatedPerVaultChart() {
  const [selectedVault, setSelectedVault] = useState("All Vaults");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const chartConfig = {
    jan: { label: "January", color: "hsl(var(--primary))" },
    feb: { label: "February", color: "hsl(var(--secondary))" },
    mar: { label: "March", color: "hsl(var(--accent))" },
    apr: { label: "April", color: "hsl(var(--muted))" },
  };

  const filteredData = selectedVault === "All Vaults" 
    ? mockData 
    : mockData.filter(item => item.vault === selectedVault);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Amount Delegated per Vault Over Time</CardTitle>
        <div className="flex flex-wrap gap-4">
          <Select value={selectedVault} onValueChange={setSelectedVault}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select vault" />
            </SelectTrigger>
            <SelectContent>
              {vaultOptions.map((vault) => (
                <SelectItem key={vault} value={vault}>
                  {vault}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <XAxis dataKey="vault" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="jan" fill="var(--color-jan)" />
              <Bar dataKey="feb" fill="var(--color-feb)" />
              <Bar dataKey="mar" fill="var(--color-mar)" />
              <Bar dataKey="apr" fill="var(--color-apr)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}