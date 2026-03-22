import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabase";
import { Play, Pause, RotateCcw } from "lucide-react";
import { scaleLinear } from "d3-scale";

// Import các Components
import MapSection from "./components/MapSection";
import RankingSidebar from "./components/RankingSidebar";
import FloatingChartCard from "./components/FloatingChartCard";
import PredictionWidget from "./components/PredictionWidget";
import Menu from "./components/Menu"; 
import DeepAnalysis from "./components/DeepAnalysis"; 
import DataSource from "./components/DataSource";
import Information from "./components/Information";

const colorScale = scaleLinear()
  .domain([6, 10, 14])
  .range(["#d1fae5", "#60a5fa", "#1d4ed8"]);

function App() {
  const [activeTab, setActiveTab] = useState("map"); 

  const [allData, setAllData] = useState([]); 
  const [year, setYear] = useState(2000);
  const [playing, setPlaying] = useState(false);
  
  const [selectedCountry, setSelectedCountry] = useState(null); 
  const [pinnedCountry, setPinnedCountry] = useState(() => {
    return localStorage.getItem("lastClickedCountry") || null;
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [aiResult, setAiResult] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // ============================================================
  // ĐÃ SỬA: HÀM GỌI API RENDER THAY VÌ LOCALHOST
  // ============================================================
  const handleRunPrediction = async (isoCode) => {
    if (!isoCode || allData.length === 0) return;
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const historyForLag = allData.filter(d => 
        d.REF_AREA === isoCode && [2019, 2020, 2021].includes(Number(d.Year))
      );
      if (historyForLag.length < 3) {
        alert(`Không đủ dữ liệu lịch sử.`);
        setIsAiLoading(false);
        return;
      }
      
      const response = await fetch(`https://birth-rate.onrender.com/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyForLag })
      });
      
      const result = await response.json();
      if (result.status === "success") setAiResult(result.predicted_val);
    } catch (error) {
      alert("Server AI đang khởi động (Cold Start). Vui lòng đợi 30 giây rồi bấm thử lại nhé!");
      console.error("Lỗi kết nối:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => { setAiResult(null); }, [pinnedCountry]);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.from("birth-rate").select("*").order("Year", { ascending: true });
      if (data) setAllData(data);
    };
    fetchHistory();
  }, []);

  const handleCountryClick = (iso) => {
    setPinnedCountry(iso);
    localStorage.setItem("lastClickedCountry", iso);
  };

  const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => setYear(v => (v < 2021 ? v + 1 : 2000)), 800);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const yearData = useMemo(() => allData.filter(d => Number(d.Year) === year), [allData, year]);
  const prevYearData = useMemo(() => allData.filter(d => Number(d.Year) === (year - 1)), [allData, year]);
  const chartHistory = useMemo(() => 
    selectedCountry ? allData.filter(d => d.REF_AREA === selectedCountry).sort((a,b) => a.Year - b.Year) : [], 
    [allData, selectedCountry]
  );
  const currentVal = useMemo(() => 
    yearData.find(d => d.REF_AREA === selectedCountry)?.birth_rate ?? null,
    [yearData, selectedCountry]
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden relative" onMouseMove={handleMouseMove}>
      
      {/* 1. MENU SIDEBAR */}
      <Menu activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 ml-20 relative transition-all duration-500 bg-white">
        
        {/* TAB MAP */}
        {activeTab === "map" && (
          <div className="w-full h-full relative animate-in fade-in duration-500">
            
            {/* TIÊU ĐỀ */}
            <div className="absolute top-14 left-12 z-[20] pointer-events-none text-slate-900">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                Europe Birth Rate Analysis
              </h1>
              <p className="text-sm font-bold mt-3 tracking-widest opacity-60 uppercase">
                Source: <span className="text-blue-600">OECD Data Explorer</span>
              </p>
            </div>

            {/* PREDICTION WIDGET */}
            <div className="absolute bottom-32 left-12 z-[50]">
              <PredictionWidget 
                targetCountry={pinnedCountry} 
                predictValue={aiResult}
                loadingAI={isAiLoading}
                onPredict={handleRunPrediction}
              />
            </div>

            {/* PHẦN BẢN ĐỒ */}
            <MapSection 
              yearData={yearData} selectedCountry={selectedCountry} 
              setSelectedCountry={setSelectedCountry} pinnedCountry={pinnedCountry}
              onCountryClick={handleCountryClick} colorScale={colorScale}
            />

            {/* PHẦN RANKING SIDEBAR */}
            <div className="absolute right-0 top-0 h-full z-[40]">
                <RankingSidebar 
                  data={yearData} 
                  prevYearData={prevYearData}
                  selectedCountry={selectedCountry} 
                  setSelectedCountry={setSelectedCountry}
                  onCountryClick={handleCountryClick} 
                  colorScale={colorScale}
                />
            </div>
            
            <FloatingChartCard 
              year={year} selectedCountry={selectedCountry}
              currentVal={currentVal} historyData={chartHistory}
              position={mousePos}
            />

            {/* TIMELINE */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900 p-4 px-10 rounded-full shadow-2xl z-[100]">
              <button onClick={() => setPlaying(!playing)} className="text-white hover:text-blue-400 transition-colors">
                {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <input 
                type="range" min="2000" max="2021" value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))} 
                className="w-64 accent-blue-500 cursor-pointer" 
              />
              <span className="text-white font-black tabular-nums text-xl min-w-[55px] text-center">{year}</span>
              <button onClick={() => {setYear(2000); setPlaying(false);}} className="text-slate-400 hover:text-white transition-colors">
                <RotateCcw size={18} />
              </button>
            </div>

            {/* LEGEND */}
            <div className="absolute bottom-20 right-[360px] bg-white/80 px-4 py-2 rounded-xl shadow text-[10px] flex items-center gap-3 z-[10] border border-slate-100 font-bold uppercase text-slate-500">
              <span>6.0</span>
              <div className="h-1.5 w-32 bg-gradient-to-r from-[#d1fae5] via-[#60a5fa] to-[#1d4ed8] rounded-full" />
              <span>14.0+</span>
            </div>
          </div>
        )}
        {/* TAB INFORMATION */}
        {activeTab === "info" && (
          <div className="w-full h-full overflow-y-auto bg-slate-50">
            <Information />
          </div>
        )}

        {/* TAB DEEP ANALYSIS */}
        {activeTab === "analysis" && (
          <div className="w-full h-full overflow-y-auto bg-slate-50">
             <DeepAnalysis data={allData} />
          </div>
        )}

        {/* TAB DATA - Chỉ render DataSource, không truyền allData nữa */}
        {activeTab === "data" && (
          <div className="w-full h-full overflow-y-auto bg-slate-50">
            <DataSource />
          </div>
        )}

        {/* CÁC TAB KHÁC (info, settings) giữ nguyên placeholder */}
        {["info", "settings"].includes(activeTab) && (
          <div className="flex items-center justify-center h-full text-slate-300 font-black uppercase text-3xl italic">
            {activeTab} Content Coming Soon
          </div>
        )}
      </main>
    </div>
  );
}

export default App;