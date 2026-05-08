export const FormSelect = ({ label, options, defaultValue, isDriver=false, onChange, ...props }: any) => {
  return (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
      {label}
    </label>
    <select 
      defaultValue={defaultValue || ""} // Fallback to empty string if value is undefined
      onChange={onChange}
      {...props} 
      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer"
    >
      <option value="" disabled>Select an option</option> {/* Good practice for UX */}
      {options.map((opt: any) => (
        <option key={opt.id} value={opt.id}>
          {isDriver ? opt.full_name : opt.location_name}
        </option>
      ))}
    </select>
  </div>
);}