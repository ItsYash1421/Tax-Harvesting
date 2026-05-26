import { useEffect, useState, useMemo } from "react";
import { fetchCapitalGains, fetchHoldings } from "./services/api";
import type { CapitalGains, Holding } from "./services/api";
import HarvestingCard from "./components/HarvestingCard";
import HoldingsTable from "./components/HoldingsTable";
import { Loader2, Info, ChevronDown, Moon, Sun } from "lucide-react";
import logoUrl from "./assets/Logo.png";

function App() {
  const [initialGains, setInitialGains] = useState<CapitalGains | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gainsData, holdingsData] = await Promise.all([
          fetchCapitalGains(),
          fetchHoldings()
        ]);
        setInitialGains(gainsData.capitalGains);
        setHoldings(holdingsData);
        setSelectedCoins(new Set());
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const postHarvestingGains = useMemo(() => {
    if (!initialGains) return null;

    const postData: CapitalGains = {
      stcg: { ...initialGains.stcg },
      ltcg: { ...initialGains.ltcg }
    };

    holdings.forEach(holding => {
      if (selectedCoins.has(holding.coin)) {
        if (holding.stcg.gain > 0) {
          postData.stcg.profits += holding.stcg.gain;
        } else {
          postData.stcg.losses += Math.abs(holding.stcg.gain);
        }

        if (holding.ltcg.gain > 0) {
          postData.ltcg.profits += holding.ltcg.gain;
        } else {
          postData.ltcg.losses += Math.abs(holding.ltcg.gain);
        }
      }
    });

    return postData;
  }, [initialGains, holdings, selectedCoins]);

  const handleSelectCoin = (coin: string, selected: boolean) => {
    setSelectedCoins(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(coin);
      } else {
        newSet.delete(coin);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCoins(new Set(holdings.map(h => h.coin)));
    } else {
      setSelectedCoins(new Set());
    }
  };

  if (loading || !initialGains || !postHarvestingGains) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0B0E14]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading portfolio data...</p>
      </div>
    );
  }

  const preRealisedGains = (initialGains.stcg.profits - initialGains.stcg.losses) + (initialGains.ltcg.profits - initialGains.ltcg.losses);
  const postRealisedGains = (postHarvestingGains.stcg.profits - postHarvestingGains.stcg.losses) + (postHarvestingGains.ltcg.profits - postHarvestingGains.ltcg.losses);
  const totalSavings = preRealisedGains - postRealisedGains;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#131722] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="KoinX Logo" className="h-[70px] object-contain" />
          </div>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            <Sun className={`absolute w-5 h-5 transition-all duration-500 ease-in-out ${isDark ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`} />
            <Moon className={`absolute w-5 h-5 transition-all duration-500 ease-in-out ${isDark ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50"}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-6">
        
        <div className="flex items-baseline gap-4 relative z-20">
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white">Tax Harvesting</h1>
          <div className="relative group flex items-center h-full">
            <a href="#" className="text-blue-600 hover:underline text-sm font-medium">How it works?</a>
            
            {/* Tooltip (Dark in light mode, White in dark mode) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[360px] bg-[#0F1629] dark:bg-white shadow-2xl rounded-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              {/* Tooltip Arrow */}
              <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0F1629] dark:bg-white rotate-45 rounded-sm transition-colors duration-300"></div>
              
              <div className="relative z-10 text-[13px] leading-[1.6] text-slate-200 dark:text-slate-800 transition-colors duration-300">
                Lorem ipsum dolor sit amet consectetur. Euismod id posuere nibh semper mattis scelerisque tellus. Vel mattis diam duis morbi tellus dui consectetur. <a href="#" className="text-[#3E74FF] dark:text-blue-600 underline underline-offset-2 hover:text-blue-300 dark:hover:text-blue-700 transition-colors">Know More</a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Accordion */}
        <div className="bg-[#EBF2FF] dark:bg-[#1A2542] rounded-xl border border-blue-100 dark:border-blue-900/30 transition-colors duration-300">
          <button 
            className="w-full px-6 py-4 flex items-center justify-between text-left"
            onClick={() => setDisclaimerOpen(!disclaimerOpen)}
          >
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-semibold">
              <Info className="w-5 h-5 text-blue-600" />
              Important Notes & Disclaimers
            </div>
            <div className={`text-slate-500 dark:text-slate-400 transition-transform duration-300 ${disclaimerOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </button>
          
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${disclaimerOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="px-6 pb-4 pt-0 text-[15px] text-slate-800 dark:text-slate-300">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.</li>
                  <li>Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.</li>
                  <li>Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.</li>
                  <li>Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.</li>
                  <li>Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <HarvestingCard 
            title="Pre Harvesting" 
            data={initialGains} 
            variant="pre"
          />
          <HarvestingCard
            title="After Harvesting"
            data={postHarvestingGains}
            variant="post"
            preRealisedGains={preRealisedGains}
          />
        </div>

        {/* Table */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Holdings</h2>
          <HoldingsTable 
            holdings={holdings}
            selectedCoins={selectedCoins}
            onSelectCoin={handleSelectCoin}
            onSelectAll={handleSelectAll}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
