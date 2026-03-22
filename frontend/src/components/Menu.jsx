import React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Database, 
  Layers, 
  ChevronRight,
  Globe // Import thêm icon Globe cho Logo
} from "lucide-react";

const menuItems = [
  { id: "info", label: "Information", icon: <Layers size={22} /> },
  { id: "map", label: "Map", icon: <LayoutDashboard size={22} /> },
  { id: "analysis", label: "Deep Analysis", icon: <BarChart3 size={22} /> },
  { id: "data", label: "Data", icon: <Database size={22} /> },
  
];

export default function Menu({ activeTab, setActiveTab }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 hover:w-64 bg-white/80 backdrop-blur-2xl border-r border-slate-100 z-[1000] transition-all duration-500 ease-in-out group flex flex-col shadow-2xl">
      
      {/* LOGO AREA - ĐÃ THAY ĐỔI BIỂU TƯỢNG */}
      <div className="p-6 mb-8 flex items-center gap-4">
        <div className="min-w-[40px] h-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          {/* Thay đổi sang icon Globe để không trùng với BarChart3 của Deep Analysis */}
          <Globe size={24} strokeWidth={2.5} className="animate-pulse" /> 
        </div>
        <span className="font-black text-slate-800 text-xl tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
          EURO<span className="text-blue-600">STATS</span>
        </span>
      </div>

      {/* MENU NAVIGATION */}
      <nav className="flex-1 px-3 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group/btn ${
              activeTab === item.id 
              ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
              : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <div className={`min-w-[24px] flex justify-center ${activeTab === item.id ? "scale-110" : "group-hover/btn:scale-110"} transition-transform`}>
              {item.icon}
            </div>

            <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {item.label}
            </span>

            {activeTab === item.id && (
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* BOTTOM ACTION */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
            activeTab === "settings" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Settings size={22} />
          <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Settings
          </span>
        </button>
      </div>

    </aside>
  );
}