import React, { useState } from "react";
import type { Holding } from "../services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";

interface HoldingsTableProps {
  holdings: Holding[];
  selectedCoins: Set<string>;
  onSelectCoin: (coin: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  selectedCoins,
  onSelectCoin,
  onSelectAll,
}) => {
  const allSelected = holdings.length > 0 && selectedCoins.size === holdings.length;
  const [showAll, setShowAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'stcg' | 'ltcg', direction: 'asc' | 'desc' } | null>(null);

  const formatCurrency = (val: number, isLoss = false, prefix = "$") => {
    const formatted = Math.abs(val).toLocaleString("en-US", { maximumFractionDigits: 5 });
    if (isLoss) return `-${prefix}${formatted}`;
    if (val > 0) return `+${prefix}${formatted}`;
    return `${prefix}${formatted}`;
  };

  const sortedHoldings = React.useMemo(() => {
    let sortableItems = [...holdings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = sortConfig.key === 'stcg' ? a.stcg.gain : a.ltcg.gain;
        const valB = sortConfig.key === 'stcg' ? b.stcg.gain : b.ltcg.gain;
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [holdings, sortConfig]);

  const handleSort = (key: 'stcg' | 'ltcg') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-[#131722] border-0 shadow-sm mt-4 flex flex-col transition-colors duration-300">
      <div 
        className="transition-[max-height] duration-700 ease-in-out overflow-hidden"
        style={{ maxHeight: showAll ? '3000px' : '430px' }}
      >
        <Table>
        <TableHeader className="bg-[#F4F5F6] dark:bg-[#1B1E27] border-b-0 transition-colors duration-300">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="w-[50px] text-center pl-6 py-4">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                aria-label="Select all"
                className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </TableHead>
            <TableHead className="text-slate-900 dark:text-slate-300 font-semibold py-4">Asset</TableHead>
            <TableHead className="text-slate-900 dark:text-slate-300 font-semibold py-4 text-right">
              <div className="flex flex-col items-end">
                <span>Holdings</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">Avg Buy Price</span>
              </div>
            </TableHead>
            <TableHead className="text-slate-900 dark:text-slate-300 font-semibold py-4 text-right">Current Price</TableHead>
            <TableHead 
              className="text-slate-900 dark:text-slate-300 font-semibold py-4 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSort('stcg')}
            >
              <div className="flex items-center justify-end gap-1">
                Short-Term Gain 
                {sortConfig?.key === 'stcg' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="text-slate-900 dark:text-slate-300 font-semibold py-4 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={() => handleSort('ltcg')}
            >
              <div className="flex items-center justify-end gap-1">
                Long-Term Gain 
                {sortConfig?.key === 'ltcg' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <ArrowDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-slate-900 dark:text-slate-300 font-semibold py-4 pr-6 text-right">Amount to Sell</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHoldings.map((holding) => {
            const isSelected = selectedCoins.has(holding.coin);
            
            return (
              <TableRow
                key={holding.coin}
                className={`border-b border-slate-100 dark:border-slate-800 transition-colors duration-300 ${isSelected ? "bg-[#F2F6FF] dark:bg-[#1A2542] hover:bg-[#F2F6FF] dark:hover:bg-[#1A2542]" : "bg-white dark:bg-[#131722] hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                <TableCell className="text-center pl-6 py-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectCoin(holding.coin, checked as boolean)}
                    aria-label={`Select ${holding.coinName}`}
                    className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <img src={holding.logo} alt={holding.coinName} className="w-8 h-8 rounded-full" />
                    <div className="text-left">
                      <div className="text-[15px] font-medium text-slate-900 dark:text-slate-200">{holding.coinName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{holding.coin}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[15px] font-medium text-slate-900 dark:text-slate-200">
                      {holding.totalHolding.toLocaleString("en-US", { maximumFractionDigits: 5 })} {holding.coin}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      $ {holding.averageBuyPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <span className="text-[15px] font-medium text-slate-900 dark:text-slate-200">
                    $ {holding.currentPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </span>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-[15px] font-medium ${holding.stcg.gain >= 0 ? "text-[#00B152]" : "text-[#FF3F3F]"}`}>
                      {formatCurrency(holding.stcg.gain, holding.stcg.gain < 0)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {holding.stcg.balance.toLocaleString("en-US", { maximumFractionDigits: 3 })} {holding.coin}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`text-[15px] font-medium ${holding.ltcg.gain >= 0 ? "text-[#00B152]" : "text-[#FF3F3F]"}`}>
                      {formatCurrency(holding.ltcg.gain, holding.ltcg.gain < 0)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {holding.ltcg.balance.toLocaleString("en-US", { maximumFractionDigits: 3 })} {holding.coin}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <div className="text-[15px] font-medium text-slate-900 dark:text-slate-200">
                    {isSelected ? `${holding.totalHolding.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${holding.coin}` : "-"}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </div>
      
      {holdings.length > 5 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#131722] transition-colors duration-300">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 font-medium hover:underline text-[15px] px-2 py-1 transition-colors"
          >
            {showAll ? "Show less" : "View all"}
          </button>
        </div>
      )}
    </div>
  );
};

export default HoldingsTable;
