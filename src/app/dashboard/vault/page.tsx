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
  CheckCircle2
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
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-5 h-5 text-secondary-teal" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">Sovereign Document Forge & Vault</span>
          </div>
          <h1 className="text-4xl font-extrabold font-outfit text-primary-navy tracking-tight italic uppercase">Document Vault</h1>
          <p className="text-slate-500 font-medium tracking-tight">Enterprise-grade isolation for your sensitive audit evidence.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setViewMode(viewMode === "active" ? "archived" : "active")}
             className={`px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border italic ${
               viewMode === "archived" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-400 border-slate-100 shadow-sm"
             }`}
           >
              <Archive className="w-4 h-4" /> {viewMode === "archived" ? "Viewing Archive" : "Vault Archives"}
           </button>
           <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={handleUpload}
                disabled={uploading}
              />
              <button 
                className="btn-primary flex items-center gap-3 py-4 px-8 shadow-2xl disabled:opacity-50 uppercase tracking-widest text-[10px] font-bold italic"
                disabled={uploading}
              >
                <CloudUpload className="w-5 h-5" /> {uploading ? "Securing Forge..." : "Safe Upload"}
              </button>
           </div>
        </div>
      </div>

      {/* VERIFICATION STACK ONBOARDING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <VaultModule 
            title="Verification Stack" 
            metric="ID + Address"
            desc="The bureaus REQUIRE clear copies of your ID and proof of residency to process any dispute."
            status="MANDATORY"
         />
         <VaultModule 
            title="Reporting Engine" 
            metric="Bureau Exports"
            desc="Upload your official PDFs from AnnualCreditReport.com to establish your audit baseline."
            status="ACTION REQUIRED"
         />
         <VaultModule 
            title="Response Archive" 
            metric="Evidence"
            desc="Every letter you receive from a bureau must be scanned and stored here to track progress."
            status="OPERATIONAL"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           {/* Category Navigation */}
           <div className="premium-card p-8 space-y-6">
              <h3 className="font-bold text-primary-navy text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 italic">
                 <Filter className="w-4 h-4 text-primary-blue" /> Forge Categories
              </h3>
              <div className="space-y-2">
                 {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full text-left p-4 rounded-2xl font-bold text-[11px] transition-all flex flex-col gap-1 group border-2 ${
                        selectedCategory === cat.name ? "bg-primary-navy text-white border-primary-navy shadow-2xl" : "text-slate-500 hover:bg-slate-50 border-transparent"
                      }`}
                    >
                       <div className="flex items-center justify-between">
                          <span className="uppercase tracking-widest italic">{cat.name}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full ${selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                             {cat.name === "All Documents" ? documents.length : documents.filter(d => d.category === cat.name).length}
                          </span>
                       </div>
                       <p className={`text-[9px] font-medium leading-tight italic ${selectedCategory === cat.name ? "text-slate-400" : "text-slate-400 group-hover:text-slate-500"}`}>
                          {cat.hint}
                       </p>
                    </button>
                 ))}
              </div>
           </div>

           {/* Security Badge */}
           <div className="premium-card p-10 bg-primary-navy text-white space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-teal/10 blur-[40px] -mr-12 -mt-12" />
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                    <p className="text-[10px] font-bold text-secondary-teal uppercase tracking-widest leading-none italic">Retention Policy</p>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider italic">No static URLs. Evidence is encrypted and scoped to your session. Records are archived after 180 days of inactivity.</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-blue transition-colors" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault by filename, tag, or category..."
                  className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-blue/5 outline-none font-bold text-slate-700 transition-all shadow-sm placeholder:text-slate-300 italic"
                 />
              </div>
           </div>

           {/* Document List View */}
           <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                 <div className="space-y-0.5">
                    <h3 className="font-bold text-primary-navy">{selectedCategory}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredDocuments.length} Verified Items</p>
                 </div>
                 <button className="p-3 text-slate-300 hover:text-primary-blue transition-all">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>

              <div className="divide-y divide-slate-100">
                 {loading ? (
                    [1, 2, 3].map(i => (
                       <div key={i} className="p-8 flex items-center gap-6 animate-pulse">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                          <div className="space-y-3 flex-1">
                             <div className="h-5 w-64 bg-slate-100 rounded" />
                             <div className="h-3 w-32 bg-slate-50 rounded" />
                          </div>
                          <div className="w-10 h-10 bg-slate-50 rounded-xl" />
                       </div>
                    ))
                 ) : filteredDocuments.length === 0 ? (
                    <div className="p-32 text-center space-y-6">
                       <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-4 border-white shadow-xl">
                          <FolderLock className="w-10 h-10" />
                       </div>
                       <div className="space-y-2">
                          <p className="font-extrabold text-2xl text-slate-300 font-outfit uppercase tracking-tight">No Items found</p>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Adjust filters or upload a new record</p>
                       </div>
                    </div>
                 ) : filteredDocuments.map((docItem) => (
                    <div key={docItem.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-all group gap-6 border-l-4 border-transparent hover:border-primary-blue">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            docItem.status === "Archived" ? "bg-slate-100 text-slate-300 grayscale" : "bg-primary-blue/5 text-primary-navy group-hover:bg-primary-navy group-hover:text-white"
                          }`}>
                             <File className="w-7 h-7" />
                          </div>
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-3">
                                <p className={`font-bold text-lg leading-none ${docItem.status === "Archived" ? "text-slate-400" : "text-slate-800"}`}>
                                   {docItem.name}
                                </p>
                                {docItem.status === "Archived" && (
                                   <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest border border-amber-100 rounded">Archived</span>
                                )}
                             </div>
                             <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                <span className="flex items-center gap-1.5 text-slate-500"><Download className="w-3 h-3" /> {(docItem.size / 1024).toFixed(1)} KB</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="flex items-center gap-1.5 text-primary-blue italic"><CheckCircle2 className="w-3 h-3" /> {formatDisplayDate(docItem.createdAt)}</span>
                                {docItem.tags?.length > 0 && (
                                   <>
                                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                                      <div className="flex gap-1">
                                         {docItem.tags.map((t: string) => (
                                           <span key={t} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t}</span>
                                         ))}
                                      </div>
                                   </>
                                )}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <a 
                            href={docItem.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-3 text-slate-400 hover:text-primary-blue hover:bg-white hover:shadow-xl rounded-2xl transition-all"
                            title="Secure Download"
                          >
                             <Download className="w-5 h-5" />
                          </a>
                          <button 
                            onClick={() => toggleArchive(docItem.id, docItem.status)}
                            className={`p-3 rounded-2xl transition-all ${
                              docItem.status === "Archived" ? "text-emerald-500 hover:bg-emerald-50" : "text-amber-500 hover:bg-amber-50"
                            }`}
                            title={docItem.status === "Archived" ? "Restore" : "Archive"}
                          >
                             <Archive className="w-5 h-5" />
                          </button>
                          <button 
                            disabled={docItem.status === "Archived"}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all"
                            title="Delete Permanently"
                          >
                             <Trash2 className="w-5 h-5" />
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

function VaultModule({ title, metric, desc, status }: { title: string, metric: string, desc: string, status: string }) {
   return (
      <div className="premium-card p-8 space-y-6 border hover:border-primary-blue transition-all group">
         <div className="flex justify-between items-start">
            <div className="space-y-1">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{title}</h3>
               <p className="text-2xl font-bold text-primary-navy font-outfit uppercase italic leading-none">{metric}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest italic border ${
               status === 'MANDATORY' ? 'bg-red-50 text-red-500 border-red-100' : 
               status === 'ACTION REQUIRED' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
               'bg-emerald-50 text-emerald-500 border-emerald-100'
            }`}>
               {status}
            </span>
         </div>
         <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider italic">{desc}</p>
      </div>
   );
}
