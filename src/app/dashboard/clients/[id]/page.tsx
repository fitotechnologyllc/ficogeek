"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  FolderLock, 
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ClientProfilePage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !id) return;
      try {
        const clientRef = doc(db, "clients", id as string);
        const clientSnap = await getDoc(clientRef);
        
        if (clientSnap.exists()) {
          setClient({ id: clientSnap.id, ...clientSnap.data() });
          
          // Fetch client disputes
          const disputesQ = query(collection(db, "disputes"), where("clientId", "==", id));
          const disputesSnap = await getDocs(disputesQ);
          setDisputes(disputesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          
          // Fetch client documents
          const docsQ = query(collection(db, "documents"), where("clientId", "==", id));
          const docsSnap = await getDocs(docsQ);
          setDocuments(docsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          router.push("/dashboard/clients");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user, id, router]);

  if (loading) return <div className="p-8 animate-pulse text-center">Loading client data...</div>;
  if (!client) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients" className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-navy hover:bg-slate-50 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">{client.name}</h1>
          <p className="text-slate-500 font-medium tracking-tight uppercase text-xs font-bold leading-none">Client ID: {client.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="premium-card p-8 space-y-6">
              <div className="text-center space-y-3">
                 <div className="w-24 h-24 rounded-3xl bg-primary-navy text-white flex items-center justify-center text-4xl font-bold mx-auto shadow-2xl">
                    {client.name[0]}
                 </div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {client.status || "Active"}
                 </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <ContactInfo icon={Mail} label="Email Address" value={client.email} />
                 <ContactInfo icon={Phone} label="Phone Number" value={client.phone || "Not provided"} />
                 <ContactInfo icon={Calendar} label="Date Enrolled" value={new Date(client.createdAt).toLocaleDateString()} />
              </div>
              <button className="w-full py-3.5 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:border-primary-blue hover:text-primary-blue transition-all flex items-center justify-center gap-2">
                 <MessageSquare className="w-4 h-4" /> Send Message
              </button>
           </div>

           <div className="premium-card p-6 space-y-4 bg-gradient-to-br from-slate-900 to-primary-navy text-white">
              <h4 className="font-bold text-secondary-teal text-sm uppercase tracking-widest leading-none">Case Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-2xl font-bold font-outfit">{disputes.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disputes</p>
                 </div>
                 <div>
                    <p className="text-2xl font-bold font-outfit">{documents.length}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documents</p>
                 </div>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">Generate Summary Report</button>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h3 className="font-bold text-slate-800 text-xl">Active Disputes</h3>
                 <button className="text-sm font-bold text-primary-blue hover:underline flex items-center gap-1">
                   Create Dispute <PlusCircle className="w-4 h-4" />
                 </button>
              </div>
              <div className="premium-card">
                 {disputes.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                       <FileText className="w-12 h-12 text-slate-200 mx-auto" />
                       <p className="font-bold text-slate-400">No active disputes for this client</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-slate-100">
                       {disputes.map((d) => (
                          <div key={d.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary-blue/10 flex items-center justify-center text-primary-blue">
                                   <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800">{d.accountName}</p>
                                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest leading-none mt-1">
                                      <span>{d.bureau}</span>
                                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                      <span>{d.status}</span>
                                   </div>
                                </div>
                             </div>
                             <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary-blue transition-all" />
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </section>

           <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                 <h3 className="font-bold text-slate-800 text-xl">Client Documents</h3>
                 <button className="text-sm font-bold text-primary-blue hover:underline flex items-center gap-1">
                   Upload Document <FolderLock className="w-4 h-4" />
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {documents.length === 0 ? (
                    <div className="md:col-span-2 p-16 text-center space-y-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                       <p className="font-bold text-slate-400">No documents stored in vault</p>
                    </div>
                 ) : (
                    documents.map((doc) => (
                       <div key={doc.id} className="premium-card p-4 flex items-center justify-between hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{doc.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.category}</p>
                             </div>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-primary-navy transition-all">
                             <MoreVertical className="w-5 h-5" />
                          </button>
                       </div>
                    ))
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}

function ContactInfo({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
       <div className="p-2 rounded-lg bg-slate-50 text-slate-400 mt-0.5">
          <Icon className="w-4 h-4" />
       </div>
       <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
       </div>
    </div>
  );
}
