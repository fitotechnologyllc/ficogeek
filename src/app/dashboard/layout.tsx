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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = {
    personal: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Dispute Center", icon: PlusCircle, href: "/dashboard/disputes" },
      { name: "Letter Center", icon: FileText, href: "/dashboard/letters" },
      { name: "Geek AI", icon: Sparkles, href: "/dashboard/ai" },
      { name: "Document Vault", icon: FolderLock, href: "/dashboard/vault" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
      { name: "Billing", icon: CreditCard, href: "/dashboard/settings/billing" },
    ],
    pro: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Clients", icon: Users, href: "/dashboard/clients" },
      { name: "Disputes", icon: FileText, href: "/dashboard/disputes" },
      { name: "Documents", icon: FolderLock, href: "/dashboard/vault" },
      { name: "Letters", icon: FileText, href: "/dashboard/letters" },
      { name: "Geek AI", icon: Sparkles, href: "/dashboard/ai" },
      { name: "Billing", icon: CreditCard, href: "/dashboard/settings/billing" },
      { name: "Partner Program", icon: Handshake, href: "/dashboard/partner" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
    admin: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { name: "Audit Logs", icon: History, href: "/dashboard/admin/audit" },
      { name: "Partners", icon: Handshake, href: "/dashboard/admin/partners" },
      { name: "Templates", icon: Layout, href: "/dashboard/admin/templates" },
      { name: "AI Logic Center", icon: Sparkles, href: "/dashboard/admin/ai" },
      { name: "Users", icon: Users, href: "/dashboard/admin/users" },
      { name: "Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  };

  const currentNav = profile?.role === "pro" ? navItems.pro : profile?.role === "admin" ? navItems.admin : navItems.personal;

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
                  <span className="font-outfit font-bold text-white tracking-wider text-xl">FICO GEEK</span>
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
                    <div className="w-10 h-10 rounded-lg bg-primary-blue/20 flex items-center justify-center text-primary-blue font-bold">
                      {profile.name?.[0] || "U"}
                    </div>
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
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-500" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Workspace</p>
                   <p className="text-sm font-bold text-primary-navy">{profile?.role || "Global"} environment</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
              </div>
            </header>

            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      </SubscriptionProvider>
    </ProtectedRoute>
  );
}
