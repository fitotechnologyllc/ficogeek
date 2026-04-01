import Link from "next/link";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { ArrowRight, BookOpen, FileText, LayoutDashboard, ShieldCheck, UserCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 border-b border-slate-100 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
              <LogoIcon size={24} className="w-6 h-6" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-primary-navy">FICO <span className="text-primary-blue">GEEK</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#features" className="hover:text-primary-blue transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-how-it-works transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-primary-blue transition-colors">Pricing</Link>
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all font-semibold">Login</Link>
            <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-primary-navy text-white hover:bg-primary-navy-muted transition-all shadow-lg shadow-slate-900/10 font-semibold">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-secondary-teal/5 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-blue/10 border border-primary-blue/20 text-primary-blue text-sm font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" /> The Sovereign Ledger
            </div>
            <h1 className="font-outfit text-6xl font-bold leading-[1.1] tracking-tight">
              Smart <span className="text-primary-blue">Credit Dispute</span> Tools for Everyday Users.
            </h1>
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
              A secure self-help credit dispute and document workspace for professionals and individuals. Track, manage, and organize your credit journey with ease.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary-navy text-white rounded-2xl font-bold text-lg hover:bg-primary-navy-muted hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-2">
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-primary-navy border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                Learn More
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-secondary-teal" /> Secure Document Storage
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <LayoutDashboard className="w-4 h-4 text-secondary-teal" /> Personal & Pro Hubs
              </div>
            </div>
          </div>
          
          <div className="relative animate-in fade-in slide-in-from-right duration-1000">
            <div className="relative z-10 glass-card p-4 shadow-2xl">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="ml-4 h-4 w-32 bg-slate-100 rounded-md" />
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-slate-200 rounded" />
                      <div className="h-6 w-40 bg-primary-navy rounded" />
                    </div>
                    <div className="h-10 w-24 bg-primary-blue rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="h-12 w-full bg-slate-100 rounded-xl" />
                        <div className="h-4 w-full bg-slate-50 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-100 rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 rounded" />
                    <div className="h-4 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary-blue/20 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Trust Quote / Banner */}
      <section className="bg-primary-navy text-white py-12 relative overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-secondary-teal font-outfit text-sm font-semibold uppercase tracking-widest">Self-Help Philosophy</h3>
            <p className="text-2xl font-serif italic text-slate-300">Empowering your financial future through informed action and organization.</p>
          </div>
          <div className="h-12 w-px bg-slate-800 hidden md:block" />
          <div className="grid grid-cols-2 gap-12 sm:gap-16">
            <div className="text-center">
              <span className="block text-4xl font-bold font-outfit">100%</span>
              <span className="text-slate-400 text-xs font-semibold uppercase">Educational</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-bold font-outfit">Secure</span>
              <span className="text-slate-400 text-xs font-semibold uppercase">Document Hub</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section Preview */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-20">
            <h2 className="text-primary-blue font-semibold tracking-widest uppercase text-sm">Core Capabilities</h2>
            <h3 className="text-4xl font-bold font-outfit leading-tight">Everything you need to manage your credit documents.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="premium-card p-10 space-y-6 group">
              <div className="w-14 h-14 bg-primary-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-primary-blue group-hover:text-white transition-all duration-300">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold font-outfit">Dispute Wizard</h4>
              <p className="text-slate-500 leading-relaxed">Step-by-step guidance for creating professional credit dispute letters. Save drafts and track every update.</p>
            </div>
            <div className="premium-card p-10 space-y-6 group">
              <div className="w-14 h-14 bg-secondary-teal/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary-teal transition-all duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold font-outfit">Secure Vault</h4>
              <p className="text-slate-500 leading-relaxed">Keep all identification, responses, and reports in one encrypted location. Never lose a paper trail again.</p>
            </div>
            <div className="premium-card p-10 space-y-6 group">
              <div className="w-14 h-14 bg-primary-navy/5 rounded-2xl flex items-center justify-center group-hover:bg-primary-navy group-hover:text-white transition-all duration-300">
                <UserCheck className="w-7 h-7" />
              </div>
              <h4 className="text-2xl font-bold font-outfit">Pro Workspace</h4>
              <p className="text-slate-500 leading-relaxed">Scale your business with client management, shared documents, and advanced dispute tracking for experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  <LogoIcon size={32} className="w-8 h-8" />
                </div>
                <span className="font-outfit text-2xl font-bold tracking-tight text-primary-navy uppercase">FICO Geek</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                FICO Geek is a secure self-help credit dispute and document workspace. We provide educational resources and letter generation tools. We do not provide legal representation or guarantee credit score removals.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                <h5 className="font-bold text-sm uppercase tracking-widest text-slate-400">Platform</h5>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Personal</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Professional</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Marketplace</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-sm uppercase tracking-widest text-slate-400">Resources</h5>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Feature Help</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Pricing</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-sm uppercase tracking-widest text-slate-400">Legal</h5>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Terms of Service</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/" className="hover:text-primary-blue transition-colors">Disclosures</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-slate-400 text-xs font-semibold uppercase tracking-widest">
            <p>&copy; 2026 FICO Geek. All rights reserved.</p>
            <p>Built for the Sovereign Ledger.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
