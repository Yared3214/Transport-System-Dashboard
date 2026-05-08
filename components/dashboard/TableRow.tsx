import { Edit2, Trash2 } from "lucide-react";

export const TableRow = ({ title, sub, meta, status, onEdit, onDelete }: any) => (
    <tr className="group hover:bg-indigo-600/[0.02] transition-colors">
      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="font-bold text-white text-base">{title}</span>
          <span className="text-xs text-slate-500 mt-0.5">{sub}</span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          {meta}
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">{status}</span>
        </div>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Edit2 size={16}/></button>
          <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
        </div>
      </td>
    </tr>
  );