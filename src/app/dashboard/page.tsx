"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  Briefcase, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Users, 
  Zap, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Settings,
  Database
} from "lucide-react";
import Link from "next/link";
import { formatDisplayDate } from "@/lib/utils";
import { ForceAIEntryOverlay } from "@/components/dashboard/ForceAIEntryOverlay";

export default function DashboardPage() {
  const { profile } = useAuth();
  const isPro = profile?.role === "pro";

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Dynamic Overlay logic based on profile metadata */}
      {profile && !profile.firstAiSessionAt && (
        <ForceAIEntryOverlay onDismiss={() => {}} />
      )}

      {isPro ? <ProDashboard profile={profile} /> : <PersonalDashboard profile={profile} />}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
       <div className="w-1 h-6 bg-primary-blue rounded-full" />
       <h2 className="text-xl font-bold font-outfit text-primary-navy uppercase tracking-tight">{title}</h2>
    </div>
  );
}

function PersonalDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium tracking-tight">Active monitoring for {profile?.name}.</p>
        </div>
        <Link href="/dashboard/disputes/new" className="btn-primary flex items-center gap-2 shadow-2xl shadow-primary-blue/20 px-8 py-4">
          <PlusCircle className="w-5 h-5" /> Launch New Dispute
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <SectionHeader title="Active Disputes" />
           <div className="premium-card p-10 text-center space-y-8 bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-200">
                 <Zap className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-bold font-outfit text-primary-navy">No Active Cases</h3>
                 <p className="text-sm font-medium text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Your dispute ledger is currently empty. Use the Geek assistant to start an audit.</p>
              </div>
              <Link href="/dashboard/disputes/new" className="btn-secondary py-3 px-8 text-[10px] font-bold uppercase tracking-widest inline-flex">
                 Start First Case
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="premium-card p-8 space-y-4 group hover:bg-primary-navy hover:text-white transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue group-hover:bg-white/10 group-hover:text-white">
                    <FileText className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold font-outfit">Document Vault</h4>
                 <p className="text-sm font-medium opacity-60">Securely store your ID, Utility Bills, and Credit Reports.</p>
                 <Link href="/dashboard/vault" className="flex items-center gap-2 text-xs font-bold text-primary-blue group-hover:text-secondary-teal pt-2">
                    Access Vault <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>

              <div className="premium-card p-8 space-y-4 group hover:bg-secondary-teal hover:text-primary-navy transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-secondary-teal/10 rounded-xl flex items-center justify-center text-secondary-teal group-hover:bg-primary-navy/10">
                    <TrendingUp className="w-6 h-6" />
                 </div>
                 <h4 className="text-xl font-bold font-outfit">Score Insights</h4>
                 <p className="text-sm font-medium opacity-60">Analyze how your recent disputes are impacting your trends.</p>
                 <Link href="/dashboard/disputes" className="flex items-center gap-2 text-xs font-bold text-secondary-teal group-hover:text-primary-navy pt-2">
                    View Trends <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
           </div>
        </div>

        <div className="space-y-8">
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
             <Link 
                href="/dashboard/settings/security" 
                className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 no-underline"
              >
                 <Clock className="w-4 h-4" /> Check Audit Logs
              </Link>
          </div>

          <div className="premium-card p-6 space-y-4">
             <h4 className="font-bold text-slate-800">Education Tip</h4>
             <div className="p-4 bg-primary-blue/5 border-l-4 border-primary-blue rounded-r-xl space-y-2">
                <p className="text-sm font-bold text-primary-blue">Section 609 Rights</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Learn how to request verification of any negative item appearing on your credit report under the FCRA.</p>
             </div>
             <Link href="/dashboard/education/609-rights" className="flex items-center gap-2 text-xs font-bold text-primary-blue hover:underline">
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
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Pro Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-tight">Managing {profile?.name}&apos;s client universe.</p>
        </div>
        <Link href="/dashboard/clients/new" className="btn-primary flex items-center gap-2 shadow-2xl">
          <PlusCircle className="w-5 h-5" /> New Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Managed Clients" value="12" icon={Users} color="text-primary-blue" />
         <StatsCard label="Active Letters" value="48" icon={FileText} color="text-secondary-teal" />
         <StatsCard label="Response Rate" value="94%" icon={Zap} color="text-amber-500" />
         <StatsCard label="Audit Fidelity" value="100%" icon={ShieldCheck} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-6">
           <SectionHeader title="Recent Client Activity" />
           <div className="premium-card divide-y divide-slate-100 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-blue group-hover:text-white transition-all">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Client Case #{1024 + i}</p>
                      <p className="text-xs text-slate-500 font-medium">Letter drafted by Geek AI &bull; {3 - i}h ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-1 gap-4">
             <ActionCard title="Generate Pro Export" icon={Database} subtitle="Bulk download client records" href="/dashboard/admin/export" />
             <ActionCard title="Manage Templates" icon={FileText} subtitle="Update letter definitions" href="/dashboard/letters" />
             <ActionCard title="Billing Settings" icon={Settings} subtitle="Invoicing and platform fees" href="/dashboard/billing" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="premium-card p-6 space-y-2 border-b-4 border-b-transparent hover:border-b-primary-blue transition-all">
       <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
          <Icon className={`w-4 h-4 ${color}`} />
       </div>
       <p className="text-2xl font-bold font-outfit text-primary-navy tracking-tight">{value}</p>
    </div>
  );
}

function ActionCard({ title, icon: Icon, subtitle, href }: { 
  title: string; 
  icon: any; 
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="premium-card p-4 hover:bg-slate-50 transition-all cursor-pointer group flex items-center gap-4">
         <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-blue group-hover:text-white transition-all">
            <Icon className="w-6 h-6" />
         </div>
         <div className="flex-1">
            <p className="font-bold text-slate-800 leading-none mb-1">{title}</p>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
         </div>
         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-blue transition-all" />
      </div>
    </Link>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
