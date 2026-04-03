"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  User, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Download,
  Database,
  History
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit, where } from "firebase/firestore";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("All Actions");
  const [searchActor, setSearchActor] = useState("");
  const { user, profile, isAdminOrOwner } = useAuth();

  const fetchLogs = useCallback(async () => {
    if (!user || !isAdminOrOwner) return;
    try {
      const logsRef = collection(db, "audit_logs");
      let q = query(logsRef, orderBy("timestamp", "desc"), limit(100));
      
      if (filterAction !== "All Actions") {
        q = query(logsRef, where("action", "==", filterAction), orderBy("timestamp", "desc"), limit(100));
      }

      const snapshot = await getDocs(q);
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdminOrOwner, filterAction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => 
    log.actorName.toLowerCase().includes(searchActor.toLowerCase()) ||
    log.actorUID.toLowerCase().includes(searchActor.toLowerCase())
  );



  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <ShieldAlert className="w-5 h-5 text-red-500" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Security Monitoring Console</span>
          </div>
          <h1 className="text-4xl font-bold font-outfit text-primary-navy">Platform Audit Trail</h1>
          <p className="text-slate-500 font-medium tracking-tight">Real-time immutable event log for the FICO Geek network.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download className="w-5 h-5" /> Export for Compliance
           </button>
        </div>
      </div>

      {/* Audit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <AdminStatCard label="Security Events" value="12" icon={ShieldAlert} color="text-red-500" bgColor="bg-red-50" />
         <AdminStatCard label="New Credentials" value="2,401" icon={User} color="text-primary-blue" bgColor="bg-primary-blue/5" />
         <AdminStatCard label="Database Writes" value="44.2k" icon={Database} color="text-secondary-teal" bgColor="bg-secondary-teal/5" />
         <AdminStatCard label="System Health" value="100%" icon={Activity} color="text-emerald-500" bgColor="bg-emerald-50" />
      </div>

      {/* Log Feed Controls */}
      <div className="premium-card p-10 space-y-10">
         <div className="flex flex-col md:flex-row gap-6 items-center border-b border-slate-100 pb-10">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
               <input 
                 type="text" 
                 value={searchActor}
                 onChange={(e) => setSearchActor(e.target.value)}
                 placeholder="Search by Actor Name or UID..."
                 className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary-blue/5 focus:bg-white focus:border-primary-blue/20 transition-all font-bold text-slate-700"
               />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <select 
                 value={filterAction}
                 onChange={(e) => setFilterAction(e.target.value)}
                 className="px-8 py-5 bg-white border border-slate-200 rounded-3xl font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary-blue/5 transition-all cursor-pointer shadow-sm min-w-[240px]"
               >
                  <option>All Actions</option>
                  <option>LOGIN</option>
                  <option>SIGN_UP</option>
                  <option>FILE_UPLOAD</option>
                  <option>SENSITIVE_RECORD_UPDATE</option>
                  <option>ADMIN_MODERATION</option>
                  <option>DISPUTE_CREATED</option>
               </select>
            </div>
         </div>

         {/* Log Items */}
         <div className="space-y-4">
            {loading ? (
               <div className="p-20 text-center animate-pulse text-slate-300 font-bold uppercase tracking-[0.2em] italic">Accessing Ledger Data...</div>
            ) : filteredLogs.length === 0 ? (
               <div className="p-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-100 mb-6 shadow-inner">
                     <History className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-300 font-outfit uppercase">Zero Matches Found</h3>
               </div>
            ) : (
               <div className="overflow-hidden border border-slate-100 rounded-[2.5rem]">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <th className="px-8 py-5">Actor / Origin</th>
                           <th className="px-8 py-5">System Action</th>
                           <th className="px-8 py-5">Event Summary</th>
                           <th className="px-8 py-5">Execution Time</th>
                           <th className="px-8 py-5 text-right">Insight</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredLogs.map((log) => (
                           <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary-navy/5 flex items-center justify-center text-primary-navy group-hover:bg-primary-navy group-hover:text-white transition-all">
                                       <User className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className="font-bold text-slate-800 leading-none">{log.actorName || "Unresolved"}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{log.actorRole || "Service User"}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                    {log.action}
                                 </span>
                              </td>
                              <td className="px-8 py-6 max-w-sm">
                                 <p className="text-sm font-medium text-slate-600 line-clamp-1">{log.summary}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-none">
                                    <Clock className="w-3.5 h-3.5" />
                                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Real-time"}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button className="p-3 text-slate-300 hover:text-primary-blue hover:bg-white rounded-xl transition-all shadow-hover">
                                    <ArrowRight className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="premium-card p-8 flex flex-col justify-between group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-transparent hover:border-primary-blue">
       <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${bgColor} ${color} shadow-inner`}>
             <Icon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
             <CheckCircle2 className="w-3 h-3" /> Secure
          </span>
       </div>
       <div className="space-y-1">
          <p className="text-3xl font-bold font-outfit text-primary-navy tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</p>
       </div>
    </div>
  );
}

function getActionColor(action: string) {
  switch (action) {
    case "ADMIN_MODERATION":
    case "SENSITIVE_RECORD_UPDATE": return "bg-red-50 text-red-600 border-red-100";
    case "SIGN_UP":
    case "LOGIN": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "DISPUTE_CREATED": return "bg-primary-blue/5 text-primary-blue border-primary-blue/10";
    case "FILE_UPLOAD": return "bg-secondary-teal/5 text-secondary-teal border-secondary-teal/10";
    default: return "bg-slate-50 text-slate-500 border-slate-100";
  }
}
