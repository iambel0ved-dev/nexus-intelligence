"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import RecentActivity from "@/components/RecentActivity";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import IntelligenceInsight from "@/components/IntelligenceInsight";
import { downloadIntelligenceReport } from "@/utils/exportReport";
import { Download, Rocket, ShieldCheck, Zap, ArrowRight, BarChart3, Clock, Table as TableIcon } from "lucide-react";
import Link from "next/link";

export default function NexusDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]); 
  const [latestIntelligence, setLatestIntelligence] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("pricing_plans")
        .select(`plan_name, price_value, updated_at, companies ( name )`)
        .order("price_value", { ascending: true });
      if (data) setPlans(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchIntelligence() {
      let historyQuery = supabase
        .from("price_snapshots")
        .select(`price_value, detected_at, companies ( name )`)
        .order("detected_at", { ascending: true });

      let aiQuery = supabase
        .from("price_history")
        .select(`ai_analysis, provider_name`)
        .not("ai_analysis", "is", null)
        .order("detected_at", { ascending: false })
        .limit(1);

      if (activeCompany !== "All") {
        historyQuery = historyQuery.filter("companies.name", "eq", activeCompany);
        aiQuery = aiQuery.filter("provider_name", "eq", activeCompany);
      }

      const [historyRes, aiRes] = await Promise.all([historyQuery, aiQuery]);
      
      if (historyRes.data) setHistory(historyRes.data);
      if (aiRes.data && aiRes.data[0]) setLatestIntelligence(aiRes.data[0].ai_analysis);
      else setLatestIntelligence(null);
    }
    fetchIntelligence();
  }, [activeCompany]);

  const companies = ["All", ...new Set(plans.map((p) => p.companies?.name).filter(Boolean))];
  const filteredPlans = activeCompany === "All" 
    ? plans 
    : plans.filter((p) => p.companies?.name === activeCompany);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const discordMessage = {
      content: "🚀 **New AI Automation Lead**",
      embeds: [{
        title: "Specialist Inquiry",
        color: 3447003,
        fields: [
          { name: "Client", value: formData.get("name") as string, inline: true },
          { name: "Email", value: formData.get("email") as string, inline: true },
          { name: "Requirement", value: formData.get("message") as string }
        ],
        footer: { text: "Nexus Intel | 2026" },
        timestamp: new Date().toISOString()
      }]
    };

    try {
      await fetch("YOUR_DISCORD_WEBHOOK_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
      });
      setSubmitted(true);
      setTimeout(() => { setIsModalOpen(false); setSubmitted(false); }, 4000);
    } catch (err) { alert("Error."); } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-black min-h-screen text-white pb-20 selection:bg-blue-500/30">
      
      {/* NAVIGATION */}
      <nav className="w-full flex justify-center border-b border-white/10 h-16 sticky top-0 bg-black/80 backdrop-blur-md z-40 px-6">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <Link href="/" className="font-black text-xl tracking-tighter text-blue-500 uppercase">Nexus Intel</Link>
          <div className="flex items-center gap-6">
            <Link href="/reports" className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Oracle Archive</Link>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Surveillance Active</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-7xl px-6 flex flex-col gap-10 mt-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            Infrastructure <span className="text-blue-500">Oracle</span>
          </h1>
          <p className="text-slate-500 max-w-xl text-sm md:text-base">
            Autonomous surveillance and standardized cost-tracking for the 2026 AI economy.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* CHART */}
            <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <BarChart3 size={16} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Price Trajectory: {activeCompany}</h3>
                </div>
                <div className="h-[350px]">
                    <PriceHistoryChart data={history} />
                </div>
            </section>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 items-center">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => setActiveCompany(company)}
                  className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                    activeCompany === company ? "bg-blue-600 border-blue-400 text-white" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                  }`}
                >
                  {company}
                </button>
              ))}
              <button onClick={() => downloadIntelligenceReport(filteredPlans, activeCompany)} className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition-all">
                <Download size={14} /> Export Intel
              </button>
            </div>

            {/* COMPARISON MATRIX */}
            <section className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/20">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon size={14} className="text-blue-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Market Comparison Matrix</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-600 uppercase">
                  Last Sync: {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="p-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Provider</th>
                      <th className="p-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Plan</th>
                      <th className="p-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Price (1M)</th>
                      <th className="p-5 text-[9px] font-black uppercase text-slate-500 tracking-widest">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPlans.slice(0, 6).map((plan, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-5 text-xs font-bold text-white">{plan.companies?.name}</td>
                        <td className="p-5 text-xs text-slate-400">{plan.plan_name}</td>
                        <td className="p-5 text-xs font-mono text-emerald-400">${plan.price_value}</td>
                        <td className="p-5 text-[9px] font-black text-slate-600 uppercase">Standardized</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PRICING GRID */}
            <main className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlans.map((plan, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-slate-900/60 border border-white/5 hover:border-blue-500/50 transition-all flex flex-col group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{plan.companies?.name}</span>
                    <Zap size={14} className="text-slate-800 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-6 leading-tight">{plan.plan_name}</h2>
                  <div className="flex items-baseline gap-1 mb-10">
                    <span className="text-3xl font-black text-white tracking-tighter">${plan.price_value}</span>
                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-widest">/ 1M Tokens</span>
                  </div>
                  <Link href="/reports" className="mt-auto pt-6 border-t border-white/5 text-[10px] font-black text-slate-500 hover:text-blue-400 transition-all flex items-center justify-between group/link uppercase tracking-[0.2em]">
                    Read Analysis <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
            </main>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <IntelligenceInsight insight={latestIntelligence} />
            <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-white/5">
              <div className="flex items-center gap-2 mb-6 text-slate-500">
                <Clock size={14} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Surveillance Log</h3>
              </div>
              <RecentActivity />
            </div>
          </aside>
        </div>

        {/* HIRE ME */}
        <section id="hire" className="mt-12 p-8 md:p-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-10 border border-blue-400/20 shadow-2xl">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6 border border-white/10">
               <ShieldCheck size={14} className="text-white" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Direct Hire Active</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">Need This Built for Your Firm?</h2>
            <p className="text-blue-100 text-lg font-medium leading-relaxed">
              I specialize in autonomous data architecture and AI-driven surveillance systems. Secure your infrastructure for the 2026 economy.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-12 py-6 bg-white text-blue-600 rounded-3xl font-black text-lg hover:scale-105 transition-all shadow-xl">
            Initiate Protocol
          </button>
        </section>
      </div>

      {/* FAB */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl z-50 group">
        <Rocket className="text-white group-hover:animate-bounce" size={24} />
      </button>

      {/* MODAL (Same as before, ensure Discord Webhook is correct) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-12 rounded-[3.5rem] max-w-md w-full relative">
            {!submitted ? (
              <>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white">✕</button>
                <h2 className="text-3xl font-black mb-10 tracking-tighter text-white">Project Inquiry</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input name="name" required placeholder="Full Name" className="bg-black/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500" />
                  <input name="email" required type="email" placeholder="Email" className="bg-black/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500" />
                  <textarea name="message" required placeholder="Requirements..." rows={4} className="bg-black/50 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500" />
                  <button disabled={loading} className="bg-blue-600 py-5 rounded-2xl font-black text-white uppercase text-xs tracking-widest">
                    {loading ? "Transmitting..." : "Send Brief"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10">
                <h2 className="text-3xl font-black text-white mb-2">Transmitted</h2>
                <p className="text-slate-400">Archived to specialist queue.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}