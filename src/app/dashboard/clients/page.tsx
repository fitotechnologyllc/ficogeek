"use client";

import { useEffect, useState } from "react";
import { 
  PlusCircle, 
  Search, 
  Users, 
  MoreVertical, 
  ChevronRight, 
  Mail, 
  Phone, 
  Clock,
  ShieldCheck,
  Zap,
  Filter,
  UserPlus,
  TrendingUp,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { ClientIntakeModal } from "@/components/ClientIntakeModal";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const { user, profile } = useAuth();

  const fetchClients = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "clients"), 
        where("proUID", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const clientDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientDocs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Professional Enterprise Suite</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Client Portfolio</h1>
          <p className="text-slate-500 font-medium">Manage and monitor {clients.length} active client files.</p>
        </div>
        <button 
          onClick={() => setIsIntakeOpen(true)}
          className="btn-primary group flex items-center gap-2 shadow-2xl py-4 px-8"
        >
          <UserPlus className="w-5 h-5 animate-pulse" />
          <span>New Client Intake</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Pro Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
           label="Active Cases" 
           value={clients.filter(c => c.status === "Active").length.toString()} 
           icon={Zap} 
           color="text-primary-blue" 
           bgColor="bg-primary-blue/5"
         />
         <StatsCard 
           label="Pending Onboarding" 
           value={clients.filter(c => c.onboardingStatus === "Pending").length.toString()} 
           icon={Clock} 
           color="text-amber-500" 
           bgColor="bg-amber-50"
         />
         <StatsCard 
           label="System Utilization" 
           value="88%" 
           icon={TrendingUp} 
           color="text-secondary-teal" 
           bgColor="bg-secondary-teal/5"
         />
      </div>

      {/* Clients List Section */}
      <div className="premium-card overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 gap-6">
          <div className="relative flex-1 w-full group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by client name, email, or internal ID..."
               className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:border-primary-blue/20 transition-all font-bold text-slate-700 shadow-sm"
             />
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-navy hover:border-primary-navy transition-all flex items-center gap-2 font-bold text-sm shadow-sm">
                <Filter className="w-4 h-4" /> Filter Status
             </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-8 flex items-center gap-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-3">
                   <div className="h-5 w-48 bg-slate-100 rounded" />
                   <div className="h-3 w-32 bg-slate-50 rounded" />
                </div>
                <div className="w-32 h-10 bg-slate-50 rounded-xl" />
              </div>
            ))
          ) : filteredClients.length === 0 ? (
            <div className="p-32 text-center space-y-8">
               <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto text-slate-200 border-8 border-white shadow-2xl rotate-12">
                  <Users className="w-12 h-12" />
               </div>
               <div className="space-y-3">
                  <h3 className="text-3xl font-extrabold text-slate-300 font-outfit uppercase tracking-tight">Portfolio Empty</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md mx-auto leading-relaxed">You haven&apos;t integrated any client files yet. Start your first intake to begin processing disputes.</p>
               </div>
               <button 
                 onClick={() => setIsIntakeOpen(true)}
                 className="px-10 py-4 bg-primary-navy text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy-900/10"
               >
                 Launch First Intake
               </button>
            </div>
          ) : (
            filteredClients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-slate-50/80 transition-all border-l-4 border-transparent hover:border-primary-blue relative"
              >
                <div className="flex items-center gap-8">
                  {/* Avatar / Identity */}
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-primary-navy group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-4 border-white shadow-xl shadow-slate-200/50">
                    <span className="text-2xl font-bold font-outfit uppercase">{client.name.charAt(0)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <h3 className="text-2xl font-bold text-slate-800 font-outfit group-hover:text-primary-blue transition-colors">{client.name}</h3>
                       <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                         client.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                       }`}>
                         {client.status}
                       </span>
                    </div>
                    <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {client.serviceLevel || "Standard"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-6 md:mt-0">
                  <div className="text-right hidden lg:block mr-8">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Onboarding</p>
                     <p className={`text-sm font-bold ${client.onboardingStatus === "Complete" ? "text-emerald-500" : "text-amber-500"}`}>
                        {client.onboardingStatus}
                     </p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl group-hover:bg-primary-navy group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <ClientIntakeModal 
        isOpen={isIntakeOpen} 
        onClose={() => setIsIntakeOpen(false)} 
        onSuccess={fetchClients}
      />
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="premium-card p-8 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
       <div className="space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <Icon className={`w-4 h-4 ${color}`} /> {label}
          </p>
          <p className="text-4xl font-bold font-outfit text-primary-navy">{value}</p>
       </div>
       <div className={`w-16 h-16 rounded-[1.5rem] ${bgColor} flex items-center justify-center scale-90 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-8 h-8 ${color}`} />
       </div>
    </div>
  );
}
