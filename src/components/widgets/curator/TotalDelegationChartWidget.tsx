import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, ArrowUpDown, Eye } from "lucide-react";

interface DelegationData {
  id: string;
  operator_id: string;
  amount: number;
  usd_value: number;
  token_type: string;
  operator: {
    name: string;
    operator_address: string;
  };
}

interface ChartData {
  operator_name: string;
  token_amount: number;
  usd_value: number;
  percentage: number;
  token_type: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export const TotalDelegationChartWidget = () => {
  const [delegationData, setDelegationData] = useState<DelegationData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'usd_value' | 'token_amount'>('usd_value');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [filterToken, setFilterToken] = useState<string>('all');
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  useEffect(() => {
    const fetchDelegationData = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_delegations')
          .select(`
            id,
            operator_id,
            amount,
            usd_value,
            token_type,
            operator:operators(name, operator_address)
          `)
          .order(sortBy, { ascending: false });

        if (error) throw error;

        let filteredData = data || [];
        if (filterToken !== 'all') {
          filteredData = filteredData.filter(item => item.token_type === filterToken);
        }

        const totalUsdValue = filteredData.reduce((sum, item) => sum + item.usd_value, 0);

        const processedData = filteredData.map((item) => ({
          operator_name: item.operator.name.length > 15 ? 
            item.operator.name.substring(0, 15) + '...' : 
            item.operator.name,
          token_amount: item.amount,
          usd_value: item.usd_value,
          percentage: totalUsdValue > 0 ? (item.usd_value / totalUsdValue) * 100 : 0,
          token_type: item.token_type
        }));

        setDelegationData(filteredData);
        setChartData(processedData);
      } catch (error) {
        console.error('Error fetching delegation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDelegationData();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_delegations_chart')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_delegations'
        },
        () => {
          fetchDelegationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortBy, filterToken]);

  const handleDrillDown = (operatorName: string) => {
    if (selectedOperator === operatorName) {
      setSelectedOperator(null);
    } else {
      setSelectedOperator(operatorName);
    }
  };

  const totalDelegation = chartData.reduce((sum, item) => sum + item.usd_value, 0);
  const uniqueTokens = [...new Set(delegationData.map(item => item.token_type))];

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Total Delegation per Operator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chartType === 'bar' ? <BarChart3 className="h-5 w-5" /> : <PieChartIcon className="h-5 w-5" />}
            Total Delegation per Operator
          </div>
          <Badge variant="outline">
            ${totalDelegation.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Select value={chartType} onValueChange={(value: 'bar' | 'pie') => setChartType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: 'usd_value' | 'token_amount') => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd_value">USD Value</SelectItem>
              <SelectItem value="token_amount">Token Amount</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterToken} onValueChange={setFilterToken}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueTokens.map((token) => (
                <SelectItem key={token} value={token}>{token}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No delegation data found</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="operator_name" 
                      className="text-xs"
                      tick={{ fill: 'currentColor' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value, name) => [
                        name === 'usd_value' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                        name === 'usd_value' ? 'USD Value' : 'Token Amount'
                      ]}
                    />
                    <Bar 
                      dataKey={sortBy === 'usd_value' ? 'usd_value' : 'token_amount'}
                      fill="hsl(var(--primary))"
                      onClick={(data) => handleDrillDown(data.operator_name)}
                      style={{ cursor: 'pointer' }}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usd_value"
                      label={(entry) => `${entry.operator_name} (${entry.percentage.toFixed(1)}%)`}
                      onClick={(data) => handleDrillDown(data.operator_name)}
                      style={{ cursor: 'pointer' }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'USD Value']}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Eye className="h-4 w-4" />
                Delegation Breakdown
              </div>
              
              {selectedOperator && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Details for {selectedOperator}</p>
                  {delegationData
                    .filter(item => item.operator.name.includes(selectedOperator.replace('...', '')))
                    .map((item) => (
                      <div key={item.id} className="text-sm text-muted-foreground">
                        {item.token_type}: {item.amount.toLocaleString()} tokens (${item.usd_value.toLocaleString()})
                      </div>
                    ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {chartData.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                    onClick={() => handleDrillDown(item.operator_name)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: chartType === 'pie' ? COLORS[index % COLORS.length] : 'hsl(var(--primary))' }}
                      />
                      <span className="text-sm">{item.operator_name}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">${item.usd_value.toLocaleString()}</div>
                      <div className="text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};