"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NexusDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeCompany, setActiveCompany] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const supabase = createClient();

  // 1. Fetch Data
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

  // 2. Organization Logic
  const companies = ["All", ...new Set(plans.map((p) => p.companies?.name))];
  const filteredPlans = activeCompany === "All" 
    ? plans 
    : plans.filter((p) => p.companies?.name === activeCompany);

  // 3. Lead Capture Logic (Discord Webhook + Success UI)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const project = formData.get("message") as string;

    const discordMessage = {
      content: "🚀 **New Business Lead: Nexus Intelligence**",
      embeds: [{
        title: "Inquiry Details",
        color: 3447003, // Professional Blue
        fields: [
          { name: "Name", value: name, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Project Detail", value: project }
        ],
        footer: { text: "2026 Surveillance Engine" },
        timestamp: new Date().toISOString()
      }]
    };

    // PASTE YOUR DISCORD WEBHOOK URL HERE
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1470821046708863150/lkwmxFSUy1JQhii5rMyX4TwuI-D2-hkcKUK0tPhoIETW6b7tbpEnNUQJGU8cW0YPs7iY";

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
      });
      
      // Custom Success Flow
      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
      }, 4000);
      
    } catch (err) {
      alert("Error sending message. Please reach out to iambel0ved@outlook.com directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-black min-h-screen text-white pb-20 relative selection:bg-blue-500/30">
      
      {/* NAV */}
      <nav className="w-full flex justify-center border-b border-white/10 h-16 sticky top-0 bg-black/80 backdrop-blur-md z-40 px-6">
        <div className="w-full max-w-6xl flex justify-between items-center">
          <span className="font-black text-xl tracking-tighter text-blue-500">NEXUS INTEL</span>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Surveillance</span>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-6xl px-6 flex flex-col gap-10 mt-16">
        {/* HERO */}
        <header className="flex flex-col gap-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            Market <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Autonomous cost-tracking for 17+ AI providers. Standardizing infrastructure data for the 2026 token economy.
          </p>
        </header>

        {/* TABS FOR ORGANIZATION */}
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar border-b border-white/5 scroll-smooth">
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

        {/* ORGANIZED GRID */}
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:scale-110 active:scale-95 transition-all z-50 border border-blue-400 group"
      >
        <div className="absolute right-20 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-blue-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Hire an Specialist ⚡️
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {/* LEAD CAPTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl">
            {!submitted ? (
              <>
                <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors text-xl">✕</button>
                <h2 className="text-3xl font-bold mb-2 tracking-tighter">Hire Me</h2>
                <p className="text-slate-400 text-sm mb-8">Building autonomous pipelines and AI infrastructure. Drop your project details below.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input name="name" required placeholder="Name" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors" />
                  <input name="email" required type="email" placeholder="Email Address" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors" />
                  <textarea name="message" required placeholder="Project description..." rows={3} className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:border-blue-500 outline-none transition-colors" />
                  <button disabled={loading} className="bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all disabled:opacity-50 mt-2">
                    {loading ? "Establishing connection..." : "Send Inquiry"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Success!</h2>
                <p className="text-slate-400">Inquiry captured. I will contact you via email shortly.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}