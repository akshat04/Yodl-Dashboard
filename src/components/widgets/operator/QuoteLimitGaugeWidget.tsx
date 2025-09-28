import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Gauge, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface QuoteLimit {
  id: string;
  operator_id: string;
  total_limit: number;
  used_amount: number;
  percentage_used: number;
  operator: {
    name: string;
  };
}

export const QuoteLimitGaugeWidget = () => {
  const [quoteLimits, setQuoteLimits] = useState<QuoteLimit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_quote_limits')
          .select(`
            id,
            operator_id,
            total_limit,
            used_amount,
            percentage_used,
            operator:operators(name)
          `)
          .order('percentage_used', { ascending: false });

        if (error) throw error;
        setQuoteLimits(data || []);
      } catch (error) {
        console.error('Error fetching quote limits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteLimits();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_quote_limits_gauge_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_quote_limits'
        },
        () => {
          fetchQuoteLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <XCircle className="h-5 w-5 text-destructive" />;
    if (percentage >= 70) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "default";
    return "secondary";
  };

  const getGaugeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Quote Limit Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Quote Limit Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quoteLimits.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No quote limits found</p>
        ) : (
          quoteLimits.map((limit) => (
            <div key={limit.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(limit.percentage_used)}
                  <div>
                    <p className="font-medium">{limit.operator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${limit.used_amount.toLocaleString()} / ${limit.total_limit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(limit.percentage_used)}>
                  {limit.percentage_used.toFixed(1)}%
                </Badge>
              </div>

              {/* Circular Gauge */}
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-muted"
                    />
                    {/* Progress circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${limit.percentage_used}, 100`}
                      className={
                        limit.percentage_used >= 90 ? 'text-destructive' :
                        limit.percentage_used >= 70 ? 'text-warning' : 'text-green-500'
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {limit.percentage_used.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" title="Safe (0-70%)"/>
                  <div className="w-2 h-2 rounded-full bg-warning" title="Warning (70-90%)"/>
                  <div className="w-2 h-2 rounded-full bg-destructive" title="Critical (90%+)"/>
                </div>
                <span>100%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};