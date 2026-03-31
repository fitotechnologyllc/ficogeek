"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  FileText, 
  Zap, 
  Clock, 
  History, 
  MoreVertical, 
  Mail, 
  Phone, 
  Activity,
  PlusCircle,
  FolderLock,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { DisputeTimeline } from "@/components/DisputeTimeline";

type TabType = "overview" | "disputes" | "vault" | "activity";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [client, setClient] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      try {
        const clientDoc = await getDoc(doc(db, "clients", id as string));
        if (clientDoc.exists()) {
          setClient({ id: clientDoc.id, ...clientDoc.data() });
        } else {
          router.push("/dashboard/clients");
          return;
        }

        // Fetch client-specific disputes
        const disputesQ = query(
          collection(db, "disputes"),
          where("clientId", "==", id),
          orderBy("createdAt", "desc")
        );
        const disputesSnapshot = await getDocs(disputesQ);
        setDisputes(disputesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch client-specific documents
        const docsQ = query(
          collection(db, "documents"),
          where("clientId", "==", id),
          orderBy("createdAt", "desc")
        );
        const docsSnapshot = await getDocs(docsQ);
        setDocuments(docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch activity logs for this client
        const activityQ = query(
          collection(db, "audit_logs"),
          where("targetId", "==", id),
          orderBy("timestamp", "desc")
        );
        const activitySnapshot = await getDocs(activityQ);
        setEvents(activitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id]);

  if (loading) return <div className="p-12 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Accessing Client Records...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/clients" className="flex items-center gap-2 text-slate-400 hover:text-primary-blue font-bold px-4 py-2 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" /> Back to Portfolio
        </Link>
        <button className="p-3 text-slate-400 hover:text-primary-navy hover:bg-slate-100 rounded-xl transition-all">
           <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Client Identity Block */}
      <div className="premium-card p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <User className="w-64 h-64" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
           <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary-navy to-primary-blue flex items-center justify-center text-white text-4xl font-bold font-outfit shadow-2xl rotate-3 border-4 border-white">
              {client.name.charAt(0)}
           </div>
           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                 <h1 className="text-4xl font-bold font-outfit text-primary-navy">{client.name}</h1>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 bg-emerald-50 text-emerald-600`}>
                    {client.status}
                 </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                 <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-blue" /> {client.email}</span>
                 <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-secondary-teal" /> {client.phone || "No Phone"}</span>
                 <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> PRO Managed</span>
              </div>
           </div>
           <div className="flex gap-4">
              <button className="btn-primary py-3 px-8 shadow-xl">Send Updates</button>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-12 border-t border-slate-100 pt-8 overflow-x-auto">
           <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Client Overview" icon={Zap} />
           <TabButton active={activeTab === "disputes"} onClick={() => setActiveTab("disputes")} label="Disputes" icon={FileText} count={disputes.length} />
           <TabButton active={activeTab === "vault"} onClick={() => setActiveTab("vault")} label="Private Vault" icon={FolderLock} count={documents.length} />
           <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")} label="History" icon={History} />
        </div>
      </div>

      {/* Dynamic Tab Content */}
      <div className="animate-fade-in duration-500">
         {activeTab === "overview" && <ClientOverviewTab client={client} disputes={disputes} />}
         {activeTab === "disputes" && <ClientDisputesTab disputes={disputes} />}
         {activeTab === "vault" && <ClientVaultTab documents={documents} />}
         {activeTab === "activity" && <ClientActivityTab events={events} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${
        active ? "bg-primary-navy text-white shadow-xl shadow-navy-900/10 scale-105" : "text-slate-400 hover:bg-slate-100"
      }`}
    >
       <Icon className={`w-4 h-4 ${active ? "text-secondary-teal" : "text-slate-300"}`} />
       {label}
       {count !== undefined && (
         <span className={`px-2 py-0.5 rounded-full text-[9px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
            {count}
         </span>
       )}
    </button>
  );
}

function ClientOverviewTab({ client, disputes }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <div className="premium-card p-10 space-y-8">
          <h3 className="text-xl font-outfit font-bold text-primary-navy border-b border-slate-100 pb-6">Service Summary</h3>
          <div className="space-y-8">
             <div className="flex items-center justify-between group">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Service Level</p>
                   <p className="text-lg font-bold text-slate-700">{client.serviceLevel || "Not Set"}</p>
                </div>
                <Zap className="p-3 w-12 h-12 bg-primary-blue/5 text-primary-blue rounded-2xl group-hover:scale-110 transition-transform" />
             </div>
             <div className="flex items-center justify-between group">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Billing Status</p>
                   <p className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" /> Up to Date
                   </p>
                </div>
                <ShieldCheck className="p-3 w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform" />
             </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Internal Focus Notes</h4>
             <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-primary-navy pl-4">{client.notes || "No focus notes added yet..."}</p>
          </div>
       </div>

       <div className="premium-card p-10 space-y-8 bg-gradient-to-br from-primary-navy to-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <TrendingUp className="w-48 h-48" />
          </div>
          <h3 className="text-xl font-outfit font-bold relative z-10">Account Health</h3>
          <div className="grid grid-cols-2 gap-8 relative z-10">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Disputes</p>
                <p className="text-4xl font-bold font-outfit">{disputes.filter((d: any) => d.status !== 'Closed').length}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolutions</p>
                <p className="text-4xl font-bold font-outfit text-secondary-teal">{disputes.filter((d: any) => d.status === 'Resolved').length}</p>
             </div>
          </div>
          <div className="pt-8 border-t border-white/5 relative z-10">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Speed</span>
                <span className="text-xs font-bold text-secondary-teal">Top Tier</span>
             </div>
             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-primary-blue to-secondary-teal rounded-full" />
             </div>
          </div>
       </div>
    </div>
  );
}

function ClientDisputesTab({ disputes }: any) {
  return (
    <div className="premium-card overflow-hidden">
       <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-xl font-bold font-outfit text-primary-navy">Case Files</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-primary-blue transition-all">
             <PlusCircle className="w-4 h-4" /> New Individual Case
          </button>
       </div>
       <div className="divide-y divide-slate-100">
          {disputes.length === 0 ? (
            <div className="p-32 text-center space-y-4">
               <FileText className="w-12 h-12 text-slate-200 mx-auto" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No disputes recorded for this client</p>
            </div>
          ) : (
            disputes.map((d: any) => (
              <div key={d.id} className="p-8 flex items-center justify-between hover:bg-slate-50 group transition-all">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-blue group-hover:text-white transition-all">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-lg text-slate-800">{d.accountName}</h4>
                       <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="text-primary-blue">{d.bureau}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span>Ref: {d.accountNumber}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-8">
                    <span className="hidden md:block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                       {d.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-primary-navy transition-all" />
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

function ClientVaultTab({ documents }: any) {
  return (
    <div className="premium-card p-10">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-100">
          <div>
             <h2 className="text-xl font-bold font-outfit text-primary-navy leading-none mb-1">Client Vault</h2>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scoped Storage Space</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary-navy text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-navy-900/10">
             <PlusCircle className="w-4 h-4" /> Add Private Record
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
               <FolderLock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vault is empty for this client</p>
            </div>
          ) : (
            documents.map((doc: any) => (
              <div key={doc.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 hover:shadow-xl hover:bg-white transition-all group">
                 <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary-navy shadow-inner border border-slate-100 group-hover:scale-110 transition-transform">
                       <FileText className="w-6 h-6" />
                    </div>
                    <button className="p-2 text-slate-300 hover:text-primary-navy">
                       <MoreVertical className="w-4 h-4" />
                    </button>
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary-blue transition-colors">{doc.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(doc.size / 1024).toFixed(1)} KB • {doc.category}</p>
                 </div>
                 <div className="pt-4 border-t border-white flex justify-between items-center group-hover:border-slate-100 transition-colors">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                       <ShieldCheck className="w-3 h-3" /> Secure
                    </span>
                    <button className="text-[10px] font-bold text-primary-navy uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100">
                       Access <ArrowRight className="w-3 h-3" />
                    </button>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

function ClientActivityTab({ events }: any) {
  return (
     <div className="premium-card p-10 space-y-10">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
           <h2 className="text-xl font-bold font-outfit text-primary-navy">System Audit Trail</h2>
           <span className="px-3 py-1 bg-primary-blue/5 text-primary-blue text-[9px] font-bold rounded-full uppercase tracking-widest">Non-Repudiation Enabled</span>
        </div>
        <DisputeTimeline events={events} />
     </div>
  );
}

function ArrowRight({ className }: any) {
  return <ChevronRight className={className} />;
}
