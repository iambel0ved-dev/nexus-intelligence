import { createClient } from "@/lib/supabase/server";

export default async function Index() {
  const supabase = await createClient();

  // Fetching your 17+ AI companies and their pricing data
  const { data: plans, error } = await supabase
    .from("pricing_plans")
    .select(`
      plan_name,
      price_value,
      updated_at,
      companies ( name )
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error.message);
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-black min-h-screen text-white pb-20 relative">
      
      {/* 1. FIXED NAVBAR */}
      <nav className="w-full flex justify-center border-b border-white/10 h-16 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6">
          <span className="font-black text-xl tracking-tighter text-blue-500">NEXUS INTEL</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Market Live</span>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-5xl px-6 flex flex-col gap-12 mt-12 animate-in fade-in duration-700 items-center">
        {/* 2. HERO SECTION */}
        <header className="flex flex-col gap-4 w-full">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            Market <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Automated surveillance of 17+ global AI providers. Real-time cost analysis for the 2026 token economy.
          </p>
        </header>

        {/* 3. ORGANIZED DASHBOARD GRID */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {plans?.map((plan: any, i: number) => (
            <div key={i} className="group relative p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-2xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-tighter">
                  {/* @ts-ignore */}
                  {plan.companies?.name || "AI Provider"}
                </span>
                <span className="text-[10px] text-slate-600 font-mono italic">
                   {new Date(plan.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <h2 className="text-xl font-medium text-slate-200 mb-2 group-hover:text-white transition-colors">
                {plan.plan_name}
              </h2>
              
              <div className="flex items-baseline gap-1 mt-auto pt-6">
                <span className="text-4xl font-bold text-white tracking-tight">${plan.price_value}</span>
                <span className="text-slate-500 text-xs font-mono">/ 1M Tokens</span>
              </div>
              
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-blue-600/10 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </main>

        {/* 4. FOOTER CONTACT SECTION */}
        <section className="mt-24 w-full max-w-2xl border-t border-white/10 pt-20 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need an Automation Specialist?</h2>
          <p className="text-slate-400 mb-8 max-w-md">
            I help startups build autonomous systems, AI pipelines, and real-time market tools like this one.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-sm md:max-w-none mb-10">
            <a 
              href="mailto:iambel0ved@outlook.com" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold transition-all text-center"
            >
              Book a Consultation
            </a>
            <a 
              href="https://contra.com/beloved_gapbldnr?referralExperimentNid=DEFAULT_REFERRAL_PROGRAM&referrerUsername=beloved_gapbldnr" 
              target="_blank" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all text-center"
            >
              Hire me on Contra
            </a>
          </div>
        </section>
      </div>

      {/* 5. FLOATING ACTION BUTTON (Visible on scroll) */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 group">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-blue-400 shadow-2xl mb-1">
          Let&apos;s build something great 🚀
        </div>
        <a 
          href="mailto:iambel0ved@outlook.com" 
          className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all border border-blue-400"
          title="Hire Me"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}