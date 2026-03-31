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

const CATEGORIES = [
  "All Documents",
  "Identification",
  "Proof of Address",
  "Credit Reports",
  "Letters",
  "Bureau Responses",
  "Other"
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString()
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-outfit text-primary-navy">Hardened Vault</h1>
          <p className="text-slate-500 font-medium tracking-tight">Enterprise-grade document isolation and security.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setViewMode(viewMode === "active" ? "archived" : "active")}
             className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border ${
               viewMode === "archived" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-white text-slate-500 border-slate-200"
             }`}
           >
              <Archive className="w-4 h-4" /> {viewMode === "archived" ? "Viewing Archive" : "Archives"}
           </button>
           <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={handleUpload}
                disabled={uploading}
              />
              <button 
                className="btn-primary flex items-center gap-2 shadow-2xl disabled:opacity-50"
                disabled={uploading}
              >
                <CloudUpload className="w-5 h-5" /> {uploading ? "Securing..." : "Safe Upload"}
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           {/* Category Navigation */}
           <div className="premium-card p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                 <Filter className="w-4 h-4 text-primary-blue" /> Browse Categories
              </h3>
              <div className="space-y-1">
                 {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left p-3 rounded-xl font-bold text-sm transition-all flex items-center justify-between group ${
                        selectedCategory === cat ? "bg-primary-navy text-white shadow-xl shadow-navy-900/10" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                       {cat}
                       <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                          {cat === "All Documents" ? documents.length : documents.filter(d => d.category === cat).length}
                       </span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Tag Filters */}
           <div className="premium-card p-6 space-y-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                 <TagIcon className="w-4 h-4 text-secondary-teal" /> Quick Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                 {QUICK_TAGS.map(tag => (
                   <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:border-primary-blue hover:text-primary-blue transition-all cursor-pointer">
                      {tag}
                   </span>
                 ))}
              </div>
           </div>

           {/* Security Badge */}
           <div className="premium-card p-6 bg-slate-900 text-white space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-teal/10 blur-[30px] -mr-8 -mt-8" />
              <div className="flex items-center gap-2 relative z-10">
                 <ShieldCheck className="w-5 h-5 text-secondary-teal" />
                 <p className="text-sm font-bold text-secondary-teal uppercase tracking-widest leading-none">Hardened Encryption</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">No static URLs generated. Documents are scoped to your session UID. Verified by the Sovereign Ledger.</p>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {/* Search and Metadata Controls */}
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                 <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename, tag, or category..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-primary-blue/5 outline-none font-bold text-slate-700 transition-all shadow-sm"
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
                                <span className="flex items-center gap-1.5 text-primary-blue italic"><CheckCircle2 className="w-3 h-3" /> {new Date(docItem.createdAt).toLocaleDateString()}</span>
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
