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
  Database,
  Activity
} from "lucide-react";
import Link from "next/link";
import { formatDisplayDate } from "@/lib/utils";
import { ForceAIEntryOverlay } from "@/components/dashboard/ForceAIEntryOverlay";

export default function DashboardPage() {
  const { profile, isAdminOrOwner } = useAuth();
  const isPro = profile?.role === "pro";

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Dynamic Overlay logic based on profile metadata */}
      {profile && !profile.firstAiSessionAt && (
        <ForceAIEntryOverlay onDismiss={() => {}} />
      )}

      {isAdminOrOwner ? (
        <AdminDashboard profile={profile} />
      ) : isPro ? (
        <ProDashboard profile={profile} />
      ) : (
        <PersonalDashboard profile={profile} />
      )}
    </div>
  );
}

function AdminDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight">Institutional Command</h1>
          <p className="text-slate-500 font-medium tracking-tight">System-wide oversight for Sovereign Administrator {profile?.name}.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/dashboard/admin/audit" className="btn-secondary px-8 py-4 flex items-center gap-2">
              <Database className="w-5 h-5" /> View Audit Ledger
           </Link>
           <Link href="/dashboard/admin/users" className="btn-primary px-8 py-4 flex items-center gap-2 shadow-2xl">
              <Users className="w-5 h-5" /> Governance
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Platform Users" value="1.2k" icon={Users} color="text-primary-blue" />
         <StatsCard label="System Integrity" value="100%" icon={ShieldCheck} color="text-emerald-500" />
         <StatsCard label="AI Throughput" value="84%+" icon={Zap} color="text-amber-500" />
         <StatsCard label="Active Disputes" value="442" icon={FileText} color="text-secondary-teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <SectionHeader title="Critical System Events" />
            <div className="premium-card p-10 bg-slate-50/30 border-dashed border-2 border-slate-100 text-center space-y-4">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-200">
                  <Activity className="w-8 h-8" />
               </div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Security Alerts Detected</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ActionCard title="Promo Engine" icon={Zap} subtitle="Manage access tokens" href="/dashboard/admin/promo" />
               <ActionCard title="Logic Center" icon={Settings} subtitle="Configure AI personas" href="/dashboard/admin/ai" />
            </div>
         </div>

         <div className="space-y-8">
            <SectionHeader title="Admin Controls" />
            <div className="premium-card p-8 bg-primary-navy text-white space-y-6">
               <h3 className="font-bold text-xl font-outfit italic">Global Maintenance</h3>
               <p className="text-sm text-slate-400 leading-relaxed font-medium">Toggle platform-wide maintenance mode or schedule system upgrades.</p>
               <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  Enter Maintenance <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
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
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Command Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">Active mission oversight for {profile?.name}.</p>
        </div>
        <Link href="/dashboard/disputes/new" className="btn-primary flex items-center gap-2 shadow-2xl shadow-primary-blue/20 px-8 py-4 uppercase tracking-widest text-[10px] font-bold">
          <PlusCircle className="w-5 h-5" /> Launch New Case
        </Link>
      </div>

      {/* MISSION TIMELINE - START HERE */}
      <div className="premium-card p-1 text-white bg-primary-navy relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-blue/10 blur-[100px] -mr-40 -mt-40 group-hover:bg-primary-blue/20 transition-all duration-1000" />
         <div className="p-8 md:p-12 space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-secondary-teal animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary-teal/80">Operational Guidance</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tighter leading-none italic">MISSION: START HERE</h2>
                  <p className="text-slate-400 font-medium max-w-lg">Follow the Sovereign Ledger workflow to audit and prepare your credit dispute documentation.</p>
               </div>
               <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/ai?mode=intake" className="btn-primary bg-white text-primary-navy px-8 py-4 hover:bg-slate-50 border-none shadow-none text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                     <Zap className="w-4 h-4 fill-primary-navy" /> Start with Geek
                  </Link>
                  <a href="https://www.annualcreditreport.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                     <ExternalLink className="w-4 h-4" /> Reports Source
                  </a>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
               <TimelineStep number="01" title="Get Reports" desc="Visit AnnualCreditReport.com for official documents." active />
               <TimelineStep number="02" title="Review Inaccuracies" desc="Audit all three bureaus for questionable data." />
               <TimelineStep number="03" title="Prepare Document" desc="Generate professional letters with Geek AI." />
               <TimelineStep number="04" title="Track & Upload" desc="Dispatch letters and log results in the Ledger." />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-10">
           {/* OFFICIAL REPORT INTEGRATION */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="premium-card p-10 flex flex-col justify-between group hover:border-primary-blue hover:border-2 border-2 border-transparent transition-all">
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-navy shadow-inner group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold font-outfit text-primary-navy leading-none">Official Report Access</h3>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed">By federal law, you are entitled to a free credit report from each bureau every 12 months.</p>
                    </div>
                 </div>
                 <div className="pt-8 space-y-4">
                    <a 
                      href="https://www.annualcreditreport.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-primary-blue/5 border border-primary-blue/10 rounded-2xl hover:bg-primary-blue/10 transition-all group/link"
                    >
                       <span className="font-bold text-primary-blue italic text-sm">AnnualCreditReport.com</span>
                       <ArrowRight className="w-5 h-5 text-primary-blue group-hover/link:translate-x-1 transition-transform" />
                    </a>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center italic">Institutional Source Verification Required</p>
                 </div>
              </div>

              <div className="premium-card p-10 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-primary-blue shadow-lg">
                       <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold font-outfit text-primary-navy leading-none italic">Audit Three Bureaus</h3>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed">Review Experian, Equifax, and TransUnion. Errors often vary between systems.</p>
                    </div>
                 </div>
                 
                 <div className="pt-8 grid grid-cols-3 gap-2">
                    <BureauMiniTag name="EX" />
                    <BureauMiniTag name="EQ" />
                    <BureauMiniTag name="TU" />
                 </div>
              </div>
           </div>

           <SectionHeader title="Active Dispute Ledger" />
           <div className="premium-card p-16 text-center space-y-10 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-200 rotate-3 shadow-inner">
                 <Database className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-3xl font-extrabold font-outfit text-primary-navy tracking-tight italic">NO DISPUTES DETECTED</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                   Your ledger is currently inactive. Start by reviewing your reports and identifying inaccurate or questionable items for audit.
                 </p>
              </div>
              <Link href="/dashboard/disputes/new" className="btn-primary py-4 px-12 text-[10px] font-bold uppercase tracking-[0.2em] inline-flex italic">
                 Initialize First Case
              </Link>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <SectionHeader title="System Integrity" />
          <div className="premium-card p-8 space-y-8 bg-primary-navy text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-secondary-teal/20 transition-all" />
             <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-10 h-10 text-secondary-teal" />
                   <div>
                      <p className="font-bold text-xl leading-none italic uppercase">SafeVault Active</p>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1 italic">AES-256 SESSION PROTECTION</p>
                   </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Your uploaded correspondence and identity documents are logically isolated and encrypted on the Sovereign Ledger.</p>
             </div>
             <Link 
                href="/dashboard/vault" 
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 no-underline italic"
              >
                 Access Vault Infrastructure <ArrowRight className="w-4 h-4" />
              </Link>
          </div>

          <div className="premium-card p-8 space-y-6">
             <div className="flex items-center gap-2 text-primary-blue border-b border-slate-50 pb-4">
                <TrendingUp className="w-5 h-5" />
                <h4 className="font-bold uppercase tracking-widest text-[10px] italic">Educational Briefing</h4>
             </div>
             <div className="space-y-4">
                <div className="p-5 bg-slate-50 rounded-2xl space-y-2 group hover:bg-primary-blue group-hover:text-white transition-all cursor-pointer">
                   <p className="text-xs font-bold text-primary-blue group-hover:text-white uppercase tracking-widest">FCRA Rights (Sec. 609)</p>
                   <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-medium leading-relaxed italic">Learn how to request verification of questionable items directly from the bureaus.</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl space-y-2 group hover:bg-primary-blue transition-all cursor-pointer">
                   <p className="text-xs font-bold text-primary-blue group-hover:text-white uppercase tracking-widest">Bureau Tracking</p>
                   <p className="text-[10px] text-slate-500 group-hover:text-white/80 font-medium leading-relaxed italic">Bureaus generally have 30 days to investigate and respond to your audit request.</p>
                </div>
             </div>
             <Link href="/dashboard/ai" className="flex items-center gap-2 text-[10px] font-extrabold text-primary-blue hover:text-primary-navy transition-colors uppercase tracking-widest italic pt-2">
                Ask Geek AI for Guidance <ArrowRight className="w-3 h-3" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ number, title, desc, active = false }: any) {
   return (
      <div className={`p-6 rounded-3xl space-y-4 border transition-all ${
         active ? "bg-white/10 border-white/20 shadow-2xl" : "bg-transparent border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
      }`}>
         <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-outfit opacity-20">{number}</span>
            {active && <div className="w-2 h-2 rounded-full bg-secondary-teal" />}
         </div>
         <div className="space-y-1">
            <h4 className="font-bold text-sm uppercase tracking-widest">{title}</h4>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{desc}</p>
         </div>
      </div>
   );
}

function BureauMiniTag({ name }: { name: string }) {
   return (
      <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm">
         <span className="text-[10px] font-extrabold text-primary-navy italic font-outfit">{name}</span>
      </div>
   );
}

function ExternalLink({ className }: { className?: string }) {
   return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
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
