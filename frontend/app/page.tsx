"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import RecentActivity from "@/components/RecentActivity";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import IntelligenceInsight from "@/components/IntelligenceInsight";
import { downloadIntelligenceReport } from "@/utils/exportReport";
import { Download, Rocket, ShieldCheck, Zap } from "lucide-react";

export default function NexusDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]); 
  const [latestIntelligence, setLatestIntelligence] = useState<any>(null);
  const [activeCompany, setActiveCompany] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const supabase = createClient();

  // 1. Fetch Plan Data
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

  // 2. Fetch Historical Snapshots & Latest AI Insight
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

  // 3. Organization Logic
  const companies = ["All", ...new Set(plans.map((p) => p.companies?.name).filter(Boolean))];
  const filteredPlans = activeCompany === "All" 
    ? plans 
    : plans.filter((p) => p.companies?.name === activeCompany);

  // 4. Lead Capture Logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const discordMessage = {
      content: "🚀 **New AI Automation Lead: Nexus Intelligence**",
      embeds: [{
        title: "Specialist Inquiry",
        color: 3447003,
        fields: [
          { name: "Client", value: formData.get("name") as string, inline: true },
          { name: "Email", value: formData.get("email") as string, inline: true },
          { name: "Requirement", value: formData.get("message") as string }
        ],
        footer: { text: "Nexus Surveillance Engine | Built for 2026 Economy" },
        timestamp: new Date().toISOString()
      }]
    };

    const WEBHOOK_URL = "https://discord.com/api/webhooks/1470821046708863150/lkwmxFSUy1JQhii5rMyX4TwuI-D2-hkcKUK0tPhoIETW6b7tbpEnNUQJGU8cW0YPs7iY";

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
      });
      setSubmitted(true);
      setTimeout(() => { setIsModalOpen(false); setSubmitted(false); }, 4000);
    } catch (err) { alert("Error sending message."); } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-black min-h-screen text-white pb-20 relative selection:bg-blue-500/30">
      
      {/* NAV */}
      <nav className="w-full flex justify-center border-b border-white/10 h-16 sticky top-0 bg-black/80 backdrop-blur-md z-40 px-6">
        <div className="w-full max-w-7xl flex justify-between items-center">
          <span className="font-black text-xl tracking-tighter text-blue-500 uppercase">Nexus Intel</span>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Verified</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Surveillance</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-7xl px-6 flex flex-col gap-10 mt-16">
        {/* HERO */}
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            Market <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed font-medium">
            Autonomous cost-tracking for 17+ AI providers. Standardizing infrastructure data for the <span className="text-white">2026 token economy.</span>
          </p>
        </header>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: CHART & PRICING */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Intelligence Trend Panel */}
            <section className="p-1 rounded-[3rem] bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-white/5 shadow-2xl">
                <div className="bg-slate-950/90 rounded-[2.9rem] p-8">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-mono text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <Zap size={14} /> Pricing Trajectory — {activeCompany}
                        </h3>
                    </div>
                    <PriceHistoryChart data={history} />
                </div>
            </section>

            {/* COMPANY FILTERS & EXPORT */}
            <div className="flex flex-wrap gap-2 items-center border-b border-white/5 pb-6">
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                {companies.map((company) => (
                  <button
                    key={company}
                    onClick={() => setActiveCompany(company)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                      activeCompany === company 
                      ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>

              <button
                onClick={() => downloadIntelligenceReport(filteredPlans, activeCompany)}
                className={`
                  ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300
                  ${activeCompany === "All" 
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-blue-500 hover:text-white" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }
                  text-[10px] font-black uppercase tracking-widest group
                `}
              >
                <Download size={14} className="group-hover:scale-110 transition-transform" />
                <span>Export Intel</span>
                {activeCompany === "All" && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </button>
            </div>

            {/* PRICING GRID */}
            <main className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlans.map((plan, i) => (
                <div key={i} className="group relative p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 flex flex-col shadow-2xl overflow-hidden">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                    {plan.companies?.name || "AI Provider"}
                  </span>
                  <h2 className="text-lg font-medium text-slate-200 group-hover:text-white transition-colors">
                    {plan.plan_name}
                  </h2>
                  <div className="flex items-baseline gap-1 mt-6">
                    <span className="text-3xl font-bold text-white tracking-tight">${plan.price_value}</span>
                    <span className="text-slate-500 text-[10px] font-mono">/ 1M Tokens</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-colors" />
                </div>
              ))}
            </main>
          </div>

          {/* RIGHT: ACTIVITY FEED & INSIGHTS */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <IntelligenceInsight insight={latestIntelligence} />
            
            <div className="bg-slate-900/20 p-6 rounded-[2rem] border border-white/5">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-500" />
                Live Activity Log
              </h3>
              <RecentActivity />
            </div>
          </aside>

        </div>

        {/* NEW: HIRE ME SECTION (PHASE 6) */}
        <section className="mt-20 p-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.2)]">
          <div className="bg-slate-950 rounded-[2.8rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-blue-400 mb-4">
                <Rocket size={20} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Specialist Services</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter">Hire me for AI Automation</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                I architect autonomous surveillance systems, custom scrapers, and high-performance AI dashboards. 
                Need this level of intelligence for your business? <span className="text-white">Let's build it.</span>
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[250px]">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-center hover:bg-blue-500 hover:scale-[1.02] transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2"
              >
                Start Your Project
              </button>
              <div className="flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                <span className="flex items-center gap-1"><div className="h-1 w-1 bg-emerald-500 rounded-full"/> Custom Pipelines</span>
                <span className="flex items-center gap-1"><div className="h-1 w-1 bg-emerald-500 rounded-full"/> AI Strategy</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-110 active:scale-95 transition-all z-50 border border-blue-400 group"
      >
        <div className="absolute right-20 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-blue-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Hire a Specialist ⚡️
        </div>
        <Rocket className="text-white" size={24} />
      </button>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl">
            {!submitted ? (
              <>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors text-xl">✕</button>
                <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">Let's Build</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Currently accepting new contracts for autonomous AI systems.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input name="name" required placeholder="Your Name" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors text-white placeholder:text-slate-600" />
                  <input name="email" required type="email" placeholder="Email Address" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors text-white placeholder:text-slate-600" />
                  <textarea name="message" required placeholder="How can I help you automate?" rows={3} className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors text-white placeholder:text-slate-600" />
                  <button disabled={loading} className="bg-blue-600 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all disabled:opacity-50 mt-2 text-white uppercase tracking-widest text-xs">
                    {loading ? "Establishing connection..." : "Send Brief"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10 flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Transmission Received</h2>
                <p className="text-slate-400">I'll review your project details and reach out shortly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}