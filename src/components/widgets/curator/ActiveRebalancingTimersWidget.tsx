import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Timer, AlertCircle } from "lucide-react";

interface RebalanceTimer {
  id: string;
  vault_address: string;
  vault_name: string;
  expiry_time: string;
  status: string;
  timeout_at: string | null;
  is_overdue: boolean;
}

export const ActiveRebalancingTimersWidget = () => {
  const [timers, setTimers] = useState<RebalanceTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const { data, error } = await supabase
          .from('vault_rebalances')
          .select('*')
          .eq('status', 'active')
          .order('expiry_time', { ascending: true });

        if (error) throw error;
        setTimers(data || []);
      } catch (error) {
        console.error('Error fetching rebalancing timers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimers();

    // Update current time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_rebalances_timers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_rebalances'
        },
        () => {
          fetchTimers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTimeRemaining = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const now = currentTime;
    const timeLeft = expiry.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return { text: "EXPIRED", color: "text-destructive", isExpired: true };
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    let timeString = "";
    let color = "text-foreground";

    if (days > 0) {
      timeString = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      timeString = `${hours}h ${minutes}m ${seconds}s`;
      color = timeLeft < 60 * 60 * 1000 ? "text-warning" : "text-foreground"; // Warning if less than 1 hour
    } else if (minutes > 0) {
      timeString = `${minutes}m ${seconds}s`;
      color = "text-warning";
    } else {
      timeString = `${seconds}s`;
      color = "text-destructive";
    }

    return { text: timeString, color, isExpired: false };
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Active Rebalancing Timers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const expiredTimers = timers.filter(timer => {
    const expiry = new Date(timer.expiry_time);
    return expiry.getTime() <= currentTime.getTime();
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Active Rebalancing Timers
          {expiredTimers.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {expiredTimers.length} Expired
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {timers.length}
          </div>
          <p className="text-sm text-muted-foreground">
            Active Rebalancing Processes
          </p>
        </div>

        <div className="space-y-3">
          {timers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No active rebalancing timers</p>
          ) : (
            timers.map((timer) => {
              const timeRemaining = formatTimeRemaining(timer.expiry_time);
              
              return (
                <div key={timer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {timeRemaining.isExpired ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{timer.vault_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {timer.vault_address.substring(0, 10)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-bold ${timeRemaining.color}`}>
                      {timeRemaining.text}
                    </p>
                    {timeRemaining.isExpired && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {timers.length > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            Updates every second • {currentTime.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};