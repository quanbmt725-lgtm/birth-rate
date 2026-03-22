// src/components/SystemFlow.jsx
import React, { useState } from "react";
import { Database, Globe, Server, Zap, ArrowRight, Play } from "lucide-react";

export default function SystemFlow() {
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 6500); // reset sau 6.5 giây
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-600 mt-2">Real-time data flow & AI prediction pipeline</p>
        </div>
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all disabled:opacity-70"
        >
          <Play size={20} />
          {isAnimating ? "Playing Animation..." : "Watch Live Flow"}
        </button>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Flow Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* 1. Supabase */}
          <div className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center transition-all duration-700 ${isAnimating ? "scale-110" : ""}`}>
              <Database size={42} className="text-emerald-600" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Supabase Database</p>
            <p className="text-xs text-slate-500">Birth rate data</p>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ArrowRight size={28} className={`text-slate-300 transition-all ${isAnimating ? "animate-pulse text-blue-500" : ""}`} />
          </div>

          {/* 2. Web (Vercel) */}
          <div className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center transition-all duration-700 ${isAnimating ? "scale-110" : ""}`}>
              <Globe size={42} className="text-blue-600" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Web App (Vercel)</p>
            <p className="text-xs text-slate-500">React + Tailwind</p>
            <div className={`mt-6 text-xs font-mono bg-slate-100 px-4 py-2 rounded-xl inline-block transition-all ${isAnimating ? "animate-pulse" : ""}`}>
              User clicks "Run AI Prediction"
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ArrowRight size={28} className={`text-slate-300 transition-all ${isAnimating ? "animate-pulse text-blue-500" : ""}`} />
          </div>

          {/* 3. Render (FastAPI + Model) */}
          <div className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center transition-all duration-700 ${isAnimating ? "scale-110 ring-4 ring-violet-300" : ""}`}>
              <Server size={42} className="text-violet-600" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Render.com Server</p>
            <p className="text-xs text-slate-500">FastAPI + XGBoost Model</p>
            <div className={`mt-6 text-xs font-mono bg-violet-100 px-4 py-2 rounded-xl inline-block transition-all ${isAnimating ? "animate-pulse" : ""}`}>
              Predicting next year birth rate...
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ArrowRight size={28} className={`text-slate-300 transition-all ${isAnimating ? "animate-pulse text-blue-500" : ""}`} />
          </div>

          {/* 4. Result back to Web */}
          <div className="text-center">
            <div className={`mx-auto w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center transition-all duration-700 ${isAnimating ? "scale-110" : ""}`}>
              <Zap size={42} className="text-emerald-600" />
            </div>
            <p className="mt-4 font-semibold text-slate-700">Result Returns</p>
            <p className="text-xs text-slate-500">AI Prediction displayed instantly</p>
          </div>
        </div>

        {/* Moving Dots Animation */}
        {isAnimating && (
          <>
            {/* Dot 1: Supabase → Web */}
            <div className="absolute top-10 left-[18%] w-3 h-3 bg-blue-500 rounded-full animate-[move1_2.5s_ease-in-out_forwards]"></div>
            {/* Dot 2: Web → Render */}
            <div className="absolute top-10 left-[43%] w-3 h-3 bg-violet-500 rounded-full animate-[move2_2.5s_ease-in-out_forwards]"></div>
            {/* Dot 3: Render → Web */}
            <div className="absolute top-10 left-[68%] w-3 h-3 bg-emerald-500 rounded-full animate-[move3_2.5s_ease-in-out_forwards]"></div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes move1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(180px); }
        }
        @keyframes move2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(180px); }
        }
        @keyframes move3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(180px); }
        }
      `}</style>
    </div>
  );
}