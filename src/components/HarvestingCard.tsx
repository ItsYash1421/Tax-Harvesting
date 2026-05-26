import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CapitalGains } from "../services/api";
import { cn } from "@/lib/utils";

interface HarvestingCardProps {
  title: string;
  data: CapitalGains;
  variant: "pre" | "post";
  preRealisedGains?: number;
}

const HarvestingCard: React.FC<HarvestingCardProps> = ({ title, data, variant, preRealisedGains }) => {
  const netStcg = data.stcg.profits - data.stcg.losses;
  const netLtcg = data.ltcg.profits - data.ltcg.losses;
  const realisedGains = netStcg + netLtcg;

  const isPost = variant === "post";

  const cardClasses = isPost
    ? "bg-[#1B72FF] text-white border-0 shadow-lg transition-colors duration-300"
    : "bg-white dark:bg-[#131722] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-md transition-colors duration-300";

  const formatCurrency = (val: number, isLoss = false) => {
    const formatted = Math.abs(val).toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (isLoss) return `- $${formatted}`;
    return `$${formatted}`;
  };

  // Savings / loss logic (only for After Harvesting card)
  const savings = isPost && preRealisedGains !== undefined ? preRealisedGains - realisedGains : 0;
  const hasSavings = isPost && savings > 0;
  const hasLoss = isPost && savings < 0;

  return (
    <Card className={cn("w-full overflow-hidden flex flex-col", cardClasses)}>
      <CardHeader className="pb-1 pt-4 px-6">
        <CardTitle className="text-xl font-semibold flex justify-between items-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-1 pt-2 flex flex-col flex-1">
        {/* Data Grid */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2 text-sm">
          <div></div>
          <div className="text-right font-medium opacity-80">Short-term</div>
          <div className="text-right font-medium opacity-80">Long-term</div>

          <div className="font-medium opacity-80">Profits</div>
          <div className="text-right font-semibold">{formatCurrency(data.stcg.profits)}</div>
          <div className="text-right font-semibold">{formatCurrency(data.ltcg.profits)}</div>

          <div className="font-medium opacity-80">Losses</div>
          <div className="text-right font-semibold">{formatCurrency(data.stcg.losses, true)}</div>
          <div className="text-right font-semibold">{formatCurrency(data.ltcg.losses, true)}</div>

          <div className="font-semibold pt-2">Net Capital Gains</div>
          <div className="text-right font-semibold pt-2">{formatCurrency(netStcg, netStcg < 0)}</div>
          <div className="text-right font-semibold pt-2">{formatCurrency(netLtcg, netLtcg < 0)}</div>
        </div>

        {/* Realised Capital Gains */}
        <div className="pt-2 pb-1 flex flex-wrap items-center justify-between gap-2 md:gap-4">
          <div className="text-[15px] md:text-base font-semibold opacity-80">
            {isPost ? "Effective Capital Gains:" : "Realised Capital Gains:"}
          </div>
          <div className="text-2xl md:text-3xl font-bold">
            {formatCurrency(realisedGains, realisedGains < 0)}
          </div>
        </div>

        {/* Fixed-height banner — plain text, no box, no layout shift */}
        {isPost && (
          <div className="min-h-[32px] mt-1 flex items-center">
            {(hasSavings || hasLoss) && (
              <p className="text-[14px] font-medium">
                {hasSavings ? "🎉" : "📉"}{" "}
                {hasSavings
                  ? <>You are going to save upto <span className="font-bold">${savings.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span></>
                  : <>Your tax liability increases by <span className="font-bold">${Math.abs(savings).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span></>
                }
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HarvestingCard;
