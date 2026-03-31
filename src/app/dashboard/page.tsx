"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  FileText, 
  Users, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle,
  ArrowRight,
  Database,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.role || "personal";

  if (role === "personal") return <PersonalDashboard profile={profile} />;
  if (role === "pro") return <ProDashboard profile={profile} />;
  return <AdminDashboard profile={profile} />;
}

function PersonalDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Hello, {profile?.name}</h1>
          <p className="text-slate-500 font-medium tracking-tight">Welcome to your secure credit workspace.</p>
        </div>
        <Link 
          href="/dashboard/disputes/new" 
          className="btn-primary flex items-center gap-2 shadow-2xl"
        >
          <PlusCircle className="w-5 h-5" /> Start New Dispute
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Disputes" value="4" icon={TrendingUp} color="text-primary-blue" bg="bg-primary-blue/10" />
        <StatCard title="Letters Generated" value="12" icon={FileText} color="text-secondary-teal" bg="bg-secondary-teal/10" />
        <StatCard title="Saved Documents" value="8" icon={Database} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Deadlines" value="2" icon={Clock} color="text-amber-600" bg="bg-amber-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Recent Activity" link="/dashboard/disputes" />
          <div className="premium-card overflow-hidden">
            <div className="divide-y divide-slate-100">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-blue/10 group-hover:text-primary-blue transition-all">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">TransUnion Dispute Letter</p>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Type: Verification • 3 days ago</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest rounded-full">Waiting response</span>
                       <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-primary-blue transition-all" />
                    </div>
                 </div>
               ))}
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
              <Link href="/dashboard/disputes" className="text-sm font-bold text-primary-blue hover:underline">View all activity</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title="System Status" />
          <div className="premium-card p-6 space-y-6 bg-gradient-to-br from-primary-navy to-primary-navy-muted text-white">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-secondary-teal" />
                <div>
                   <p className="font-bold text-lg leading-none">SafeVault Active</p>
                   <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Status: Operational</p>
                </div>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed font-medium">Your documents are protected with AES-256 encryption. Only you have access to your private key.</p>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Check Audit Logs
             </button>
          </div>

          <div className="premium-card p-6 space-y-4">
             <h4 className="font-bold text-slate-800">Education Tip</h4>
             <div className="p-4 bg-primary-blue/5 border-l-4 border-primary-blue rounded-r-xl space-y-2">
                <p className="text-sm font-bold text-primary-blue">Section 609 Rights</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Learn how to request verification of any negative item appearing on your credit report under the FCRA.</p>
             </div>
             <Link href="#" className="flex items-center gap-2 text-xs font-bold text-primary-blue hover:underline">
                Read full resource <ArrowRight className="w-3 h-3" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Pro Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-tight">Managing {profile?.name}&apos;s client universe.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-2xl">
          <PlusCircle className="w-5 h-5" /> New Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value="28" icon={Users} color="text-primary-blue" bg="bg-primary-blue/10" />
        <StatCard title="Active Cases" value="84" icon={TrendingUp} color="text-secondary-teal" bg="bg-secondary-teal/10" />
        <StatCard title="Letters Sent" value="156" icon={FileText} color="text-purple-600" bg="bg-purple-100" />
        <StatCard title="Revenue (est)" value="$1,240" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Recent Client Activity" link="/dashboard/clients" />
          <div className="premium-card">
            <div className="divide-y divide-slate-100">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold">
                          JD
                       </div>
                       <div>
                          <p className="font-bold text-slate-800">Jane Doe</p>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Added 6 new documents • 2h ago</p>
                       </div>
                    </div>
                    <Link href={`/dashboard/clients/${i}`} className="p-2 rounded-lg bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                       <ArrowRight className="w-5 h-5 text-slate-400" />
                    </Link>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-1 gap-4">
             <ActionCard title="Generate Pro Export" icon={Database} subtitle="Bulk download client records" />
             <ActionCard title="Manage Templates" icon={FileText} subtitle="Update letter definitions" />
             <ActionCard title="Billing Settings" icon={Settings} subtitle="Invoicing and platform fees" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold font-outfit text-primary-navy">Global Administration</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Global Users" value="1,204" icon={Users} color="text-primary-blue" bg="bg-primary-blue/10" />
        <StatCard title="Pro Accounts" value="42" icon={CheckCircle2} color="text-secondary-teal" bg="bg-secondary-teal/10" />
        <StatCard title="Total Letters" value="8,492" icon={FileText} color="text-purple-600" bg="bg-purple-100" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="premium-card p-6 flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
        <p className="text-3xl font-bold font-outfit text-primary-navy leading-none">{value}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, link }: any) {
  return (
    <div className="flex justify-between items-center px-1">
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      {link && (
        <Link href={link} className="text-sm font-bold text-primary-blue hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function ActionCard({ title, icon: Icon, subtitle }: any) {
  return (
    <div className="premium-card p-4 hover:bg-slate-50 transition-all cursor-pointer group flex items-center gap-4">
       <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-blue group-hover:text-white transition-all">
          <Icon className="w-6 h-6" />
       </div>
       <div className="flex-1">
          <p className="font-bold text-slate-800 leading-none mb-1">{title}</p>
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
       </div>
       <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-blue transition-all" />
    </div>
  );
}
