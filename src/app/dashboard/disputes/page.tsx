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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredDisputes = disputes.filter(d => 
    d.creditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bureau.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Active", value: disputes.filter(d => d.status === "Sent").length, icon: Zap, color: "text-primary-blue", bg: "bg-primary-blue/5" },
    { label: "Drafts", value: disputes.filter(d => d.status === "Draft").length, icon: FileText, color: "text-amber-500", bg: "bg-amber-50/50" },
    { label: "Successful", value: disputes.filter(d => d.status === "Completed").length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50/50" },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <Activity className="w-5 h-5 text-primary-blue" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Operational Guidance Active</span>
          </div>
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Dispute Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Active management for your {disputes.length} ongoing credit audits.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/disputes/new" className="btn-primary group flex items-center gap-3 py-4 px-8 shadow-2xl uppercase tracking-widest text-[10px] font-bold italic">
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Launch New Case</span>
          </Link>
        </div>
      </div>

      {/* DISPUTE INTELLIGENCE - CATEGORY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <IntelligenceTile 
            title="Identity Theft" 
            desc="Items appearing due to fraud or stolen credentials." 
            icon={<ShieldCheck className="w-5 h-5" />}
         />
         <IntelligenceTile 
            title="Duplicate Info" 
            desc="The same account reported multiple times." 
            icon={<Briefcase className="w-5 h-5" />}
         />
         <IntelligenceTile 
            title="Balance Errors" 
            desc="Inaccurate balances or payment histories." 
            icon={<TrendingUp className="w-5 h-5" />}
         />
         <IntelligenceTile 
            title="Outdated Data" 
            desc="Items older than 7 years (10 for BK)." 
            icon={<Clock className="w-5 h-5" />}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            {/* Main Content */}
            <div className="premium-card overflow-hidden">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div className="relative flex-1 max-w-lg group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                  <input 
                     type="text" 
                     placeholder="Search ledger by creditor or bureau..."
                     className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  </div>
               </div>

               <div className="divide-y divide-slate-100">
                  {loading ? (
                  <div className="p-32 text-center flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-primary-blue/10 border-t-primary-blue rounded-full animate-spin" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Ledger...</p>
                  </div>
                  ) : filteredDisputes.length === 0 ? (
                  <div className="p-32 text-center space-y-8 bg-slate-50/10">
                     <div className="w-32 h-32 bg-white rounded-[3rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-200 shadow-2xl relative rotate-2">
                        <TrendingUp className="w-12 h-12" />
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-extrabold text-slate-800 uppercase font-outfit tracking-tight italic">Ledger Inactive</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">No active cases detected. Review the &quot;Before You Launch&quot; checklist to identify your first mission target.</p>
                     </div>
                  </div>
                  ) : (
                  filteredDisputes.map((d) => {
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
                                 <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40 italic">{d.bureau.slice(0, 3)}</span>
                                 <Briefcase className="w-7 h-7" />
                              </div>
                              
                              <div className="space-y-1.5">
                                 <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors leading-none italic uppercase">
                                       {d.creditorName}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border italic ${statusColors[d.status as keyof typeof statusColors] || statusColors.Draft}`}>
                                       {d.status}
                                    </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    <span className="flex items-center gap-1.5 italic"><ShieldCheck className="w-4 h-4" /> {d.bureau} Audit</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-1.5 text-primary-navy/40 italic"><History className="w-4 h-4" /> {formatDisplayDate(d.updatedAt)}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-6 mt-8 lg:mt-0">
                              <div className="text-right hidden sm:block">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Current Goal</p>
                                 <p className="text-sm font-bold text-primary-navy uppercase italic">{d.status === 'Sent' ? "Monitor Return" : "Export Forge"}</p>
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
         </div>

         <div className="lg:col-span-4 space-y-10">
            <SectionHeader title="Preparation Integrity" />
            <div className="premium-card p-8 space-y-8 bg-primary-navy text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16" />
               <div className="space-y-6 relative z-10">
                  <h4 className="font-bold uppercase tracking-[0.2em] text-secondary-teal text-[10px] italic">Before You Launch</h4>
                  <div className="space-y-4">
                     <CheckItem text="Verify report item is inaccurate." />
                     <CheckItem text="Gather proof of payment or ID." />
                     <CheckItem text="Select the correct dispute logic." />
                     <CheckItem text="Ensure vault docs are up to date." />
                  </div>
               </div>
            </div>

            <div className="premium-card p-10 flex flex-col justify-center space-y-6 border-dashed border-2 border-slate-200">
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Strength of Evidence</p>
                  <h4 className="text-2xl font-bold text-primary-navy font-outfit uppercase italic leading-tight">Mailing Strategy</h4>
               </div>
               <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider italic">Sending disputes via Certified Mail with Return Receipt is the gold standard for tracking bureau response times.</p>
               <div className="flex items-center gap-4 pt-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                     <span className="text-primary-navy italic">Sovereign Protocol</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function IntelligenceTile({ title, desc, icon }: { title: string, desc: string, icon: any }) {
   return (
      <div className="premium-card p-6 space-y-4 border hover:border-primary-blue transition-all group">
         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary-navy group-hover:bg-primary-blue group-hover:text-white transition-all">
            {icon}
         </div>
         <div className="space-y-1">
            <h5 className="font-bold text-xs uppercase tracking-widest text-primary-navy italic">{title}</h5>
            <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{desc}</p>
         </div>
      </div>
   );
}

function CheckItem({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-3">
         <div className="w-4 h-4 bg-white/10 rounded flex items-center justify-center mt-0.5">
            <div className="w-1.5 h-1.5 bg-secondary-teal rounded-full" />
         </div>
         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 italic">{text}</span>
      </div>
   );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 italic border-l-4 border-primary-blue/30 pl-4">
      {title}
    </h3>
  );
}
function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
