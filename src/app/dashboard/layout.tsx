"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  FolderLock, 
  Settings, 
  Users, 
  LogOut, 
  ShieldCheck, 
  MessageSquare, 
  PlusCircle,
  Menu,
  X,
  History,
  CreditCard,
  Layout,
  Activity,
  Award,
  Handshake,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { LogoIcon } from "@/components/ui/LogoIcon";
import { 
  usePathname, 
  useRouter 
} from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowBar } from "@/components/dashboard/WorkflowBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = {
    personal: [
      { name: "Mission Control", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Dispute Hub", icon: PlusCircle, href: "/dashboard/disputes" },
      { name: "Document Forge", icon: FileText, href: "/dashboard/letters" },
      { name: "Agent Geek", icon: Sparkles, href: "/dashboard/ai" },
      { name: "Verification Vault", icon: FolderLock, href: "/dashboard/vault" },
      { name: "Account & Security", icon: Settings, href: "/dashboard/settings" },
      { name: "Billing", icon: CreditCard, href: "/dashboard/settings/billing" },
    ],
    pro: [
      { name: "Mission Control", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Clients", icon: Users, href: "/dashboard/clients" },
      { name: "Dispute Hub", icon: FileText, href: "/dashboard/disputes" },
      { name: "Verification Vault", icon: FolderLock, href: "/dashboard/vault" },
      { name: "Document Forge", icon: FileText, href: "/dashboard/letters" },
      { name: "Agent Geek", icon: Sparkles, href: "/dashboard/ai" },
      { name: "Billing", icon: CreditCard, href: "/dashboard/settings/billing" },
      { name: "Partner Program", icon: Handshake, href: "/dashboard/partner" },
      { name: "Account & Security", icon: Settings, href: "/dashboard/settings" },
    ],
    admin: [
      { name: "Mission Control", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Audit Logs", icon: History, href: "/dashboard/admin/audit" },
      { name: "Partners", icon: Handshake, href: "/dashboard/admin/partners" },
      { name: "Templates", icon: Layout, href: "/dashboard/admin/templates" },
      { name: "AI Logic Center", icon: Sparkles, href: "/dashboard/admin/ai" },
      { name: "Users", icon: Users, href: "/dashboard/admin/users" },
      { name: "Account & Security", icon: Settings, href: "/dashboard/settings" },
    ],
  };

  const isAdminOrOwner = profile?.role === "admin" || profile?.role === "owner";
  const currentNav = profile?.role === "pro" ? navItems.pro : isAdminOrOwner ? navItems.admin : navItems.personal;

  // Add Partner Dashboard to any role if they are a partner
  const finalNav = [...currentNav];
  if (profile?.isPartner && profile?.role !== 'admin') {
    // Insert after dashboard
    const partnerLink = { name: "Partner Portal", icon: Award, href: "/dashboard/partner" };
    if (!finalNav.find(n => n.href === '/dashboard/partner')) {
       finalNav.splice(1, 0, partnerLink);
    }
  }

  return (
    <ProtectedRoute>
      <SubscriptionProvider>
        <div className="min-h-screen bg-slate-50 flex">
          {/* Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-50 bg-primary-navy transition-all duration-300 transform ${
              isSidebarOpen ? "w-72" : "w-16"
            } hidden lg:block`}
          >
            <div className="flex flex-col h-full">
              <div className={`p-6 flex items-center ${isSidebarOpen ? "gap-3" : "justify-center"}`}>
                <div className="bg-white p-1.5 rounded-xl shadow-lg ring-1 ring-white/20">
                  <LogoIcon size={32} className="w-8 h-8" />
                </div>
                {isSidebarOpen && (
                  <span className="font-outfit font-bold text-white tracking-wider text-xl">GEEK</span>
                )}
              </div>

              <nav className="flex-1 mt-8 space-y-1 px-4">
                {finalNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center p-3.5 rounded-xl transition-all group ${
                      isSidebarOpen ? "gap-4" : "justify-center"
                    } hover:bg-white/10 text-slate-400 hover:text-white`}
                  >
                    <item.icon className="w-6 h-6 shrink-0" />
                    {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-white/5 space-y-4">
                {isSidebarOpen && profile && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                    {profile.photoURL ? (
                       <img src={profile.photoURL} alt={profile.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary-blue/20 flex items-center justify-center text-primary-blue font-bold">
                        {profile.name?.[0] || "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{profile.name}</p>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">{profile.role}</p>
                    </div>
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className={`w-full flex items-center p-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all ${
                    isSidebarOpen ? "gap-4 px-4" : "justify-center"
                  }`}
                >
                  <LogOut className="w-6 h-6" />
                  {isSidebarOpen && <span className="font-bold">Logout</span>}
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-16"}`}>
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between">
              <button 
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsMobileMenuOpen(true);
                  } else {
                    setIsSidebarOpen(!isSidebarOpen);
                  }
                }}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                id="mobile-menu-toggle"
              >
                <Menu className="w-6 h-6 text-slate-500" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">PLATFORM CORE</p>
                   <p className="text-sm font-bold text-primary-navy capitalize italic">Authorized {profile?.role || "Global"}</p>
                </div>
                {profile?.photoURL ? (
                   <img src={profile.photoURL} alt={profile.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                ) : (
                   <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-primary-navy font-bold text-xs">
                      {profile?.name?.[0] || "U"}
                   </div>
                )}
              </div>
            </header>

            {!pathname.startsWith("/dashboard/admin") && !pathname.startsWith("/dashboard/settings") && (
              <WorkflowBar />
            )}

            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>

          {/* Mobile Overlay & Sidebar */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
                />
                <motion.aside 
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-80 bg-primary-navy z-[70] lg:hidden flex flex-col shadow-2xl"
                >
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-1.5 rounded-xl shadow-lg ring-1 ring-white/20">
                        <LogoIcon size={32} className="w-8 h-8" />
                      </div>
                      <span className="font-outfit font-bold text-white tracking-wider text-xl">GEEK</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white/60 hover:text-white transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {finalNav.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          pathname === item.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{item.name}</span>
                      </Link>
                    ))}
                  </nav>

                  <div className="p-6 border-t border-white/5 space-y-6">
                    {profile && (
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary-blue/20 flex items-center justify-center text-primary-blue font-black text-xl">
                            {profile.name?.[0] || "U"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black text-base truncate">{profile.name}</p>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{profile.role} ACCESS</p>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-100 bg-red-500/10 hover:bg-red-500/20 transition-all font-black"
                    >
                      <LogOut className="w-6 h-6" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </div>
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}
