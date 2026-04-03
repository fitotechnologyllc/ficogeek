"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  UserPlus,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, isAdminOrOwner } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdminOrOwner) return;
      try {
        const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await updateDoc(doc(db, "profiles", userId), { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">User Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Platform-level control for all personal and pro accounts.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Export Data
           </button>
           <button className="btn-primary flex items-center gap-2 shadow-2xl">
              <UserPlus className="w-5 h-5" /> Invite User
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsBox title="Total Users" value={users.length.toString()} icon={Users} color="text-primary-blue" />
         <StatsBox title="Pro Submissions" value="142" icon={CheckCircle2} color="text-secondary-teal" />
         <StatsBox title="Reports Flagged" value="3" icon={AlertTriangle} color="text-amber-600" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search users by name, email, or UID..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-blue/10 outline-none font-medium transition-all"
          />
        </div>
        <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                   <td className="px-6 py-6 font-medium"><div className="h-6 w-48 bg-slate-100 rounded" /></td>
                   <td className="px-6 py-6 font-medium"><div className="h-6 w-24 bg-slate-100 rounded" /></td>
                   <td className="px-6 py-6 font-medium"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
                   <td className="px-6 py-6 font-medium"><div className="h-6 w-24 bg-slate-100 rounded" /></td>
                   <td className="px-6 py-6 text-right"></td>
                </tr>
              ))
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                      {u.name?.charAt(0) || u.email?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{u.name || "Unnamed User"}</p>
                      <p className="text-xs font-medium text-slate-400">{u.email || "No Email Associated"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    u.role === "admin" ? "bg-primary-navy text-white border-primary-navy" : 
                    u.role === "pro" ? "bg-secondary-teal/10 text-secondary-teal border-secondary-teal/20" : 
                    "bg-primary-blue/10 text-primary-blue border-primary-blue/20"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-6">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.status === "Suspended" ? "bg-red-500" : "bg-emerald-500"}`} />
                      <span className="text-sm font-bold text-slate-600">{u.status || "Active"}</span>
                   </div>
                </td>
                <td className="px-6 py-6">
                   <p className="text-sm font-bold text-slate-500">
                     {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Legacy Account"}
                   </p>
                </td>
                <td className="px-6 py-6 text-right">
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(u.id, u.status || "Active")}
                        className={`p-2 rounded-xl transition-all ${
                          u.status === "Suspended" ? "text-emerald-500 hover:bg-emerald-50" : "text-red-400 hover:bg-red-50"
                        }`}
                      >
                         {u.status === "Suspended" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </button>
                      <button className="p-2 text-slate-400 hover:text-primary-navy hover:bg-slate-200 rounded-xl transition-all">
                         <MoreVertical className="w-5 h-5" />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
    </AdminGuard>
  );
}

function StatsBox({ title, value, icon: Icon, color }: any) {
  return (
    <div className="premium-card p-6 flex flex-col items-center justify-center space-y-2 text-center">
       <div className={`${color} bg-slate-50 p-3 rounded-2xl`}>
          <Icon className="w-6 h-6" />
       </div>
       <p className="text-3xl font-bold font-outfit text-primary-navy">{value}</p>
       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
  );
}
