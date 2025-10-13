import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, DollarSign, ExternalLink } from "lucide-react";

interface Challenge {
  id: string;
  challenge_id: string;
  amount_due: number;
  due_date: string | null;
  operator: {
    name: string;
  };
}

interface OpenChallenge {
  id: string;
  transaction_hash: string;
  token: string;
  amount_pending: number;
  usd_value: number;
}

interface ClosedChallenge {
  id: string;
  transaction_hash: string;
  token: string;
  amount_disbursed: number;
  usd_value: number;
}

export function ChallengeTab() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_challenge_amounts')
        .select(`
          id,
          challenge_id,
          amount_due,
          due_date,
          operator:operators(name)
        `)
        .order('amount_due', { ascending: false });

      if (error) throw error;
      
      // Mock data for challenges
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          challenge_id: 'CH-2025-001',
          amount_due: 15000,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Alpha' }
        },
        {
          id: '2',
          challenge_id: 'CH-2025-002',
          amount_due: 8500,
          due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Beta' }
        },
        {
          id: '3',
          challenge_id: 'CH-2025-003',
          amount_due: 12300,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Gamma' }
        },
        {
          id: '4',
          challenge_id: 'CH-2025-004',
          amount_due: 6700,
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Delta' }
        }
      ];

      setChallenges(data?.length ? data : mockChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Use mock data on error
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          challenge_id: 'CH-2025-001',
          amount_due: 15000,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Alpha' }
        },
        {
          id: '2',
          challenge_id: 'CH-2025-002',
          amount_due: 8500,
          due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Beta' }
        }
      ];
      setChallenges(mockChallenges);
    } finally {
      setLoading(false);
    }
  };

  const totalDue = challenges.reduce((sum, c) => sum + c.amount_due, 0);
  const totalReserveYODL = 5000000;
  const reserveUSDValue = 2500000;
  const coverageRatio = totalDue > 0 ? (reserveUSDValue / totalDue) * 100 : 0;

  const getCoverageRatioColor = (ratio: number) => {
    if (ratio >= 100) return "text-green-500";
    if (ratio >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const openChallenges: OpenChallenge[] = [
    {
      id: '1',
      transaction_hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      token: 'YODL',
      amount_pending: 15000,
      usd_value: 7500
    },
    {
      id: '2',
      transaction_hash: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
      token: 'USDC',
      amount_pending: 5000,
      usd_value: 5000
    },
    {
      id: '3',
      transaction_hash: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v',
      token: 'ETH',
      amount_pending: 3.5,
      usd_value: 8750
    },
    {
      id: '4',
      transaction_hash: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w',
      token: 'USDT',
      amount_pending: 6200,
      usd_value: 6200
    },
    {
      id: '5',
      transaction_hash: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x',
      token: 'DAI',
      amount_pending: 4500,
      usd_value: 4500
    }
  ];

  const closedChallenges: ClosedChallenge[] = [
    {
      id: '1',
      transaction_hash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f',
      token: 'USDC',
      amount_disbursed: 8500,
      usd_value: 8500
    },
    {
      id: '2',
      transaction_hash: '0x8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f9e',
      token: 'YODL',
      amount_disbursed: 12000,
      usd_value: 6000
    },
    {
      id: '3',
      transaction_hash: '0x7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f9e8d',
      token: 'ETH',
      amount_disbursed: 2.8,
      usd_value: 7000
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Open Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Summary with 4 Metrics */}
          <div className="p-6 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {/* Total Amount Due */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Amount Due</p>
                <p className="text-3xl font-bold text-foreground">${totalDue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} pending
                </p>
              </div>

              {/* Total Reserve (YODL) */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reserve Balance Available</p>
                <p className="text-3xl font-bold text-foreground">{totalReserveYODL.toLocaleString()} YODL</p>
                <p className="text-xs text-muted-foreground">Available reserves</p>
              </div>

              {/* USD Value of Reserve */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">USD Value of Reserve</p>
                <p className="text-3xl font-bold text-foreground">${reserveUSDValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Current market value</p>
              </div>
              
              {/* Challenges Settled */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Challenges Settled</p>
                <p className="text-3xl font-bold text-foreground">{closedChallenges.length}</p>
                <p className="text-xs text-muted-foreground">Settled all-time</p>
              </div>

              {/* Coverage Ratio */}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className={`text-3xl font-bold ${getCoverageRatioColor(coverageRatio)}`}>
                  {coverageRatio.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Reserve / Amount Due</p>
              </div>

              
            </div>
          </div>

          {/* Nested Tabs for Open and Closed Challenges */}
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="open" className="data-[state=inactive]:text-black">Open</TabsTrigger>
              <TabsTrigger value="closed" className="data-[state=inactive]:text-black">Closed</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction (#)</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="text-right">Amount Pending</TableHead>
                      <TableHead className="text-right">USD Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openChallenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell>
                          <a
                            href={`https://etherscan.io/tx/${challenge.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-black hover:underline"
                          >
                            {truncateHash(challenge.transaction_hash)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell className="font-medium">{challenge.token}</TableCell>
                        <TableCell className="text-right">
                          {challenge.amount_pending.toLocaleString(undefined, { 
                            minimumFractionDigits: challenge.token === 'ETH' ? 2 : 0,
                            maximumFractionDigits: challenge.token === 'ETH' ? 2 : 0
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${challenge.usd_value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="closed" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction (#)</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead className="text-right">Amount Disbursed</TableHead>
                      <TableHead className="text-right">USD Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedChallenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell>
                          <a
                            href={`https://etherscan.io/tx/${challenge.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-black hover:underline"
                          >
                            {truncateHash(challenge.transaction_hash)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell className="font-medium">{challenge.token}</TableCell>
                        <TableCell className="text-right">
                          {challenge.amount_disbursed.toLocaleString(undefined, { 
                            minimumFractionDigits: challenge.token === 'ETH' ? 2 : 0,
                            maximumFractionDigits: challenge.token === 'ETH' ? 2 : 0
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${challenge.usd_value.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}