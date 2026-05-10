"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { AlertCircle, ArrowRight, Loader2, Lock, Mail, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";


export default function EmailPassword() {
    const [mode, setMode] = useState("signin");
    const [prevMode, setPrevMode] = useState("signup");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    if (mode !== prevMode) {
        setPrevMode(mode);
        setError(null);
    }

    const router = useRouter();
    const supabase = getSupabaseBrowserClient();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = mode === 'signup' 
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password });

            if (authError) throw authError;

            if (mode === 'signin') {
                console.log({ data });
                router.refresh();
                router.push('/');
            } else {
                setError("Verification email sent. Check your inbox.");
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    }

    const toggleMode = (newMode: "signin" | "signup") => {
        setMode(newMode);
        setError(null);    // Updates in the same batch as setMode
        setPassword("");   // Clean up sensitive fields simultaneously
    };

    return (
        <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6 selection:bg-indigo-500/30 font-sans">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
                {/* 1. MODERN MODE SWITCHER */}
                <div className="bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800/50 mb-8 flex relative">
                    <div 
                        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-xl transition-all duration-300 ease-out shadow-lg shadow-indigo-600/20 ${
                            mode === 'signup' ? 'left-[calc(50%+3px)]' : 'left-1.5'
                        }`}
                    />
                    <button 
                        onClick={() => toggleMode('signin')}
                        className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'signin' ? 'text-white' : 'text-slate-500'}`}
                    >
                        Sign In
                    </button>
                    <button 
                        onClick={() => toggleMode('signup')}
                        className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${mode === 'signup' ? 'text-white' : 'text-slate-500'}`}
                    >
                        Join System
                    </button>
                </div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-xl shadow-indigo-600/5">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                        LogiCore<span className="text-indigo-500 not-italic">.</span>
                    </h1>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    
                    {/* 2. ERROR STATE UI */}
                    {error && (
                        <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">System Alert</p>
                                    <p className="text-xs text-red-200/80 leading-relaxed">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="text-red-500/50 hover:text-red-500 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                {mode === 'signin' && <button type='button' className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Forgot?</button>}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase text-xs tracking-widest group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    {mode === 'signin' ? 'Authorize Access' : 'Initialize Account'}
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/60"></div></div>
                        <span className="relative bg-[#0b0f17] px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Identity Providers</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl hover:bg-slate-900 transition-all text-slate-400 hover:text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl hover:bg-slate-900 transition-all text-slate-400 hover:text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Authorized personnel only. Logs are strictly monitored.
                </p>
            </div>
        </div>
    )
}