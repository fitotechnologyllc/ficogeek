"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  History, 
  MoreVertical, 
  Download, 
  Printer,
  Calendar,
  ShieldCheck,
  PlusCircle,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { DisputeTimeline } from "@/components/DisputeTimeline";
import { DisputeStatus } from "@/lib/schema";
import { logAuditAction } from "@/lib/audit";

const STATUS_COLORS: Record<DisputeStatus, string> = {
  "Draft": "bg-slate-100 text-slate-500",
  "In Review": "bg-primary-blue/10 text-primary-blue",
  "Ready to Generate": "bg-secondary-teal/10 text-secondary-teal",
  "Generated": "bg-emerald-100 text-emerald-700",
  "Sent": "bg-primary-navy/10 text-primary-navy",
  "Waiting Response": "bg-amber-100 text-amber-700",
  "Needs Follow Up": "bg-red-100 text-red-700",
  "Updated": "bg-indigo-100 text-indigo-700",
  "Resolved": "bg-emerald-500 text-white",
  "Closed": "bg-slate-900 text-white",
  "Archived": "bg-slate-300 text-slate-600",
};

export default function DisputeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [dispute, setDispute] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      try {
        const disputeDoc = await getDoc(doc(db, "disputes", id as string));
        if (disputeDoc.exists()) {
          setDispute({ id: disputeDoc.id, ...disputeDoc.data() });
        } else {
          router.push("/dashboard/disputes");
          return;
        }

        const eventsQuery = query(
          collection(db, "dispute_events"),
          where("disputeId", "==", id),
          orderBy("timestamp", "desc")
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id]);

  const updateStatus = async (newStatus: DisputeStatus) => {
    if (!user || !dispute) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "disputes", dispute.id), { status: newStatus });
      
      const eventSummary = `Status updated to ${newStatus}`;
      await addDoc(collection(db, "dispute_events"), {
        disputeId: dispute.id,
        actorUID: user.uid,
        type: "STATUS_CHANGE",
        summary: eventSummary,
        timestamp: serverTimestamp(),
      });

      await logAuditAction(
        user.uid,
        profile?.name || user.email!,
        profile?.role || "user",
        "DISPUTE_STATUS_CHANGE",
        `Changed dispute ${dispute.accountName} status to ${newStatus}`,
        "DISPUTE",
        dispute.id
      );

      setDispute({ ...dispute, status: newStatus });
      setEvents([{ type: "STATUS_CHANGE", summary: eventSummary, timestamp: new Date() }, ...events]);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Loading Case File...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header and Nav */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/disputes" className="flex items-center gap-2 text-slate-400 hover:text-primary-blue font-bold px-4 py-2 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
        <div className="flex gap-3">
          <button className="p-3 text-slate-400 hover:text-primary-navy hover:bg-slate-100 rounded-xl transition-all">
             <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Core Info and Timeline */}
        <div className="lg:col-span-2 space-y-8">
           <div className="premium-card p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <ShieldCheck className="w-48 h-48" />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                 <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[dispute.status as DisputeStatus]}`}>
                       {dispute.status}
                    </div>
                    <div className="space-y-1">
                       <h1 className="text-4xl font-bold font-outfit text-primary-navy">{dispute.accountName}</h1>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Standard Dispute Request</p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <select 
                      disabled={updating}
                      value={dispute.status}
                      onChange={(e) => updateStatus(e.target.value as DisputeStatus)}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-blue/10 transition-all cursor-pointer shadow-sm"
                    >
                       {Object.keys(STATUS_COLORS).map(s => (
                         <option key={s} value={s}>{s}</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 relative z-10">
                 <div className="space-y-8">
                    <InfoGroup label="Bureau Platform" value={dispute.bureau} icon={ShieldCheck} />
                    <InfoGroup label="Account Ref" value={dispute.accountNumber} icon={FileText} />
                    <InfoGroup label="Dispute Category" value={dispute.type} icon={RefreshCw} />
                 </div>
                 <div className="space-y-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <PlusCircle className="w-4 h-4" /> Dispute Claim
                    </h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-primary-navy pl-4">
                       &quot;{dispute.reason}&quot;
                    </p>
                 </div>
              </div>
           </div>

           {/* Timeline and Events */}
           <div className="premium-card p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                 <h2 className="text-xl font-bold font-outfit text-primary-navy">Case History</h2>
                 <History className="w-5 h-5 text-slate-300" />
              </div>
              <DisputeTimeline events={events} />
           </div>
        </div>

        {/* Right Column: Actions and Attachments */}
        <div className="space-y-8">
           <div className="premium-card p-8 bg-primary-navy text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16" />
              
              <h3 className="font-bold text-lg leading-tight">Generate Correspondence</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">Ready to take action? Generate a professional letter based on this dispute case.</p>
              
              <div className="space-y-3 pt-4">
                 <button className="w-full py-4 bg-white text-primary-navy rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-lg active:scale-[0.98]">
                    <FileText className="w-5 h-5" /> Generate Letter
                 </button>
                 <button className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-[0.98]">
                    <Download className="w-5 h-5" /> Download Preview
                 </button>
              </div>
           </div>

           <div className="premium-card p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <h3 className="font-bold text-primary-navy">Linked Docs</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Secure</span>
              </div>
              <div className="space-y-4">
                 <p className="text-center py-8 text-slate-400 text-sm font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">
                    No documents linked
                 </p>
                 <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Link from Vault
                 </button>
              </div>
           </div>

           <div className="premium-card p-8 border-2 border-amber-50 bg-amber-50/20 space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                 <ArrowRight className="w-5 h-5" />
                 <h3 className="font-bold uppercase tracking-widest text-xs">Recommended Action</h3>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">Ensure you have uploaded a valid copy of your **Driver&apos;s License** and **Proof of Address** to your vault before sending this letter.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoGroup({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-4 group">
       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
          <Icon className="w-5 h-5" />
       </div>
       <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-lg font-bold font-outfit text-slate-800 leading-tight">{value}</p>
       </div>
    </div>
  );
}
