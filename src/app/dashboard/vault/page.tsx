"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  FolderLock, 
  ShieldCheck, 
  File, 
  Trash2, 
  Download, 
  MoreVertical,
  CloudUpload,
  AlertCircle,
  Tag as TagIcon,
  Archive,
  Link as LinkIcon,
  XCircle,
  CheckCircle2,
  UserCheck,
  Home,
  Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  orderBy 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { logAuditAction } from "@/lib/audit";
import { formatDisplayDate } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = [
  { name: "All Documents", icon: "Files", hint: "Full archival access to your secure forge." },
  { name: "Identification", icon: "UserCheck", hint: "Drivers License or Passport. Must be clear/legible." },
  { name: "Proof of Address", icon: "Home", hint: "Utility bill or Bank statement (Last 60 days)." },
  { name: "Credit Reports", icon: "BarChart3", hint: "Official PDF exports from AnnualCreditReport.com." },
  { name: "Letters", icon: "Send", hint: "Drafted and signed dispute correspondences." },
  { name: "Bureau Responses", icon: "Shield", hint: "Incoming mail from Equifax, Experian, or TransUnion." },
  { name: "Other", icon: "MoreHorizontal", hint: "Supporting evidence or miscellaneous records." }
];

const QUICK_TAGS = ["Sensitive", "Verified", "Pending Review", "High Priority"];

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const { user, profile } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "documents"), 
        where("ownerUID", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesCategory = selectedCategory === "All Documents" || doc.category === selectedCategory;
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = viewMode === "archived" ? doc.status === "Archived" : doc.status !== "Archived";
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [documents, selectedCategory, searchQuery, viewMode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storagePath = `documents/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      const docData = {
        name: file.name,
        originalFilename: file.name,
        size: file.size,
        mimeType: file.type,
        category: selectedCategory === "All Documents" ? "Other" : selectedCategory,
        url,
        storagePath,
        ownerUID: user.uid,
        status: "Active",
        tags: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        uploadedByUID: user.uid
      };

      const docRef = await addDoc(collection(db, "documents"), docData);

      await logAuditAction(
        user.uid,
        profile?.name || user.email!,
        profile?.role || "user",
        "FILE_UPLOAD",
        `Uploaded document: ${file.name}`,
        "DOCUMENT",
        docRef.id
      );

      fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const toggleArchive = async (docId: string, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === "Archived" ? "Active" : "Archived";
    try {
      await updateDoc(doc(db, "documents", docId), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      await logAuditAction(
        user.uid,
        profile?.name || user.email!,
        profile?.role || "user",
        newStatus === "Archived" ? "FILE_ARCHIVE" : "SENSITIVE_RECORD_UPDATE",
        `${newStatus === "Archived" ? "Archived" : "Restored"} document: ${docId}`,
        "DOCUMENT",
        docId
      );

      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryHint = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.hint || "";
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-secondary-teal animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Evidence Isolation Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Verification Vault</h1>
          <p className="text-slate-500 font-medium tracking-tight max-w-2xl text-lg">
            Securely store your identification protocols and audit evidence. Every document is encrypted and isolated for your protection.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setViewMode(viewMode === "active" ? "archived" : "active")}
             className={`px-8 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 border italic shadow-sm hover:shadow-xl active:scale-95 ${
               viewMode === "archived" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-400 border-slate-100"
             }`}
           >
              <Archive className="w-5 h-5" /> {viewMode === "archived" ? "Viewing Archive" : "Vault Archives"}
           </button>
           <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={handleUpload}
                disabled={uploading}
              />
              <button 
                className="btn-primary flex items-center gap-4 py-5 px-10 shadow-2xl disabled:opacity-50 uppercase tracking-widest text-[10px] font-bold italic active:scale-95"
                disabled={uploading}
              >
                <CloudUpload className="w-6 h-6" /> {uploading ? "Securing Forge..." : "Safe Upload"}
              </button>
           </div>
        </div>
      </div>

      {/* VAULT PROTOCOL HERO */}
      <div className="premium-card p-1 text-white bg-primary-navy relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
         <div className="p-10 md:p-14 space-y-12 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary-teal/80 italic">Institutional Integrity Protocol</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-extrabold font-outfit tracking-tighter leading-none italic uppercase">Evidence Isolation</h2>
                  <p className="text-slate-400 font-medium max-w-2xl text-lg italic">Bureaus will reject disputes if they cannot verify your identity. The Vault ensures your &quot;Verification Stack&quot; is always audit-ready.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
               <VaultModule 
                  title="Identification" 
                  metric="ID Stack"
                  desc="A clear photo of your driver&apos;s license or passport. Must show all 4 corners and be high-resolution." 
                  status="MANDATORY"
                  icon={<UserCheck className="w-6 h-6" />}
               />
               <VaultModule 
                  title="Residency" 
                  metric="Address Proof"
                  desc="Utility bills, bank statements, or insurance docs from the last 60 days matching your profile." 
                  status="MANDATORY"
                  icon={<Home className="w-6 h-6" />}
               />
               <VaultModule 
                  title="Audit Trail" 
                  metric="Bureau Mail"
                  desc="Every response from a bureau must be uploaded here to maintain legal leverage." 
                  status="OPERATIONAL"
                  icon={<Shield className="w-6 h-6" />}
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-10">
           {/* Category Navigation */}
           <div className="space-y-4">
              <SectionHeader title="Vault Directory" />
              <div className="space-y-3">
                 {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left p-6 rounded-3xl font-bold text-[11px] transition-all flex flex-col gap-2 group border-2 relative overflow-hidden ${
                         selectedCategory === cat.name ? "bg-primary-navy text-white border-primary-navy shadow-2xl scale-[1.02]" : "text-slate-500 hover:bg-slate-50 border-slate-50"
                      }`}
                    >
                       {selectedCategory === cat.name && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8" />
                       )}
                       <div className="flex items-center justify-between relative z-10">
                          <span className="uppercase tracking-widest italic">{cat.name}</span>
                          <span className={`text-[9px] px-3 py-1 rounded-full font-bold ${selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                             {cat.name === "All Documents" ? documents.length : documents.filter(d => d.category === cat.name).length}
                          </span>
                       </div>
                       <p className={`text-[10px] font-medium leading-tight italic relative z-10 ${selectedCategory === cat.name ? "text-slate-400" : "text-slate-400 group-hover:text-slate-500"}`}>
                          {cat.hint}
                       </p>
                    </button>
                 ))}
              </div>
           </div>

            <SectionHeader title="Mission Checklist" />
            <div className="premium-card p-10 bg-white border-2 border-slate-50 space-y-6 shadow-sm group">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-secondary-teal" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Vault Readiness</span>
                  </div>
                  <div className="space-y-3">
                     <RequirementItem text="ID is not expired." />
                     <RequirementItem text="Address proof is <60 days old." />
                     <RequirementItem text="All text is legible (no blur)." />
                     <RequirementItem text="All 4 corners of docs visible." />
                  </div>
               </div>
            </div>

            <SectionHeader title="Final Mission" />
            <div className="premium-card p-10 bg-primary-navy text-white space-y-8 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-secondary-teal/20 transition-all duration-700" />
               <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                        <Archive className="w-6 h-6 text-secondary-teal" />
                     </div>
                     <p className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest leading-none italic">Step 6: Track</p>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider italic">
                    Once your letters are sent and your Vault is primed, return to the Dashboard to initiate the 30-day monitoring clock.
                  </p>
                  <Link href="/dashboard" className="btn-primary py-4 w-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest italic shadow-lg">
                    Return to Mission Control
                  </Link>
               </div>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
           <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 group">
                 <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault archives by name or protocol..."
                  className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-primary-blue/5 outline-none font-bold text-slate-700 transition-all shadow-sm hover:shadow-xl placeholder:text-slate-300 italic"
                 />
              </div>
           </div>

           {/* Document List View */}
           <div className="premium-card overflow-hidden bg-white shadow-2xl border-slate-100">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-extrabold text-primary-navy font-outfit uppercase italic tracking-tight">{selectedCategory}</h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">{filteredDocuments.length} Verified Records Found</p>
                 </div>
                 <button className="p-4 text-slate-200 hover:text-primary-blue transition-all bg-white border border-slate-50 rounded-2xl shadow-sm">
                    <MoreVertical className="w-6 h-6" />
                 </button>
              </div>

              <div className="divide-y divide-slate-100">
                 {loading ? (
                    [1, 2, 3].map(i => (
                       <div key={i} className="p-12 flex items-center gap-10 animate-pulse">
                          <div className="w-20 h-20 bg-slate-50 rounded-[2rem]" />
                          <div className="space-y-4 flex-1">
                             <div className="h-6 w-80 bg-slate-50 rounded-lg" />
                             <div className="h-3 w-40 bg-slate-50/50 rounded-lg" />
                          </div>
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl" />
                       </div>
                    ))
                 ) : filteredDocuments.length === 0 ? (
                      <div className="p-44 text-center space-y-10 bg-slate-50/10">
                         <div className="w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center mx-auto text-slate-100 border border-slate-50 shadow-2xl rotate-12 transition-transform hover:rotate-0 duration-700">
                            <FolderLock className="w-16 h-16" />
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-3xl font-extrabold text-primary-navy uppercase font-outfit tracking-tight italic">Vault Untouched</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed italic">
                               Initialize your verification stack by uploading your ID and residency protocols above.
                            </p>
                         </div>
                      </div>
                 ) : filteredDocuments.map((docItem) => (
                    <div key={docItem.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 group transition-all border-l-8 border-transparent hover:border-primary-blue cursor-pointer">
                       <div className="flex items-center gap-10">
                          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-inner ${
                            docItem.status === "Archived" ? "bg-slate-100 text-slate-300 grayscale" : "bg-white border border-slate-100 text-slate-400 group-hover:bg-primary-navy group-hover:text-white group-hover:rotate-6 group-hover:scale-110"
                          }`}>
                             <File className="w-10 h-10" />
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <p className={`font-bold text-2xl font-outfit uppercase italic tracking-tight leading-none ${docItem.status === "Archived" ? "text-slate-300" : "text-slate-800"}`}>
                                   {docItem.name}
                                </p>
                                {docItem.status === "Archived" && (
                                   <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest border border-amber-100 rounded-full italic">Archived Record</span>
                                )}
                             </div>
                             <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">
                                <span className="flex items-center gap-2 text-primary-blue/60"><Download className="w-4 h-4" /> {(docItem.size / 1024).toFixed(1)} KB</span>
                                <span className="w-2 h-2 rounded-full bg-slate-100" />
                                <span className="flex items-center gap-2 text-primary-navy/40"><CheckCircle2 className="w-4 h-4" /> {formatDisplayDate(docItem.createdAt)}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 mt-10 md:mt-0">
                          <a 
                            href={docItem.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-5 bg-white border border-slate-100 text-slate-300 hover:text-primary-blue hover:shadow-2xl rounded-2xl transition-all active:scale-95"
                            title="Secure Download"
                          >
                             <Download className="w-6 h-6" />
                          </a>
                          <button 
                            onClick={() => toggleArchive(docItem.id, docItem.status)}
                            className={`p-5 rounded-2xl transition-all border border-transparent active:scale-95 ${
                              docItem.status === "Archived" ? "text-emerald-500 bg-emerald-50 hover:shadow-xl" : "text-amber-500 bg-amber-50 hover:shadow-xl"
                            }`}
                            title={docItem.status === "Archived" ? "Restore Protocol" : "Archive Record"}
                          >
                             <Archive className="w-6 h-6" />
                          </button>
                      
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
   return (
      <div className="flex items-center gap-4 mb-2">
         <div className="h-[1px] flex-1 bg-slate-100" />
         <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] italic whitespace-nowrap">{title}</h2>
         <div className="h-[1px] w-8 bg-slate-100" />
      </div>
   );
}

function VaultModule({ title, metric, desc, status, icon }: { title: string, metric: string, desc: string, status: string, icon: React.ReactNode }) {
   return (
      <div className="premium-card p-10 space-y-8 border-2 border-slate-50 hover:border-primary-blue transition-all group bg-white shadow-sm hover:shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-primary-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
         <div className="flex justify-between items-start relative z-10">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="text-primary-blue group-hover:rotate-12 transition-transform">{icon}</div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">{title}</h3>
               </div>
               <p className="text-3xl font-extrabold text-primary-navy font-outfit uppercase italic leading-none tracking-tighter">{metric}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest italic border ${
               status === 'MANDATORY' ? 'bg-red-50 text-red-500 border-red-100' : 
               status === 'ACTION REQUIRED' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
               'bg-emerald-50 text-emerald-500 border-emerald-100'
            }`}>
               {status}
            </span>
         </div>
         <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider italic relative z-10">{desc}</p>
      </div>
   );
}

function RequirementItem({ text }: { text: string }) {
   return (
      <div className="flex items-start gap-4 group/req">
         <div className="w-5 h-5 bg-slate-50 rounded-lg flex items-center justify-center mt-0.5 border border-slate-100 group-hover/req:border-primary-blue transition-colors">
            <div className="w-1.5 h-1.5 bg-primary-blue rounded-full group-hover/req:scale-125 transition-transform" />
         </div>
         <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 group-hover/req:text-primary-navy transition-colors italic leading-relaxed">{text}</span>
      </div>
   );
}
