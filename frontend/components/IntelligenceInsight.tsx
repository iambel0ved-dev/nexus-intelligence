"use client";

import { BrainCircuit, TrendingDown, TrendingUp } from "lucide-react";

export default function IntelligenceInsight({ insight }: { insight: any }) {
  if (!insight) return null;

  return (
    <div className="p-6 rounded-[2.5rem] bg-blue-500/10 border border-blue-500/20 backdrop-blur-md relative overflow-hidden group">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <BrainCircuit size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">
            AI Analyst Consensus
          </h4>
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {insight.market_impact || "Analyzing market shift patterns..."}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
              insight.analyst_tone === 'bullish' ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700 text-slate-500'
            }`}>
              {insight.analyst_tone}
            </span>
          </div>
        </div>
      </div>
      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <BrainCircuit size={120} />
      </div>
    </div>
  );
}