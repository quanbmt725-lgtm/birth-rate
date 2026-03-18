import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; 
import { Sparkles, TrendingUp, TrendingDown, RefreshCw, Zap } from "lucide-react";

// Component con xử lý hiệu ứng số chạy
const AnimatedNumber = ({ value, duration = 1500 }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (value === null) return;
    
    let startTimestamp = null;
    const endValue = Number(value);
    
    // Nếu duration quá ngắn, set luôn cho nhanh
    if (endValue === 0) {
      setCurrentValue(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Hiệu ứng "easing" mượt hơn (outQuad)
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      
      setCurrentValue(easedProgress * endValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrentValue(endValue); // Đảm bảo số cuối cùng chính xác
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (value === null) return "--";
  return currentValue.toFixed(2);
};

export default function PredictionWidget({ targetCountry, predictValue, loadingAI, onPredict }) {
  const [loadingActual, setLoadingActual] = useState(false);
  const [actualValue, setActualValue] = useState(null);
  const [isShowingResults, setIsShowingResults] = useState(false);

  // 1. TỰ ĐỘNG LẤY SỐ THỰC TẾ 2022
  useEffect(() => {
    const fetchActualData = async () => {
      if (!targetCountry) {
        setActualValue(null);
        setIsShowingResults(false);
        return;
      }

      setLoadingActual(true);
      setActualValue(null); 
      setIsShowingResults(false); 

      try {
        const { data } = await supabase
          .from("birth_rate_2022")
          .select("birth_rate")
          .eq("REF_AREA", targetCountry)
          .limit(1);

        if (data && data.length > 0) {
          setActualValue(data[0].birth_rate);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu Supabase:", error);
      } finally {
        setLoadingActual(false);
      }
    };

    fetchActualData();
  }, [targetCountry]);

  // 2. KHI AI TRẢ VỀ KẾT QUẢ, HIỆN CẢ 2 SỐ CÙNG LÚC
  useEffect(() => {
    if (predictValue !== null && !loadingAI) {
      setIsShowingResults(true);
    }
  }, [predictValue, loadingAI]);

  // Tính Delta
  const delta = (predictValue !== null && actualValue !== null) 
    ? (predictValue - actualValue) 
    : 0;

  return (
    <div className="w-80 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50 flex flex-col gap-4 transition-all hover:scale-[1.01]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* ICON XOAY: Sử dụng key={targetCountry} */}
          <div 
            key={targetCountry}
            className={`p-2.5 rounded-2xl text-white shadow-lg flex items-center justify-center 
              ${loadingActual ? 'animate-pulse bg-slate-400' : 'bg-blue-600'} 
              star-rotate-animation`} // Custom class xoay + nảy
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-[13px] font-black text-slate-800 uppercase leading-none">2022 Strategy</h4>
            <p className="text-[10px] text-blue-600 font-bold uppercase mt-1.5 tracking-widest">
              Selected: {targetCountry || "NONE"}
            </p>
          </div>
        </div>
      </div>

      {/* DỮ LIỆU HIỂN THỊ */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 mt-1">
        <div className="flex flex-col">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual 2022</p>
          <span className="text-3xl font-black text-slate-800 tabular-nums leading-none mt-1">
            {/* Sử dụng hiệu ứng số chạy */}
            {isShowingResults ? <AnimatedNumber value={actualValue} /> : "--"}
          </span>
          <p className="text-[8px] text-blue-500 font-bold uppercase italic mt-2 leading-none">Supabase Live</p>
        </div>
        
        {/* Thêm glow effect cho phần AI Predict */}
        <div className={`flex flex-col border-l border-slate-100 pl-4 relative ${isShowingResults && 'ai-result-glow'}`}>
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">AI Predict</p>
          <span className={`text-3xl font-black tabular-nums leading-none mt-1 ${loadingAI ? 'animate-pulse text-blue-300' : 'text-blue-600'}`}>
            {/* Sử dụng hiệu ứng số chạy cho AI Predict */}
            {isShowingResults ? <AnimatedNumber value={predictValue} /> : "--"}
          </span>
          <p className="text-[8px] text-blue-400 font-bold uppercase italic mt-2 leading-none tracking-tighter relative z-10">FastAPI (XGBoost)</p>
        </div>
      </div>

      {/* NÚT BẤM & DELTA */}
      <div className="mt-2 flex flex-col gap-3">
        <button 
          onClick={() => onPredict(targetCountry)}
          disabled={!targetCountry || loadingAI}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-tighter flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
            !targetCountry ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'
          } ${loadingAI && 'animate-ai-thinking'}`} // Thêm hiệu ứng nhấp nháy khi AI thinking
        >
          {loadingAI ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
          {loadingAI ? "AI is Thinking..." : "Run AI Prediction"}
        </button>

        {/* Delta Card - Thêm chút animation trượt lên khi hiện */}
        <div className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl transition-all border ${isShowingResults && 'animate-fade-in-up'} ${
          (!isShowingResults) ? 'bg-slate-50 text-slate-300 border-transparent' :
          delta >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
        }`}>
          {delta >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span className="font-black text-xl tabular-nums leading-none">
            {/* Sử dụng số chạy cho Delta */}
            {isShowingResults ? <AnimatedNumber value={Math.abs(delta)} /> : "0.00"}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 ml-1">Delta Score</span>
        </div>
      </div>
    </div>
  );
}