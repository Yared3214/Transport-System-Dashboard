"use client"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ShieldAlert, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WaitingRoom() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const handleSignout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] text-center">
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 relative z-10">
            <Clock size={40} className="animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-4 italic">
          Access <span className="text-indigo-500 not-italic">Restricted</span>
        </h1>
        
        <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 border border-amber-500/20 py-2 px-4 rounded-full w-fit mx-auto mb-6">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Pending Approval</span>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Your identity has been verified, but your account is currently in the 
            <span className="text-white font-bold"> Security Clearance Queue</span>. 
            An administrator must manually approve your credentials before you can access the LogiCore Dashboard.
          </p>

          <button 
            onClick={handleSignout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
          >
            <LogOut size={16} /> Return to Login
          </button>
        </div>

        <p className="mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
          System Ref: AUTH_PENDING_PROVISIONING
        </p>
      </div>
    </div>
  );
}