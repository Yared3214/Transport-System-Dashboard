import { Building2, ChevronLeft, ChevronRight, Edit2, Filter, Search, Trash2, Users, X } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

export const EmployeesView = ({ data, onEdit, onDelete }: { 
  data: any; 
  onEdit: (data: any) => void; 
  onDelete: Dispatch<SetStateAction<{
      id: string;
      name: string;
      type: "location" | "pickup" | "employee" | "driver" | "access-request";
  } | null>>}) => {

    const [search, setSearch] = useState("");
    const [officeFilter, setOfficeFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setCurrentPage(1); // Update synchronously here
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setOfficeFilter(e.target.value);
      setCurrentPage(1); // Update synchronously here
    };

    // 1. Get unique offices from the data for the dropdown
    const offices = useMemo(() => {
      const unique = Array.from(new Set(data.map((e: any) => e.locations?.location_name).filter(Boolean)));
      return ["All", ...unique];
    }, [data]);

    const filteredData = useMemo(() => {
      return data.filter((emp: any) => {
        const matchesSearch = emp.full_name?.toLowerCase().includes(search.toLowerCase());
        const matchesOffice = officeFilter === "All" || emp.locations?.location_name === officeFilter;
        return matchesSearch && matchesOffice;
      });
    }, [data, search, officeFilter]);

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const activePage = Math.min(currentPage, totalPages || 1);
    const startIndex = (activePage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TOOLBAR: Stacks on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-[1.5rem] lg:rounded-[2rem] backdrop-blur-md">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <select 
            value={officeFilter}
            onChange={handleFilterChange}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-4 py-2.5 focus:border-indigo-500/50 outline-none cursor-pointer"
          >
            {offices.map((off: any) => <option key={off} value={off}>{off}</option>)}
          </select>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* MOBILE VIEW: Card List (Visible < 768px) */}
        <div className="md:hidden divide-y divide-slate-800/50">
          {paginatedData.length > 0 ? (
            paginatedData.map((emp: any) => (
              <div key={emp.id} className="p-5 flex items-center justify-between gap-4 active:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-shrink-0 items-center justify-center text-[12px] font-bold text-indigo-400 uppercase">
                    {emp.full_name?.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{emp.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 size={10} className="text-slate-500" />
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {emp.locations?.location_name || 'No Office'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(emp)} 
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"
                  >
                    <Edit2 size={14}/>
                  </button>
                  <button 
                    onClick={() => onDelete({id: emp.id, name: emp.full_name, type: 'employee'})} 
                    className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">No Results Found</div>
          )}
        </div>

        {/* DESKTOP VIEW: Table (Visible > 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Work Office</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedData.map((emp: any) => (
                <tr key={emp.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-400 uppercase">
                        {emp.full_name?.substring(0, 2)}
                      </div>
                      <span className="text-sm font-bold text-white">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="text-xs text-slate-400 font-medium">{emp.locations?.location_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => onEdit(emp)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"><Edit2 size={16}/></button>
                      <button onClick={() => onDelete({id: emp.id, name: emp.full_name, type: 'employee'})} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-slate-900/30 border-t border-slate-800 flex flex-col items-center justify-between gap-6 md:flex-row md:px-8">
            <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest order-2 md:order-1 text-center">
              Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-white">{filteredData.length}</span> staff
            </p>

            <div className="flex items-center gap-2 order-1 md:order-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev: any) => prev - 1)}
                className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {/* Mobile: Simple page count */}
                <span className="md:hidden text-[10px] font-black text-slate-400 px-3 uppercase tracking-tighter">
                  Page <span className="text-white">{currentPage}</span> / {totalPages}
                </span>
                
                {/* Desktop: Page numbers */}
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
                        currentPage === num 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev: any) => prev + 1)}
                className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
);
}