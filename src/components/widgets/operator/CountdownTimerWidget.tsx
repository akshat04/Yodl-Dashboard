import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VaultRebalance {
  id: string;
  vault_address: string;
  vault_name: string;
  expiry_time: string;
  status: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimerWidget() {
  const [rebalances, setRebalances] = useState<VaultRebalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchRebalances();
    
    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set up real-time subscription
    const channel = supabase
      .channel('vault-rebalances-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vault_rebalances' },
        () => fetchRebalances()
      )
      .subscribe();

    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRebalances = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_rebalances')
        .select('*')
        .eq('status', 'active')
        .order('expiry_time', { ascending: true });

      if (error) throw error;
      setRebalances(data || []);
    } catch (error) {
      console.error('Error fetching vault rebalances:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (expiryTime: string): TimeRemaining => {
    const expiry = new Date(expiryTime);
    const now = currentTime;
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, total: diff };
  };

  const getStatusColor = (timeRemaining: TimeRemaining) => {
    if (timeRemaining.total <= 0) {
      return 'bg-status-error text-status-error-foreground';
    } else if (timeRemaining.total < 3600000) { // Less than 1 hour
      return 'bg-status-warning text-status-warning-foreground';
    } else if (timeRemaining.total < 86400000) { // Less than 1 day
      return 'bg-status-info text-status-info-foreground';
    } else {
      return 'bg-status-success text-status-success-foreground';
    }
  };

  const formatTimeUnit = (value: number, unit: string) => {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold tabular-nums">{value.toString().padStart(2, '0')}</div>
        <div className="text-xs text-muted-foreground">{unit}</div>
      </div>
    );
  };

  const getProgressPercentage = (timeRemaining: TimeRemaining, totalDuration: number = 7 * 24 * 60 * 60 * 1000) => {
    if (timeRemaining.total <= 0) return 0;
    return Math.max(0, Math.min(100, (timeRemaining.total / totalDuration) * 100));
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Rebalance Timers</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchRebalances}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : rebalances.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No active rebalances
            </div>
          ) : (
            rebalances.map((rebalance) => {
              const timeRemaining = calculateTimeRemaining(rebalance.expiry_time);
              const isExpired = timeRemaining.total <= 0;
              const isUrgent = timeRemaining.total < 3600000 && timeRemaining.total > 0;

              return (
                <div key={rebalance.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{rebalance.vault_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {rebalance.vault_address.slice(0, 6)}...{rebalance.vault_address.slice(-4)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(timeRemaining)}>
                      {isExpired ? 'EXPIRED' : isUrgent ? 'URGENT' : 'ACTIVE'}
                    </Badge>
                  </div>

                  {isExpired ? (
                    <div className="text-center py-4">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-status-error" />
                      <p className="text-status-error font-bold">Rebalance Expired</p>
                      <p className="text-xs text-muted-foreground">
                        Expired {new Date(rebalance.expiry_time).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {formatTimeUnit(timeRemaining.days, 'DAYS')}
                        {formatTimeUnit(timeRemaining.hours, 'HRS')}
                        {formatTimeUnit(timeRemaining.minutes, 'MIN')}
                        {formatTimeUnit(timeRemaining.seconds, 'SEC')}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            isUrgent ? 'bg-status-warning' : 'bg-status-success'
                          }`}
                          style={{ width: `${getProgressPercentage(timeRemaining)}%` }}
                        />
                      </div>

                      <p className="text-xs text-center text-muted-foreground">
                        Expires {new Date(rebalance.expiry_time).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}