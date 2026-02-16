"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Using the client utility
import { ArrowDownIcon, ArrowUpIcon, Activity } from "lucide-react";

export default function RecentActivity() {
  const [activity, setActivity] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchActivity() {
      const { data } = await supabase
        .from("price_history")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(10);
      if (data) setActivity(data);
    }
    fetchActivity();
  }, []);

  if (activity.length === 0) return (
    <div className="p-8 border border-white/5 rounded-[2rem] bg-slate-900/20 text-slate-500 text-xs font-mono text-center">
      Waiting for market shifts...
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {activity.map((event) => (
        <div key={event.id} className="p-4 rounded-3xl bg-slate-900/40 border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${parseFloat(event.delta_percentage) < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {parseFloat(event.delta_percentage) < 0 ? <ArrowDownIcon size={14} /> : <ArrowUpIcon size={14} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{event.provider_name}</p>
              <p className="text-xs font-medium text-slate-200">{event.product_name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-xs font-bold ${parseFloat(event.delta_percentage) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {event.delta_percentage > 0 ? '+' : ''}{event.delta_percentage}%
            </p>
            <p className="text-[9px] font-mono text-slate-600 uppercase">
              {new Date(event.detected_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}