"use client";

import { useEffect, useState } from "react";
import { 
  PlusCircle, 
  Search, 
  FileText, 
  Download, 
  Printer, 
  MoreVertical, 
  ShieldCheck, 
  ArrowRight,
  Archive,
  History,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Trash2,
  Edit2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { LetterPreview } from "@/components/LetterPreview";
import { Letter } from "@/lib/schema";
import { formatDisplayDate } from "@/lib/utils";

export default function LetterCenterPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "preview">("list");
  const { user } = useAuth();

  const fetchLetters = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "letters"), 
        where("ownerUID", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setLetters(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Letter)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [user]);

  if (viewMode === "preview" && selectedLetter) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
         <button 
           onClick={() => setViewMode("list")}
           className="flex items-center gap-2 text-slate-400 hover:text-primary-blue font-bold px-4 py-2 transition-all"
         >
            <ChevronRight className="w-5 h-5 rotate-180" /> Back to Library
         </button>
         <LetterPreview 
           content={selectedLetter.content}
          recipient={selectedLetter.metadata?.recipient || "N/A"}
          address={selectedLetter.metadata?.address || "N/A"}
          date={selectedLetter.metadata?.date || formatDisplayDate(selectedLetter.createdAt)}
          subject={selectedLetter.type}
          userName={user?.displayName || "Sovereign User"}
         />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-secondary-teal animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Document Forge Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Document Forge</h1>
          <p className="text-slate-500 font-medium tracking-tight max-w-2xl text-lg">
            Generate, manage, and audit your professional dispute correspondence. Every letter is a legal instrument in your credit defense.
          </p>
        </div>
        <Link href="/dashboard/disputes/new" className="btn-primary group flex items-center gap-4 py-5 px-10 shadow-2xl uppercase tracking-widest text-[10px] font-bold italic">
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Generate New Forge</span>
        </Link>
      </div>

      {/* FORGE LOGIC DIRECTORY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <LetterTypeCard 
            title="Section 609 Verification" 
            desc="Demand bureaus verify the source of unverified negative items. The cornerstone of the FCRA audit." 
            citation="15 U.S.C. § 1681g"
            useCase="Initial dispute for general inaccuracies."
         />
         <LetterTypeCard 
            title="Debt Validation (FDCPA)" 
            desc="Challenge a collection agency's legal right to collect a specific debt from you." 
            citation="15 U.S.C. § 1692g"
            useCase="Recent collections or unknown debts."
         />
         <LetterTypeCard 
            title="Method of Verification" 
            desc="Demand to see the specific process used by the bureau to 'verify' a disputed item." 
            citation="15 U.S.C. § 1681i"
            useCase="Follow-up after a rejected initial dispute."
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-12">
            <SectionHeader title="Draft Protocol Library" />
            
            <div className="premium-card overflow-hidden bg-white shadow-2xl border-slate-100">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                  <div className="relative flex-1 max-w-lg group">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                     <input 
                        type="text" 
                        placeholder="Search archive by bureau or letter type..."
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all font-bold text-slate-700 placeholder:text-slate-300 italic"
                     />
                  </div>
               </div>

               <div className="divide-y divide-slate-100">
                  {loading ? (
                     <div className="p-32 text-center animate-pulse flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-blue rounded-full animate-spin" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic">Indexing Archive Protocols...</p>
                     </div>
                  ) : letters.length === 0 ? (
                     <div className="p-40 text-center space-y-10 bg-slate-50/10">
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-100 border border-slate-50 shadow-2xl rotate-6 transition-transform hover:rotate-0 duration-700">
                           <FileText className="w-16 h-16" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-3xl font-extrabold text-primary-navy uppercase font-outfit tracking-tight italic">Forge Empty</h3>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed italic">
                              No forged documents detected. Use the &quot;Generate New Forge&quot; tool above to draft your first professional dispute correspondence.
                           </p>
                        </div>
                     </div>
                  ) : (
                     letters.map((l) => (
                     <div key={l.id} className="p-10 flex flex-col lg:flex-row lg:items-center justify-between hover:bg-slate-50 group transition-all border-l-8 border-transparent hover:border-primary-blue">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 rounded-[2rem] bg-white border border-slate-100 shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:rotate-6 group-hover:scale-110 duration-500">
                              <FileText className="w-10 h-10" />
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                 <h3 className="text-2xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors italic uppercase leading-none tracking-tight">{l.type}</h3>
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border italic ${
                                   l.status === 'Sent' ? "bg-emerald-50 text-emerald-600 border-emerald-100 font-bold" : "bg-primary-blue/5 text-primary-blue border-primary-blue/10 font-bold"
                                 }`}>
                                    {l.status}
                                 </span>
                              </div>
                              <div className="flex items-center gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">
                                 <span className="flex items-center gap-2 text-primary-blue"><ShieldCheck className="w-4 h-4" /> {l.bureau} Audit</span>
                                 <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                 <span className="flex items-center gap-2 text-primary-navy/50"><History className="w-4 h-4" /> v{l.version || 1.0} Protocol</span>
                              </div>
                           </div>
                        </div>
                                                <div className="flex items-center gap-3 mt-10 lg:mt-0">
                           <button 
                             onClick={() => { setSelectedLetter(l); setViewMode("preview"); }}
                             className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary-blue hover:shadow-2xl rounded-2xl transition-all active:scale-95 group/btn"
                           >
                              <Printer className="w-5 h-5" />
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Print</span>
                           </button>
                           <button 
                             className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary-blue hover:shadow-2xl rounded-2xl transition-all active:scale-95 group/btn"
                           >
                              <Edit2 className="w-5 h-5" />
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Edit</span>
                           </button>
                           <button className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 text-slate-400 hover:text-primary-navy hover:shadow-2xl rounded-2xl transition-all active:scale-95 group/btn">
                              <Download className="w-5 h-5" />
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">PDF</span>
                           </button>
                           <button className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 text-slate-100 hover:text-red-500 rounded-2xl transition-all active:scale-95 group/btn">
                              <Trash2 className="w-5 h-5" />
                              <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Delete</span>
                           </button>
                        </div>
                     </div>
                   ))
                  )}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-10">
            <SectionHeader title="Mailing Protocol" />
            <div className="premium-card p-1 text-white bg-primary-navy relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-secondary-teal/20 transition-all duration-700" />
               <div className="p-10 space-y-10 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <CheckCircle2 className="w-8 h-8 text-secondary-teal" />
                     </div>
                     <div>
                        <h4 className="font-extrabold text-2xl leading-none italic uppercase font-outfit">The Gold Standard</h4>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic leading-none">Institutional Delivery</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <ForgeCheckItem text="Always sign your letters by hand (Wet Signature)." />
                     <ForgeCheckItem text="Use Certified Mail with Return Receipt (RRR)." />
                     <ForgeCheckItem text="Attach your ID and proof of residence." />
                     <ForgeCheckItem text="Track your delivery date for the 30-day clock." />
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                     <p className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest italic">Institutional Note:</p>
                     <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">Avoid using online dispute portals as they often waive your right to a proper investigation and appeal under the FCRA.</p>
                  </div>
               </div>
            </div>

            <SectionHeader title="Next Mission" />
            <div className="premium-card p-10 bg-white border-2 border-primary-blue/20 shadow-xl space-y-6 group hover:border-primary-blue transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-blue/10 rounded-2xl flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-all">
                     <PlusCircle className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-bold text-lg text-primary-navy italic uppercase font-outfit leading-none">Ready to Send?</h4>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verification Required</p>
                  </div>
               </div>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider italic">
                 Before mailing your letters, ensure your supporting documents are categorized in the Vault. Bureaus frequently reject disputes that lack proper ID verification.
               </p>
               <Link href="/dashboard/vault" className="btn-primary py-4 w-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest italic shadow-lg">
                  Finalize Evidence in Vault <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}

function LetterTypeCard({ title, desc, useCase, citation }: { title: string, desc: string, useCase: string, citation?: string }) {
   return (
      <div className="premium-card p-10 space-y-6 border-2 border-slate-50 hover:border-primary-blue transition-all group shadow-sm hover:shadow-2xl bg-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
         <div className="space-y-4 relative z-10">
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-2xl tracking-tighter text-primary-navy italic uppercase font-outfit leading-none">{title}</h5>
                  {citation && <span className="text-[9px] font-bold text-primary-blue bg-primary-blue/5 px-2 py-1 rounded-lg uppercase tracking-widest italic">{citation}</span>}
               </div>
               <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic uppercase tracking-wider">{desc}</p>
            </div>
            <div className="pt-2 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-secondary-teal" />
               <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 italic">Mission: {useCase}</span>
            </div>
         </div>
      </div>
   );
}

function ForgeCheckItem({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 group/item">
         <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center mt-0.5 border border-white/5 group-hover/item:border-secondary-teal transition-colors">
            <CheckCircle2 className="w-3 h-3 text-secondary-teal" />
         </div>
         <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-white transition-colors italic leading-relaxed">{text}</span>
      </div>
   );
}

function SectionHeader({ title }: { title: string }) {
   return (
      <div className="flex items-center gap-4 mb-2">
         <div className="h-[1px] flex-1 bg-slate-100" />
         <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] italic whitespace-nowrap">{title}</h2>
         <div className="h-[1px] w-8 bg-slate-100" />
      </div>
   );
}
