"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NexusDashboard() {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeCompany, setActiveCompany] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  // 3. Lead Capture Logic (Discord Webhook)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const message = {
      content: "🚀 **New Lead from Nexus Intelligence!**",
      embeds: [{
        title: "Inquiry Details",
        color: 5814783,
        fields: [
          { name: "Name", value: formData.get("name") as string, inline: true },
          { name: "Email", value: formData.get("email") as string, inline: true },
          { name: "Project", value: formData.get("message") as string }
        ]
      }]
    };

    // PASTE YOUR DISCORD WEBHOOK URL HERE
    const WEBHOOK_URL = "https://discord.com/api/webhooks/1470821046708863150/lkwmxFSUy1JQhii5rMyX4TwuI-D2-hkcKUK0tPhoIETW6b7tbpEnNUQJGU8cW0YPs7iY";

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      alert("Message sent! I'll get back to you ASAP.");
      setIsModalOpen(false);
    } catch (err) {
      alert("Error sending message. Please email me at iambel0ved@outlook.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-black min-h-screen text-white pb-20 relative">
      
      {/* NAV */}
      <nav className="w-full flex justify-center border-b border-white/10 h-16 sticky top-0 bg-black/80 backdrop-blur-md z-40">
        <div className="w-full max-w-6xl flex justify-between items-center px-6">
          <span className="font-black text-xl tracking-tighter text-blue-500">NEXUS INTEL</span>
          <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">2026 MARKET DATA</span>
        </div>
      </nav>

      <div className="w-full max-w-6xl px-6 flex flex-col gap-8 mt-12">
        <header>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">AI Price <span className="text-blue-500 text-glow">Surveillance</span></h1>
          <p className="text-slate-400 mt-2 max-w-xl">Don't overpay for tokens. Filter 17+ providers to find the most efficient infrastructure for your scale.</p>
        </header>

        {/* ORGANIZATION TABS */}
        <div className="w-full flex gap-2 overflow-x-auto py-4 scrollbar-hide border-b border-white/5">
          {companies.map((company) => (
            <button
              key={company}
              onClick={() => setActiveCompany(company)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeCompany === company 
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {company}
            </button>
          ))}
        </div>

        {/* ORGANIZED GRID */}
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPlans.map((plan, i) => (
            <div key={i} className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">{plan.companies?.name}</p>
              <h3 className="text-md font-medium text-slate-200 mt-1">{plan.plan_name}</h3>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">${plan.price_value}</span>
                <span className="text-[10px] text-slate-500 font-mono">/ 1M Tokens</span>
              </div>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
            </div>
          ))}
        </main>
      </div>

      {/* FAB */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-110 active:scale-95 transition-all z-50 border border-blue-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {/* LEAD CAPTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] max-w-md w-full relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">✕</button>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Hire Me</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Let&apos;s build an autonomous system for your business. Drop your details below.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="name" required type="text" placeholder="Your Name" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors" />
              <input name="email" required type="email" placeholder="Your Email" className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors" />
              <textarea name="message" required placeholder="Project details..." rows={3} className="bg-black/50 border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors" />
              <button disabled={loading} className="bg-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all disabled:opacity-50">
                {loading ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}