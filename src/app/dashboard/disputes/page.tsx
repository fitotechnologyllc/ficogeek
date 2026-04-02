"use client";

import { useEffect, useState } from "react";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  ChevronRight, 
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertCircle,
  Briefcase,
  History,
  Activity,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { Dispute } from "@/lib/schema";
import { formatDisplayDate } from "@/lib/utils";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchDisputes = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "disputes"), 
        where("ownerUID", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setDisputes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [user]);

  const stats = [
    { label: "Active", value: disputes.filter(d => d.status === "Sent").length, icon: Zap, color: "text-primary-blue", bg: "bg-primary-blue/5" },
    { label: "Drafts", value: disputes.filter(d => d.status === "Draft").length, icon: FileText, color: "text-amber-500", bg: "bg-amber-50/50" },
    { label: "Successful", value: disputes.filter(d => d.status === "Completed").length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50/50" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Activity className="w-5 h-5 text-primary-blue" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sovereign Dispute Ledger</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Dispute Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Active management for your {disputes.length} ongoing credit disputes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-primary-navy rounded-2xl transition-all shadow-sm">
             <Filter className="w-5 h-5" />
          </button>
          <button className="btn-primary group flex items-center gap-3 py-4 px-8 shadow-2xl">
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Launch New Dispute</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="premium-card p-6 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
             <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{s.label} Cases</span>
                <p className="text-3xl font-bold font-outfit text-primary-navy">{s.value}</p>
             </div>
             <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                <s.icon className="w-7 h-7" />
             </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="relative flex-1 max-w-lg group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Search disputes by reference, bureau or creditor..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-primary-blue/10 border-t-primary-blue rounded-full animate-spin" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Ledger...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="p-32 text-center space-y-8 bg-slate-50/10">
               <div className="w-32 h-32 bg-white rounded-[3rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-200 shadow-2xl relative">
                  <TrendingUp className="w-12 h-12" />
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-slate-800 uppercase font-outfit tracking-tight">Ledger Empty</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">No active disputes detected. Launch a case to begin your credit optimization journey.</p>
               </div>
            </div>
          ) : (
            disputes.map((d) => {
              const statusColors = {
                Draft: "bg-slate-100 text-slate-500 border-slate-200",
                Pending: "bg-amber-50 text-amber-600 border-amber-100",
                Sent: "bg-primary-blue/5 text-primary-blue border-primary-blue/10 font-bold",
                Completed: "bg-emerald-50 text-emerald-600 border-emerald-100 font-bold",
                Rejected: "bg-red-50 text-red-600 border-red-100",
              };

              return (
                <Link key={d.id} href={`/dashboard/disputes/${d.id}`}>
                  <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-slate-50 group transition-all border-l-4 border-transparent hover:border-primary-blue cursor-pointer">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center transition-all group-hover:bg-primary-navy group-hover:text-white group-hover:rotate-6 group-hover:scale-105 duration-500">
                          <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">{d.bureau.slice(0, 3)}</span>
                          <Briefcase className="w-7 h-7" />
                       </div>
                       
                       <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                             <h3 className="text-2xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors">
                                {d.creditorName}
                             </h3>
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColors[d.status as keyof typeof statusColors] || statusColors.Draft}`}>
                                {d.status}
                             </span>
                             {d.clientId && (
                               <div className="px-2 py-1 rounded bg-secondary-teal/10 text-secondary-teal text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Client File
                               </div>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                             <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {d.bureau} Audit</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <span className="flex items-center gap-1.5 text-primary-navy/40"><History className="w-4 h-4" /> {formatDisplayDate(d.updatedAt)}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <span className="flex items-center gap-1.5 uppercase bg-slate-100 px-2 py-0.5 rounded text-[8px]">{d.reason.replace(/_/g, ' ')}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 mt-8 lg:mt-0">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Action</p>
                          <p className="text-sm font-bold text-primary-navy">{d.status === 'Sent' ? "Wait 30 Days" : "Export Letter"}</p>
                       </div>
                       <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-300 group-hover:border-primary-blue group-hover:bg-primary-blue group-hover:text-white flex items-center justify-center transition-all shadow-sm group-hover:shadow-xl">
                          <ChevronRight className="w-6 h-6" />
                       </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Knowledge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="premium-card p-8 bg-gradient-to-br from-primary-navy to-slate-900 border-none text-white flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-blue/10 blur-[50px] -mr-10 -mt-10 group-hover:bg-primary-blue/20 transition-all" />
            <div className="space-y-4 relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-blue">
                  <AlertCircle className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <h4 className="text-xl font-bold font-outfit">Legislative Update</h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-xs">New FCRA compliance rules for medical collections take effect next month. Review your active cases.</p>
               </div>
               <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-blue hover:text-white transition-colors pt-2">
                  Read Analysis <ArrowRight className="w-4 h-4" />
               </button>
            </div>
            <div className="hidden lg:block relative z-10 pr-4 opacity-50 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
               <History className="w-24 h-24 stroke-[1px]" />
            </div>
         </div>

         <div className="premium-card p-10 flex flex-col justify-center space-y-6 border-dashed border-2 border-slate-200">
            <div className="space-y-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Educational Resource</p>
               <h4 className="text-2xl font-bold text-primary-navy font-outfit leading-tight">Mastering the &quot;609&quot; Dispute Logic</h4>
            </div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed italic">&quot;The power of the FCRA lies not in your ability to prove the data is wrong, but in the bureau&apos;s inability to prove it&apos;s right. Every document counts.&quot;</p>
            <div className="flex items-center gap-4 pt-2">
               <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span className="text-primary-navy">Sovereign Academy</span> • 4 min read
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
