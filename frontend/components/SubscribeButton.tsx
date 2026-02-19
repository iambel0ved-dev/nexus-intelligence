"use client"
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SubscribeButton({ companyId, companyName }: { companyId: string, companyName: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    // Insert into Supabase
    const { error } = await supabase
      .from('price_subscriptions')
      .insert([{ email, company_id: companyId }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint error
        setMessage({ type: 'success', text: "You're already subscribed!" });
      } else {
        setMessage({ type: 'error', text: 'Something went wrong. Try again later.' });
      }
    } else {
      setMessage({ type: 'success', text: `Success! Monitoring ${companyName} for you.` });
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 backdrop-blur-sm">
      <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest mb-3">Live Price Alerts</h4>
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
        <input 
          type="email" 
          value={email}
          placeholder="Enter intelligence recipient..."
          className="bg-black/40 border border-zinc-700 text-sm px-3 py-2 rounded outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || message?.type === 'success'}
        />
        <button 
          type="submit"
          disabled={loading || message?.type === 'success'}
          className="bg-zinc-100 hover:bg-white text-black font-bold text-xs py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "ENROLLING..." : "SUBSCRIBE TO UPDATES"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-[10px] font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}