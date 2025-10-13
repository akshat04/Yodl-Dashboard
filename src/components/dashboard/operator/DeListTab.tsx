// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { AlertTriangle } from "lucide-react";
// import { toast } from "@/hooks/use-toast";

// interface EscrowToken {
//   id: string;
//   token_symbol: string;
//   amount: number;
//   usd_value: number;
//   isListed: boolean;
// }

// interface DeListTabProps {
//   escrowTokens: EscrowToken[];
//   onEscrowTokensUpdate: (tokens: EscrowToken[]) => void;
// }

// export function DeListTab({ escrowTokens, onEscrowTokensUpdate }: DeListTabProps) {
//   const [delistDialogOpen, setDelistDialogOpen] = useState(false);
//   const [selectedToken, setSelectedToken] = useState<EscrowToken | null>(null);

//   const handleDeListClick = (token: EscrowToken) => {
//     setSelectedToken(token);
//     setDelistDialogOpen(true);
//   };

//   const handleDeListConfirm = () => {
//     if (!selectedToken) return;

//     // Remove the token from escrowTokens
//     const updatedTokens = escrowTokens.filter(token => token.id !== selectedToken.id);
//     onEscrowTokensUpdate(updatedTokens);

//     // Update localStorage
//     localStorage.setItem('escrowTokens', JSON.stringify(updatedTokens));

//     // Dispatch event to notify other components
//     window.dispatchEvent(new Event('escrowTokensUpdated'));

//     toast({
//       title: "Token De-Listed Successfully",
//       description: `${selectedToken.amount.toLocaleString()} ${selectedToken.token_symbol} has been removed from escrow`,
//     });

//     setDelistDialogOpen(false);
//     setSelectedToken(null);
//   };

//   return (
//     <>
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>De-List Tokens from Escrow</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {escrowTokens.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No tokens in escrow
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Token</TableHead>
//                     <TableHead className="text-right">Quantity</TableHead>
//                     <TableHead className="text-right">USD Value</TableHead>
//                     <TableHead className="text-center">Status</TableHead>
//                     <TableHead className="text-center">Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {escrowTokens.map((token) => (
//                     <TableRow key={token.id}>
//                       <TableCell className="font-medium">{token.token_symbol}</TableCell>
//                       <TableCell className="text-right">
//                         {token.amount.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="text-right">
//                         ${token.usd_value.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <Badge variant={token.isListed ? "default" : "secondary"}>
//                           {token.isListed ? "Listed" : "Unlisted"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <Button
//                           onClick={() => handleDeListClick(token)}
//                           size="sm"
//                           variant="destructive"
//                         >
//                           De-List
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* De-List Confirmation Dialog */}
//       <Dialog open={delistDialogOpen} onOpenChange={setDelistDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5 text-destructive" />
//               Confirm De-List
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to de-list this token from escrow? This action will remove it from your available assets.
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedToken && (
//             <div className="space-y-4 py-4">
//               <div className="bg-muted/50 p-4 rounded-lg space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Token:</span>
//                   <span className="font-medium">{selectedToken.token_symbol}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Quantity:</span>
//                   <span className="font-medium">{selectedToken.amount.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">USD Value:</span>
//                   <span className="font-medium">${selectedToken.usd_value.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Status:</span>
//                   <Badge variant={selectedToken.isListed ? "default" : "secondary"}>
//                     {selectedToken.isListed ? "Listed" : "Unlisted"}
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDelistDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={handleDeListConfirm}>
//               Confirm De-List
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

export function DeListTab() {
  return (
    <div className="space-y-6">
      {/* Empty tab - content to be added */}
    </div>
  );
}