import { ChevronLeft, ChevronRight, Edit2, Phone, Search, Trash2, User } from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

export const DriversView = ({ data, onEdit, onDelete }: { 
  data: any; 
  onEdit: (data: any) => void;
  onDelete: Dispatch<SetStateAction<{
    id: string;
    name: string;
    type: "location" | "pickup" | "employee" | "driver" | "access-request";
} | null>> }) => {
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
    const unique = Array.from(new Set(data.map((d: any) => d.locations?.location_name).filter(Boolean)));
    return ["All", ...unique];
  }, [data]);
  
  const filteredData = useMemo(() => {
    return data.filter((driver: any) => {
      const matchesSearch = driver.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchesOffice = officeFilter === "All" || driver.locations?.location_name === officeFilter;
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
      
      {/* TOOLBAR: Stacks vertically on mobile */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-[1.5rem] lg:rounded-[2rem] backdrop-blur-md">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search drivers..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all"
          />
        </div>

        <div className="w-full md:w-auto">
          <select 
            value={officeFilter}
            onChange={handleFilterChange}
            className="w-full md:w-auto bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-4 py-2.5 focus:border-indigo-500/50 outline-none cursor-pointer appearance-none md:appearance-auto"
          >
            {offices.map((off: any) => <option key={off} value={off}>{off}</option>)}
          </select>
        </div>
      </div>

      {/* DRIVERS GRID: 1 column on mobile, 2 on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((driver: any, i: number) => (
            <div 
              key={i} 
              className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 md:p-5 flex items-center justify-between group hover:border-slate-700 hover:bg-slate-900/50 transition-all active:scale-[0.99] md:active:scale-100"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex flex-shrink-0 items-center justify-center text-indigo-400">
                  <User size={20}/>
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm uppercase truncate">
                    {driver.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={10} className="text-slate-500" />
                    <p className="text-xs font-mono text-indigo-400/80 truncate">
                      {driver.phone_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS: Always visible on mobile, hover on desktop */}
              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ml-4">
                <button 
                  onClick={() => onEdit(driver)} 
                  className="bg-slate-800/80 p-2.5 rounded-xl hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
                  aria-label="Edit driver"
                >
                  <Edit2 size={16}/>
                </button>
                <button 
                  onClick={() => onDelete({ id: driver.id, name: driver.full_name, type: 'driver'})} 
                  className="bg-slate-800/80 p-2.5 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Delete driver"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-800 rounded-3xl">
            No Drivers Found
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER: Mobile-friendly stacking */}
      {totalPages > 1 && (
        <div className="px-6 py-5 bg-slate-900/30 border border-slate-800 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest order-2 md:order-1">
            Showing <span className="text-white">{startIndex + 1}</span> to <span className="text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-white">{filteredData.length}</span> drivers
          </p>
      
          <div className="flex items-center gap-2 order-1 md:order-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev: any) => prev - 1)}
              className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
      
            <div className="flex items-center gap-1">
              {/* Mobile: Compact view */}
              <span className="md:hidden text-[10px] font-black text-slate-400 px-3">
                PAGE {currentPage} / {totalPages}
              </span>

              {/* Desktop: Numbered buttons */}
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
              className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
)
}