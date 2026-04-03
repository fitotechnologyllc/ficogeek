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
  Activity,
  Sparkles,
  Layout,
  Handshake,
  ExternalLink,
  ChevronRight,
  History as HistoryIcon
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
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Governance Infrastructure</span>
          </div>
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Institutional Command</h1>
          <p className="text-slate-500 font-medium tracking-tight">Executive oversight for Administrator {profile?.name}. Monitor platform health and audit integrity.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/dashboard/admin/audit" className="btn-secondary px-8 py-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-slate-50 border-slate-100">
              <HistoryIcon className="w-4 h-4" /> System Audit
           </Link>
           <Link href="/dashboard/admin/users" className="btn-primary px-10 py-4 flex items-center gap-3 shadow-2xl text-xs font-bold uppercase tracking-widest italic group">
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" /> Governance Center
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatsCard label="Platform Population" value="1,242" icon={Users} color="text-primary-blue" />
         <StatsCard label="System Uptime" value="100.0%" icon={ShieldCheck} color="text-emerald-500" />
         <StatsCard label="Audit Fidelity" value="High" icon={Activity} color="text-amber-500" />
         <StatsCard label="Total Forge Output" value="4,821" icon={FileText} color="text-secondary-teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            <SectionHeader title="Critical Protocols" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <ActionCard 
                 title="Logic Engine" 
                 icon={Sparkles} 
                 subtitle="Configure AI Strategist personas" 
                 href="/dashboard/admin/ai" 
               />
               <ActionCard 
                 title="Template Forge" 
                 icon={Layout} 
                 subtitle="Institutional document definitions" 
                 href="/dashboard/admin/templates" 
               />
               <ActionCard 
                 title="Partner Nexus" 
                 icon={Handshake} 
                 subtitle="Control affiliate revenue share" 
                 href="/dashboard/admin/partners" 
               />
               <ActionCard 
                 title="Audit Ledger" 
                 icon={HistoryIcon} 
                 subtitle="Global system event logs" 
                 href="/dashboard/admin/audit" 
               />
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <SectionHeader title="System Integrity" />
            <div className="premium-card p-10 bg-primary-navy text-white space-y-8 space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-8 -mt-8" />
               <div className="space-y-4">
                  <h3 className="font-bold text-xl font-outfit italic uppercase">Global Maintenance</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">Temporarily restrict client access for infrastructure upgrades or database migration.</p>
               </div>
               <button className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 italic">
                  Initiate Lockout Mode <ArrowRight className="w-4 h-4" />
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <Zap className="w-5 h-5 text-primary-blue animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Guided Workflow Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Mission Control</h1>
          <p className="text-slate-500 font-medium tracking-tight max-w-2xl text-lg">
            Welcome back, {profile?.name}. This is your strategic workspace to audit your credit history and defend your consumer rights.
          </p>
        </div>
        <Link href="/dashboard/disputes/new" className="btn-primary group flex items-center gap-4 shadow-2xl shadow-primary-blue/20 px-10 py-5 uppercase tracking-widest text-[10px] font-bold italic">
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Launch New Audit Case
        </Link>
      </div>

      {/* MISSION ROADMAP - START HERE */}
      <div className="premium-card p-1 text-white bg-primary-navy relative overflow-hidden group shadow-[0_50px_100px_rgba(30,41,59,0.3)]">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent)] pointer-events-none" />
         <div className="p-8 md:p-14 space-y-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-secondary-teal animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary-teal/80 italic">Step-by-Step Credit Review</span>
                  </div>
                  <h2 className="text-3xl md:text-6xl font-extrabold font-outfit tracking-tighter leading-[0.9] italic uppercase">The Sovereign Workflow</h2>
                  <p className="text-slate-400 font-medium max-w-xl text-lg">Follow this institutional protocol to audit your history and defend your rights.</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard/ai?mode=intake" className="btn-primary bg-white text-primary-navy px-10 py-5 hover:bg-slate-50 border-none shadow-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 italic">
                     <Sparkles className="w-4 h-4 fill-primary-navy" /> Launch Geek Assistant
                  </Link>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
               <WorkflowStep 
                 number="01" 
                 title="Get Reports" 
                 desc="Access official reports from all 3 bureaus at AnnualCreditReport.com. This is your mission baseline." 
                 cta="Get Official Reports"
                 href="https://www.annualcreditreport.com"
                 external
               />
               <WorkflowStep 
                 number="02" 
                 title="Review Reports" 
                 desc="Analyze your reports for inaccuracies, duplicates, or outdated accounts in the Dispute Hub." 
                 cta="Open Dispute Hub"
                 href="/dashboard/disputes"
               />
               <WorkflowStep 
                 number="03" 
                 title="Start Dispute" 
                 desc="Use Geek AI or manual protocols to identify specific legal grounds for your verification mission." 
                 cta="Identify Errors"
                 href="/dashboard/ai"
               />
               <WorkflowStep 
                 number="04" 
                 title="Generate Letter" 
                 desc="Forge high-fidelity Section 609 letters using our institutional template engine or AI forge." 
                 cta="Forge Documents"
                 href="/dashboard/letters"
               />
               <WorkflowStep 
                 number="05" 
                 title="Upload Evidence" 
                 desc="Secure your ID and proof of residence in the Vault to ensure the bureaus cannot reject your request." 
                 cta="Secure Vault"
                 href="/dashboard/vault"
               />
               <WorkflowStep 
                 number="06" 
                 title="Track Progress" 
                 desc="Monitor the 30-day clock and analyze bureau responses to determine your next strategic move." 
                 cta="View Mission Status"
                 href="/dashboard"
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
           <SectionHeader title="Strategic Resources" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="premium-card p-12 flex flex-col justify-between group hover:border-primary-blue transition-all border-2 border-transparent bg-white shadow-xl">
                 <div className="space-y-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-primary-navy shadow-inner group-hover:bg-primary-navy group-hover:text-white transition-all transform group-hover:rotate-3">
                       <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-3xl font-bold font-outfit text-primary-navy leading-none italic uppercase">Official Data</h3>
                       <p className="text-slate-500 font-medium leading-relaxed italic">By federal law, you are entitled to a free credit report from each bureau every 12 months. This is your institutional edge.</p>
                    </div>
                 </div>
                 <div className="pt-10 space-y-4">
                    <a 
                      href="https://www.annualcreditreport.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 bg-primary-blue/5 border border-primary-blue/10 rounded-2xl hover:bg-primary-blue/10 transition-all group/link"
                    >
                       <span className="font-bold text-primary-blue italic text-xs uppercase tracking-widest">AnnualCreditReport.com</span>
                       <ArrowRight className="w-5 h-5 text-primary-blue group-hover/link:translate-x-1 transition-transform" />
                    </a>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center italic">Institutional Source Verification Required</p>
                 </div>
              </div>

              <div className="premium-card p-12 flex flex-col justify-between bg-white shadow-xl hover:border-primary-blue transition-all border-2 border-transparent">
                 <div className="space-y-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center text-primary-blue shadow-inner group-hover:scale-110 transition-transform">
                       <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-3xl font-bold font-outfit text-primary-navy leading-none italic uppercase">The Big Three</h3>
                       <p className="text-slate-500 font-medium leading-relaxed italic">Most report errors exist on one file but not the others. Review all three bureaus to identify institutional discrepancies.</p>
                    </div>
                 </div>
                 
                 <div className="pt-10 grid grid-cols-3 gap-3">
                    <BureauMiniTag name="EX" />
                    <BureauMiniTag name="EQ" />
                    <BureauMiniTag name="TU" />
                 </div>
              </div>
           </div>

            <SectionHeader title="Mission Status Ledger" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <StatusSummaryCard label="Sent Letters" value="0" icon={FileText} />
               <StatusSummaryCard label="Pending Responses" value="0" icon={Clock} />
               <StatusSummaryCard label="Completed Disputes" value="0" icon={ShieldCheck} />
            </div>

            <div className="premium-card p-20 text-center space-y-10 bg-white border-2 border-dashed border-slate-100 rounded-[3rem]">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-center mx-auto text-slate-200 rotate-6 shadow-inner transition-transform hover:rotate-0 duration-500">
                  <Activity className="w-12 h-12" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Active Mission Awaiting Data</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed italic">
                    Your credit repair journey begins with data. Secure your official reports from AnnualCreditReport.com to populate your audit ledger.
                  </p>
               </div>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link href="/dashboard/disputes/new" className="btn-primary py-5 px-12 text-[10px] font-bold uppercase tracking-[0.2em] inline-flex italic shadow-xl">
                    Draft First Dispute
                 </Link>
                 <Link href="/dashboard/ai" className="btn-secondary py-5 px-12 text-[10px] font-bold uppercase tracking-[0.2em] inline-flex italic bg-slate-50 border-slate-100 hover:bg-slate-100 transition-all">
                    Consult Agent Geek
                 </Link>
               </div>
            </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <SectionHeader title="Vault Infrastructure" />
          <div className="premium-card p-10 space-y-8 bg-primary-navy text-white relative overflow-hidden group shadow-[0_50px_100px_rgba(30,41,59,0.2)]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-secondary-teal/20 transition-all" />
             <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-8 h-8 text-secondary-teal" />
                   </div>
                   <div>
                      <p className="font-extrabold text-2xl leading-none italic uppercase font-outfit">SafeVault</p>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-1 italic">AES-256 ISOLATION</p>
                   </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">Your uploaded correspondence and identity documents are logically isolated and encrypted on the Sovereign Ledger.</p>
             </div>
             <Link 
                href="/dashboard/vault" 
                className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 no-underline italic"
              >
                 Enter Verification Vault <ArrowRight className="w-4 h-4" />
              </Link>
          </div>

          <div className="premium-card p-10 space-y-8 bg-white shadow-xl border-slate-100 group">
             <div className="flex items-center gap-3 text-primary-blue border-b border-slate-50 pb-6">
                <TrendingUp className="w-6 h-6 group-hover:scale-125 transition-transform" />
                <h4 className="font-bold uppercase tracking-widest text-xs italic">Educational Briefing</h4>
             </div>
             <div className="space-y-5">
                <div className="p-6 bg-slate-50 rounded-2xl space-y-3 group/item hover:bg-primary-navy transition-all cursor-pointer">
                   <p className="text-xs font-bold text-primary-blue group-hover/item:text-secondary-teal uppercase tracking-widest italic leading-none">FCRA Rights (Sec. 609)</p>
                   <p className="text-[10px] text-slate-500 group-hover/item:text-slate-300 font-medium leading-relaxed italic">Learn how to request verification of questionable items directly from the bureaus.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl space-y-3 group/item hover:bg-primary-navy transition-all cursor-pointer">
                   <p className="text-xs font-bold text-primary-blue group-hover/item:text-secondary-teal uppercase tracking-widest italic leading-none">The 30-Day Clock</p>
                   <p className="text-[10px] text-slate-500 group-hover/item:text-slate-300 font-medium leading-relaxed italic">Bureaus generally have 30 days to investigate and respond to your audit request.</p>
                </div>
             </div>
             <Link href="/dashboard/ai" className="flex items-center gap-3 text-xs font-extrabold text-primary-blue hover:text-primary-navy transition-colors uppercase tracking-widest italic pt-2 group/ask">
                Ask Geek AI for Guidance <ArrowRight className="w-4 h-4 group-hover/ask:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, desc, cta, href, external = false }: any) {
  const content = (
    <div className="p-8 rounded-[2rem] space-y-6 border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/step cursor-pointer h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-extrabold font-outfit opacity-20 group-hover:opacity-100 transition-opacity duration-500">{number}</span>
          <ArrowRight className="w-5 h-5 text-secondary-teal opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-lg uppercase tracking-widest italic leading-none">{title}</h4>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">{desc}</p>
        </div>
      </div>
      <div className="pt-4">
        <span className="text-[9px] font-bold text-secondary-teal uppercase tracking-[0.2em] border-b border-secondary-teal/30 group-hover:border-secondary-teal transition-all pb-1 italic">
          {cta}
        </span>
      </div>
    </div>
  );

  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">{content}</a>;
  }

  return <Link href={href} className="no-underline">{content}</Link>;
}

function StatusSummaryCard({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="premium-card p-6 flex items-center justify-between bg-white shadow-sm border-slate-100 border-l-4 border-l-primary-blue">
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mb-1">{label}</p>
          <p className="text-2xl font-bold font-outfit text-primary-navy tracking-tight">{value}</p>
       </div>
       <Icon className="w-8 h-8 text-slate-100" />
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

