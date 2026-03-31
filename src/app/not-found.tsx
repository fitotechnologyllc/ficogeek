import Link from "next/link";
import { MoveLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-primary-navy">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-outfit text-primary-navy">404 - Page Not Found</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">The requested vault resource could not be found or you do not have permission to access it.</p>
      </div>
      <Link href="/dashboard" className="btn-primary flex items-center gap-2">
        <MoveLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
