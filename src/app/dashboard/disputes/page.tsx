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
  ArrowRight,
  Sparkles,
  ExternalLink
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
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-primary-blue animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Audit Hub Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Dispute Hub</h1>
          <p className="text-slate-500 font-medium tracking-tight max-w-2xl text-lg">
            Review your credit reports, identify institutional inaccuracies, and launch targeted audits against the three major bureaus.
          </p>
        </div>
        <Link href="/dashboard/disputes/new" className="btn-primary group flex items-center gap-4 py-5 px-10 shadow-2xl uppercase tracking-widest text-[10px] font-bold italic">
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Launch New Case</span>
        </Link>
      </div>

      {/* DISPUTE PROTOCOL HERO */}
      <div className="premium-card p-1 text-white bg-primary-navy relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
         <div className="p-10 md:p-14 space-y-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary-teal/80 italic">The Sovereign Protocol</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tighter leading-none italic uppercase">Institutional Logic</h2>
                  <p className="text-slate-400 font-medium max-w-2xl text-lg italic">The FCRA (Section 611) mandates that bureaus must verify every challenged item. Use the intelligence below to identify your specific legal grounds.</p>
               </div>
               <div className="flex flex-wrap gap-4">
                   <a 
                     href="https://www.annualcreditreport.com" 
                     target="_blank" 
                     rel="noreferrer"
                     className="btn-primary bg-white text-primary-navy px-10 py-5 hover:bg-slate-50 border-none shadow-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 italic"
                   >
                     <ExternalLink className="w-4 h-4" /> Get Official Reports
                   </a>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
               <IntelligenceTile 
                  title="Identity Conflict" 
                  desc="Items appearing due to fraud, stolen credentials, or mixed bureau files." 
                  icon={<ShieldCheck className="w-6 h-6" />}
               />
               <IntelligenceTile 
                  title="Institutional Error" 
                  desc="Inaccurate balances, payment dates, or credit limits reported incorrectly." 
                  icon={<TrendingUp className="w-6 h-6" />}
               />
               <IntelligenceTile 
                  title="Duplication" 
                  desc="The same debt reported multiple times by different collection agencies." 
                  icon={<Briefcase className="w-6 h-6" />}
               />
               <IntelligenceTile 
                  title="Time Barred" 
                  desc="Negative items older than 7 years (10 for bankruptcy) must be purged." 
                  icon={<Clock className="w-6 h-6" />}
               />
            </div>
         </div>
      </div>

      {/* CHOOSE YOUR PATH */}
      <div className="space-y-8">
         <SectionHeader title="How would you like to start your dispute?" />
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/dashboard/ai?mode=intake" className="no-underline group">
               <div className="premium-card p-10 bg-primary-navy text-white space-y-10 border-2 border-transparent hover:border-secondary-teal transition-all shadow-[0_30px_60px_rgba(2,6,23,0.3)]">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-secondary-teal fill-secondary-teal" />
                        <span className="text-[10px] font-bold text-secondary-teal uppercase tracking-[0.3em] italic">Option A: AI-Guided</span>
                     </div>
                     <h3 className="text-4xl font-extrabold font-outfit italic tracking-tight uppercase leading-none">Agent Geek AI</h3>
                     <p className="text-slate-400 font-medium italic text-sm">Let our proprietary logic engine perform the intake. Geek will analyze your issue, suggest legal grounds, and forge your letter automatically.</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-extrabold text-secondary-teal uppercase tracking-widest italic group-hover:gap-5 transition-all">
                     Initiate AI Intake <ArrowRight className="w-4 h-4" />
                  </div>
               </div>
            </Link>

            <Link href="/dashboard/disputes/new" className="no-underline group">
               <div className="premium-card p-10 bg-white border-2 border-slate-100 hover:border-primary-blue transition-all shadow-xl">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-navy" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic">Option B: Manual Forge</span>
                     </div>
                     <h3 className="text-4xl font-extrabold font-outfit italic tracking-tight uppercase leading-none text-primary-navy">Standard Protocol</h3>
                     <p className="text-slate-500 font-medium italic text-sm">Choose your credit bureau, input account details, and select from our library of proven FCRA template definitions yourself.</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-extrabold text-primary-blue uppercase tracking-widest italic group-hover:gap-5 transition-all pt-6">
                     Begin Manual Case <ArrowRight className="w-4 h-4" />
                  </div>
               </div>
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-12">
            <SectionHeader title="Active Dispute Ledger" />
            
            <div className="premium-card overflow-hidden bg-white shadow-2xl border-slate-100">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                  <div className="relative flex-1 max-w-lg group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                     <input 
                        type="text" 
                        placeholder="Search ledger by creditor or bureau..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>

               <div className="divide-y divide-slate-100">
                  {loading ? (
                  <div className="p-32 text-center flex flex-col items-center gap-6">
                     <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-blue rounded-full animate-spin" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Sovereign Ledger...</p>
                  </div>
                  ) : filteredDisputes.length === 0 ? (
                  <div className="p-40 text-center space-y-10 bg-slate-50/10">
                     <div className="w-32 h-32 bg-white rounded-[3rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-100 shadow-2xl relative rotate-6 transition-transform hover:rotate-0 duration-700">
                        <Activity className="w-16 h-16" />
                        <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                           <PlusCircle className="w-6 h-6" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-3xl font-extrabold text-primary-navy uppercase font-outfit tracking-tight italic">Ledger Inactive</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed italic">
                           Your audit ledger is currently empty. Identify inaccuracies in your credit reports and deploy your first dispute mission to see items here.
                        </p>
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
                        <div className="p-10 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-slate-50 group transition-all border-l-8 border-transparent hover:border-primary-blue cursor-pointer">
                           <div className="flex items-center gap-10">
                              <div className="w-24 h-24 rounded-[2.5rem] bg-white border border-slate-100 shadow-inner flex flex-col items-center justify-center transition-all group-hover:bg-primary-navy group-hover:text-white group-hover:rotate-12 group-hover:scale-110 duration-500">
                                 <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40 italic font-outfit mb-1">{d.bureau.slice(0, 3)}</span>
                                 <Briefcase className="w-10 h-10" />
                              </div>
                              
                              <div className="space-y-3">
                                 <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors leading-none italic uppercase tracking-tight">
                                       {d.creditorName}
                                    </h3>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border italic ${statusColors[d.status as keyof typeof statusColors] || statusColors.Draft}`}>
                                       {d.status}
                                    </span>
                                 </div>
                                 
                                 <div className="flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">
                                    <span className="flex items-center gap-2 text-primary-blue"><ShieldCheck className="w-4 h-4" /> {d.bureau} Audit</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-2 text-primary-navy/50"><History className="w-4 h-4" /> {formatDisplayDate(d.updatedAt)}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-8 mt-10 lg:mt-0">
                              <div className="text-right hidden sm:block space-y-1">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Current Mission Progress</p>
                                 <p className="text-lg font-bold text-primary-navy uppercase italic tracking-tight">{d.status === 'Sent' ? "Awaiting Bureau Response" : "Ready for Document Forge"}</p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 text-slate-200 group-hover:border-primary-blue group-hover:bg-primary-blue group-hover:text-white flex items-center justify-center transition-all shadow-sm group-hover:shadow-2xl">
                                 <ChevronRight className="w-7 h-7" />
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
            <div className="premium-card p-10 space-y-8 bg-primary-navy text-white relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-secondary-teal/20 transition-all transition-duration-700" />
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                        <AlertCircle className="w-8 h-8 text-secondary-teal" />
                     </div>
                     <div>
                        <h4 className="font-extrabold text-2xl leading-none italic uppercase font-outfit">Before Launch</h4>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic leading-none">Institutional Checklist</p>
                     </div>
                  </div>
                  <div className="space-y-5">
                     <CheckItem text="Verify inaccuracies match your official reports." />
                     <CheckItem text="Circle the items in red on a physical copy." />
                     <CheckItem text="Prepare your ID and utility bill in the Vault." />
                     <CheckItem text="Identify the proper bureau mailing address." />
                  </div>
                  <a 
                    href="https://www.annualcreditreport.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 no-underline italic shadow-inner"
                  >
                     Secure Official Data Baseline <ArrowRight className="w-4 h-4" />
                  </a>
               </div>
            </div>

            <SectionHeader title="Institutional Rules" />
            <div className="premium-card p-10 flex flex-col justify-center space-y-6 bg-white border-2 border-slate-100 shadow-xl group">
               <div className="flex items-center gap-4 text-primary-blue border-b border-slate-50 pb-6 group-hover:border-primary-blue/20 transition-all">
                  <Clock className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-extrabold text-primary-navy font-outfit uppercase italic leading-none">The 30-Day Clock</h4>
               </div>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider italic">
                 Once a bureau receives your letter via Certified Mail, they have exactly 30 days to complete their investigation. If they fail, they are in violation of the FCRA and the item must be removed.
               </p>
               <div className="pt-4">
                  <Link href="/dashboard/ai" className="flex items-center gap-3 text-[10px] font-extrabold text-primary-blue hover:text-primary-navy transition-colors uppercase tracking-[0.2em] italic group/ask">
                     Ask Geek AI About FCRA Sec. 611 <ArrowRight className="w-4 h-4 group-hover/ask:translate-x-1 transition-transform" />
                  </Link>
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
