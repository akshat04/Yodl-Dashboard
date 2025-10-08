import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EtherFiLogo from "@/assets/Vault Logos/Ether_fi_logo.png";
import CmETHLogo from "@/assets/Vault Logos/cmETH_Restaked_mETH_Vault.png";
import RestakingVaultETHLogo from "@/assets/Vault Logos/Restaking_Vault_ETH.png";
import RenzoLogo from "@/assets/Vault Logos/Renzo_Restaked_LST.png";
import RestakedLsETHLogo from "@/assets/Vault Logos/Restaked_LsETH_Vault.png";
import MEVCapitalLogo from "@/assets/Vault Logos/MEV_Capital_restaked_ETH.png";
import GauntletLogo from "@/assets/Vault Logos/Gauntlet_Restaked_wstETH.png";
import SteakhouseLogo from "@/assets/Vault Logos/Steakhouse_Resteaking_Vault.png";
import Cp0xLogo from "@/assets/Vault Logos/cp0x_LRT_Conservative_Vault.png";
import StakeWiseLogo from "@/assets/Vault Logos/StakeWise_osETH.png";

interface VaultFee {
  id: string;
  name: string;
  address: string;
  link: string;
  logo: string;
  delegatedAmount: number; // in millions USD
  feePercentage: number;
  isSet: boolean;
}

export function FeeSetterTab() {
  const [vaults, setVaults] = useState<VaultFee[]>([
    {
      id: '1',
      name: 'Ether.fi - wstETH',
      address: '0x450a90fdEa8B87a6448Ca1C87c88Ff65676aC45b',
      link: 'https://app.symbiotic.fi/vault/0x450a90fdEa8B87a6448Ca1C87c88Ff65676aC45b',
      logo: EtherFiLogo,
      delegatedAmount: 10.5,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '2',
      name: 'cmETH Restaked mETH Vault',
      address: '0xbA60b6969fAA9b927A0acc750Ea8EEAdcEd644B7',
      link: 'https://app.symbiotic.fi/vault/0xbA60b6969fAA9b927A0acc750Ea8EEAdcEd644B7',
      logo: CmETHLogo,
      delegatedAmount: 15.2,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '3',
      name: 'Restaking Vault ETH',
      address: '0x7b276aAD6D2ebfD7e270C5a2697ac79182D9550E',
      link: 'https://app.symbiotic.fi/vault/0x7b276aAD6D2ebfD7e270C5a2697ac79182D9550E',
      logo: RestakingVaultETHLogo,
      delegatedAmount: 8.7,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '4',
      name: 'Renzo Restaked LST',
      address: '0xa88e91cEF50b792f9449e2D4C699b6B3CcE1D19F',
      link: 'https://app.symbiotic.fi/vault/0xa88e91cEF50b792f9449e2D4C699b6B3CcE1D19F',
      logo: RenzoLogo,
      delegatedAmount: 22.3,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '5',
      name: 'Restaked LsETH Vault',
      address: '0xEa0F2EA61998346aD39dddeF7513ae90915AFb3c',
      link: 'https://app.symbiotic.fi/vault/0xEa0F2EA61998346aD39dddeF7513ae90915AFb3c',
      logo: RestakedLsETHLogo,
      delegatedAmount: 12.9,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '6',
      name: 'MEV Capital restaked ETH',
      address: '0x446970400e1787814CA050A4b45AE9d21B3f7EA7',
      link: 'https://app.symbiotic.fi/vault/0x446970400e1787814CA050A4b45AE9d21B3f7EA7',
      logo: MEVCapitalLogo,
      delegatedAmount: 18.6,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '7',
      name: 'Gauntlet Restaked wstETH',
      address: '0xc10A7f0AC6E3944F4860eE97a937C51572e3a1Da',
      link: 'https://app.symbiotic.fi/vault/0xc10A7f0AC6E3944F4860eE97a937C51572e3a1Da',
      logo: GauntletLogo,
      delegatedAmount: 25.4,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '8',
      name: 'Steakhouse Resteaking Vault',
      address: '0xf7Ce770AbdD1895f2CB0989D7cf2A26705FF37a7',
      link: 'https://app.symbiotic.fi/vault/0xf7Ce770AbdD1895f2CB0989D7cf2A26705FF37a7',
      logo: SteakhouseLogo,
      delegatedAmount: 30.1,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '9',
      name: 'cp0x LRT Conservative Vault',
      address: '0x82c304aa105fbbE2aA368A83D7F8945d41f6cA54',
      link: 'https://app.symbiotic.fi/vault/0x82c304aa105fbbE2aA368A83D7F8945d41f6cA54',
      logo: Cp0xLogo,
      delegatedAmount: 14.8,
      feePercentage: 0,
      isSet: false
    },
    {
      id: '10',
      name: 'StakeWise osETH',
      address: '0x9ec7175541948494Db7831c95868DD97d2E0F742',
      link: 'https://app.symbiotic.fi/vault/0x9ec7175541948494Db7831c95868DD97d2E0F742',
      logo: StakeWiseLogo,
      delegatedAmount: 19.5,
      feePercentage: 0,
      isSet: false
    }
  ]);

  // Load saved fees from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vaultFees');
    if (stored) {
      try {
        const feeData = JSON.parse(stored);
        setVaults(prev => prev.map(vault => {
          const savedFee = feeData.find((f: any) => f.vault_name === vault.name);
          if (savedFee) {
            return {
              ...vault,
              feePercentage: savedFee.fee_percentage,
              isSet: savedFee.fee_percentage > 0
            };
          }
          return vault;
        }));
      } catch (error) {
        console.error('Error loading saved fees:', error);
      }
    }
  }, []);

  const handleSliderChange = (vaultId: string, value: number[]) => {
    setVaults(prev => prev.map(vault =>
      vault.id === vaultId ? { ...vault, feePercentage: value[0] } : vault
    ));
  };

  const handleSetFee = (vaultId: string) => {
    const vault = vaults.find(v => v.id === vaultId);
    if (!vault) return;

    setVaults(prev => prev.map(v =>
      v.id === vaultId ? { ...v, isSet: true } : v
    ));

    // Create mapping: Restaking Vault ETH -> RE7: USDC Vault
    const vaultMapping: Record<string, string> = {
      'Restaking Vault ETH': 'RE7: USDC Vault'
    };

    // Save to localStorage with specific mapping for Credit Line table
    const feeData = vaults.map(v => ({
      vault_name: v.name,
      fee_percentage: v.id === vaultId ? vault.feePercentage : v.feePercentage,
      mapped_to: vaultMapping[v.name] || v.name
    }));
    localStorage.setItem('vaultFees', JSON.stringify(feeData));
    
    // Dispatch custom event to notify other components in same tab
    window.dispatchEvent(new Event('vaultFeesUpdated'));

    toast({
      title: "Fee Set Successfully",
      description: `Fee set to ${vault.feePercentage.toFixed(2)}% for ${vault.name}`,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-3)}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Set Fee</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Vault Name</TableHead>
                <TableHead className="text-right min-w-[120px]">Delegated Amount</TableHead>
                <TableHead className="min-w-[400px]">Set Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaults.map((vault) => (
                <TableRow key={vault.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={vault.logo} 
                        alt={vault.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{vault.name}</span>
                        <a
                          href={vault.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {truncateAddress(vault.address)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${vault.delegatedAmount.toFixed(1)}M
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className={`flex-1 ${!vault.isSet ? 'opacity-40' : 'opacity-100'} transition-opacity`}>
                        <Slider
                          value={[vault.feePercentage]}
                          onValueChange={(value) => handleSliderChange(vault.id, value)}
                          min={0}
                          max={1.0}
                          step={0.01}
                          className="w-full"
                        />
                      </div>
                      <span className="text-sm font-medium min-w-[60px] text-center">
                        {vault.feePercentage.toFixed(2)}%
                      </span>
                      <Button
                        onClick={() => handleSetFee(vault.id)}
                        size="sm"
                        variant={vault.isSet ? "secondary" : "default"}
                      >
                        {vault.isSet ? "Update Fee" : "Set Fee"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}