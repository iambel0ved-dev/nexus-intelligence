"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, Calendar, Sparkles, Scroll } from "lucide-react";
import Link from "next/link";
import SubscribeOracle from "@/components/SubscribeOracle"; // Import the new component

export default function ReportsArchive() {
  const [reports, setReports] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReports() {
      const { data } = await supabase
        .from('intelligence_reports')
        .select('*')
        .order('created_at', { ascending: false });
      setReports(data || []);
    }
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100 pb-20">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-bold text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Live Feed
        </Link>

        <header className="mb-20">
          <div className="flex items-center gap-3 text-blue-600 mb-4">
            <BookOpen size={24} />
            <span className="font-black uppercase tracking-[0.3em] text-xs">Intelligence Archive</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            The Market <span className="italic font-serif">Oracle</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium leading-relaxed">
            Deep-dive analysis on AI infrastructure costs, standardized for the 2026 economy.
          </p>
        </header>

        <div className="space-y-32">
          {reports.length > 0 ? (
            <>
              {reports.map((report) => (
                <article key={report.id} className="group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(report.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      report.report_type === 'weekly' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {report.report_type === 'weekly' ? '🏛️ Strategic Report' : '📡 Daily Insight'}
                    </span>
                  </div>

                  {/* Markdown Content with Analyst Styling */}
                  <div className="prose prose-slate prose-headings:tracking-tighter prose-headings:font-black prose-p:leading-relaxed prose-p:text-slate-600 max-w-none">
                    <ReactMarkdown>
                      {report.content.weekly_report_markdown || report.content.market_insight}
                    </ReactMarkdown>
                  </div>

                  <div className="mt-10 p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={12} className="text-blue-600" />
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Executive Summary</h4>
                      </div>
                      <p className="text-sm text-slate-500 italic leading-relaxed">
                        "{report.content.market_insight}"
                      </p>
                    </div>
                    <Link 
                      href="/#hire" 
                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black hover:shadow-md hover:border-blue-200 transition-all whitespace-nowrap"
                    >
                      Discuss this Analysis
                    </Link>
                  </div>
                </article>
              ))}

              {/* NEW: Subscription Section at the bottom of reports */}
              <SubscribeOracle />
            </>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Awaiting Next Intelligence Cycle...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}