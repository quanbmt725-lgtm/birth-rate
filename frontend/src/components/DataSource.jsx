import React from "react";
import { Database, Download, Table, FileJson, FileSpreadsheet, HardDrive, Search } from "lucide-react";

const datasets = [
  { id: 1, name: "Birth Rate Master", rows: "12,450", size: "1.2 MB", type: "CSV", color: "bg-blue-500" },
  { id: 2, name: "Population Age Group", rows: "8,920", size: "850 KB", type: "JSON", color: "bg-emerald-500" },
  { id: 3, name: "Taxation Policy 2022", rows: "4,100", size: "420 KB", type: "CSV", color: "bg-indigo-500" },
  { id: 4, name: "Household Expenditure", rows: "15,200", size: "2.1 MB", type: "XLSX", color: "bg-rose-500" },
  { id: 5, name: "Employment Statistics", rows: "6,800", size: "710 KB", type: "CSV", color: "bg-amber-500" },
];

export default function DataSource() {
  return (
    <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Data Source</h2>
          <p className="text-blue-600 font-bold tracking-[0.2em] text-[10px] uppercase mt-2">Database Management & Exports</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search datasets..." 
            className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
          />
        </div>
      </div>

      {/* STORAGE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white flex items-center gap-6 shadow-xl">
           <div className="p-4 bg-white/10 rounded-2xl"><HardDrive size={24} className="text-blue-400" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Storage</p>
             <h4 className="text-2xl font-black">12.4 GB / 50 GB</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm">
           <div className="p-4 bg-blue-50 rounded-2xl"><Table size={24} className="text-blue-600" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tables</p>
             <h4 className="text-2xl font-black text-slate-900">08 Database Tables</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm">
           <div className="p-4 bg-emerald-50 rounded-2xl"><Database size={24} className="text-emerald-600" /></div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</p>
             <h4 className="text-2xl font-black text-slate-900 text-emerald-600">Success</h4>
           </div>
        </div>
      </div>

      {/* DATASETS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {datasets.map((ds) => (
          <div key={ds.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-4 rounded-3xl ${ds.color} text-white shadow-lg`}>
                {ds.type === "CSV" ? <Table size={24} /> : ds.type === "JSON" ? <FileJson size={24} /> : <FileSpreadsheet size={24} />}
              </div>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Download size={20} />
              </button>
            </div>
            
            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">{ds.name}</h4>
            <div className="flex gap-4 mb-6">
               <span className="text-[10px] font-black text-slate-400 uppercase">{ds.rows} Rows</span>
               <span className="text-[10px] font-black text-slate-400 uppercase">•</span>
               <span className="text-[10px] font-black text-slate-400 uppercase">{ds.size}</span>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
               <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter bg-slate-100 text-slate-500`}>
                 Format: {ds.type}
               </span>
               <span className="text-blue-600 font-black text-[10px] uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                 View Table ➔
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}