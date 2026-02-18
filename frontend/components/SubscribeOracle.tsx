"use client";
import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

export default function SubscribeOracle() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    // For now, we'll send this to your Discord so you see the "Lead" immediately
    try {
      await fetch(process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "📧 **NEW ORACLE SUBSCRIBER**",
          embeds: [{
            title: "Market Intel Lead",
            description: `Subscriber: **${email}**`,
            color: 10181046,
            footer: { text: "Nexus Intel | Lead Gen" }
          }]
        })
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <section className="bg-blue-600/10 border border-blue-500/20 rounded-[3rem] p-10 mt-12 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Mail size={120} className="text-blue-500" />
      </div>
      
      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Join the Inner Circle</span>
        </div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Get the Weekly Strategic Oracle</h3>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Join 500+ infrastructure leads receiving autonomous market analysis. No spam. Just raw intelligence.
        </p>

        {status === "success" ? (
          <div className="py-4 px-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-sm">
            Access Granted. Welcome to the Oracle.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              required
              placeholder="vanguard@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500 transition-all text-sm"
            />
            <button 
              disabled={status === "loading"}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
            >
              {status === "loading" ? "Processing..." : "Secure Access"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}