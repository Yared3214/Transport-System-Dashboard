export const FormInput = ({ label, ...props }: any) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{label}</label>
      <input {...props} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"/>
    </div>
  );