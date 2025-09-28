import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface YodlPriceData {
  id: string;
  price_usd: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  created_at: string;
}

export const YodlPriceTickerWidget = () => {
  const [priceData, setPriceData] = useState<YodlPriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const { data, error } = await supabase
          .from('yodl_price_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setPriceData(data);
      } catch (error) {
        console.error('Error fetching YODL price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();

    // Set up real-time subscription
    const channel = supabase
      .channel('yodl_price_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yodl_price_data'
        },
        () => {
          fetchPriceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            YODL Price Ticker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-32" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!priceData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            YODL Price Ticker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No price data available</p>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = priceData.change_24h >= 0;
  const changeIcon = isPositiveChange ? TrendingUp : TrendingDown;
  const changeColor = isPositiveChange ? "text-green-500" : "text-red-500";

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          YODL Price Ticker
          <Badge variant="outline" className="ml-auto">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">
            ${priceData.price_usd.toFixed(4)}
          </div>
          <div className={`flex items-center justify-center gap-1 text-sm ${changeColor}`}>
            {changeIcon({ className: "h-4 w-4" })}
            {Math.abs(priceData.change_24h).toFixed(2)}%
            <span className="text-muted-foreground ml-1">(24h)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="font-semibold">
              ${priceData.volume_24h.toLocaleString()}
            </p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="font-semibold">
              ${priceData.market_cap.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Last updated: {new Date(priceData.created_at).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};