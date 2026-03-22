// src/components/Information.jsx
import React, { useState, useEffect } from "react";
import { Globe, Database, BarChart2, ExternalLink, Heart, Server, FileCode2, Play, CheckCircle2, Terminal, Square, RotateCcw, Settings, Cpu, Code } from "lucide-react";

function SystemFlowSection() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, text: "System idle. Ready to initiate prediction flow.", type: "info" }
  ]);

  const addLog = (text, type = "info") => {
    setLogs(prev => [...prev.slice(-3), { id: Date.now(), text, type }]);
  };

  useEffect(() => {
    if (!isPlaying) return;

    let timer;
    if (step === 0) {
      timer = setTimeout(() => {
        setStep(1);
        addLog("[FETCH] Web App requesting historical data from Supabase...", "db");
      }, 500);
    } else if (step === 1) {
      timer = setTimeout(() => {
        setStep(2);
        addLog("[API POST] Web App sending payload to Render (main.py)...", "req");
      }, 2500); 
    } else if (step === 2) {
      timer = setTimeout(() => {
        setStep(3);
        addLog("[INFERENCE] Model is waking up & computing XGBoost...", "ai");
      }, 2500); 
    } else if (step === 3) {
      timer = setTimeout(() => {
        setStep(4);
        addLog("[RESPONSE] Prediction calculated: 1.78. Sending to client.", "success");
      }, 4000); 
    } else if (step === 4) {
      timer = setTimeout(() => {
        setStep(5);
        addLog("[UI UPDATE] Dashboard updated with new predicted value.", "success");
      }, 2500);
    } else if (step === 5) {
      timer = setTimeout(() => {
        setStep(0);
        addLog("[SYS] Restarting prediction cycle...", "info");
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (step === 0) setLogs([]); 
    } else {
      setIsPlaying(false);
      addLog("[SYS] Simulation paused.", "info");
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
    setLogs([{ id: Date.now(), text: "System idle. Ready to initiate prediction flow.", type: "info" }]);
  };

  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 ${
      step > 0 || isPlaying
        ? 'bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 scale-[1.01] shadow-blue-900/50' 
        : 'bg-gradient-to-br from-[#4158D0] via-[#C850C0] to-[#FFCC70] shadow-xl' 
    } p-1 relative`}>
      
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 h-full w-full rounded-[22px] p-6 md:p-8 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-20">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 drop-shadow-sm">
              How It Works
            </h2>
            <p className="text-blue-200 mt-2 font-medium text-sm md:text-base">
              Real-time data flow & AI prediction pipeline
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-xl text-sm ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 text-white'
              }`}
            >
              {isPlaying ? <Square size={16} className="fill-current" /> : <Play size={16} className="fill-current" />}
              {isPlaying ? "Stop Flow" : "Watch Live Flow"}
            </button>

            <button
              onClick={handleReset}
              disabled={step === 0 && !isPlaying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* --- BỐ CỤC KIẾN TRÚC CHI TIẾT --- */}
        <div className="relative max-w-4xl mx-auto h-[280px] mb-6 z-10">
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <line x1="20%" y1="20%" x2="50%" y2="20%" stroke="#475569" strokeWidth="2" strokeDasharray="4 6" className={isPlaying ? "animate-[dash_1.5s_linear_infinite]" : ""} />
            <line x1="50%" y1="20%" x2="50%" y2="75%" stroke="#475569" strokeWidth="2" strokeDasharray="4 6" className={isPlaying ? "animate-[dash_1.5s_linear_infinite]" : ""} />
            <line x1="50%" y1="75%" x2="80%" y2="75%" stroke="#475569" strokeWidth="2" strokeDasharray="4 6" className={isPlaying ? "animate-[dash_1.5s_linear_infinite]" : ""} />

            {/* KEYFRAMES ĐƯỢC CHỈNH MƯỢT HOÀN TOÀN */}
            {step === 1 && <circle r="6" fill="#10b981" filter="url(#glow)" className="animate-[moveStoW_2.5s_ease-in-out_forwards]" />}
            {step === 2 && <circle r="6" fill="#8b5cf6" filter="url(#glow)" className="animate-[moveWtoR_2.5s_ease-in-out_forwards]" />}
            {step === 3 && <circle r="6" fill="#f59e0b" filter="url(#glow)" className="animate-[moveRtoM_4s_ease-in-out_forwards]" />}
            {step === 4 && <circle r="6" fill="#2dd4bf" filter="url(#glow)" className="animate-[moveRtoW_2.5s_ease-in-out_forwards]" />}
          </svg>

          {/* NODE 1: SUPABASE */}
          <div className={`absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 z-10 w-32 ${step === 1 ? "scale-110" : "scale-100"}`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              step === 1 ? "bg-emerald-500 ring-4 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.6)]" : "bg-slate-800/80 border border-slate-600 backdrop-blur-sm"
            }`}>
              <Database size={28} className={step === 1 ? "text-white animate-pulse" : "text-emerald-400"} />
            </div>
            <p className={`mt-3 font-bold text-sm transition-colors ${step === 1 ? "text-emerald-300" : "text-slate-300"}`}>Supabase</p>
            <p className="text-[10px] text-slate-400">Data Storage</p>
          </div>

          {/* NODE 2: VERCEL WEB APP */}
          <div className={`absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 z-10 w-36 ${step === 1 || step === 2 || step === 4 || step === 5 ? "scale-110" : "scale-100"}`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              step === 5 ? "bg-green-500 ring-4 ring-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.6)]" :
              step === 1 || step === 2 || step === 4 ? "bg-blue-600 ring-4 ring-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.6)]" : "bg-slate-800/80 border border-slate-600 backdrop-blur-sm"
            }`}>
              {step === 5 ? <CheckCircle2 size={28} className="text-white" /> : <Globe size={28} className={step === 1 || step === 2 || step === 4 ? "text-white" : "text-blue-400"} />}
            </div>
            <p className={`mt-3 font-bold text-sm transition-colors ${step === 1 || step === 2 || step === 4 || step === 5 ? "text-blue-300" : "text-slate-300"}`}>Frontend</p>
            <p className="text-[10px] text-slate-400">React Web App</p>
            {step === 5 && <div className="mt-2 text-[10px] font-bold text-slate-900 bg-green-400 py-1 px-3 rounded-full inline-block animate-bounce shadow-[0_0_15px_rgba(34,197,94,0.5)]">Pred: 1.78</div>}
          </div>

          {/* NODE 3: RENDER */}
          <div className={`absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 z-10 w-48 ${step === 2 || step === 3 || step === 4 ? "scale-110" : "scale-100"}`}>
            <div className={`mx-auto w-40 h-16 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 shadow-xl ${
              step >= 2 && step <= 4 ? "bg-violet-600 ring-4 ring-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.6)]" : "bg-slate-800/80 border border-slate-600 backdrop-blur-sm"
            }`}>
              <Server size={24} className={step >= 2 && step <= 4 ? "text-white" : "text-violet-400"} />
              <div className="text-left">
                <p className={`font-bold text-sm transition-colors ${step >= 2 && step <= 4 ? "text-white" : "text-violet-300"}`}>Render AI</p>
                <p className={`text-[10px] transition-colors ${step >= 2 && step <= 4 ? "text-violet-200" : "text-slate-400"}`}>FastAPI Server</p>
              </div>
            </div>
          </div>

          {/* NODE 4: MODEL PKL */}
          <div className={`absolute top-[75%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-500 z-10 w-32 ${step === 3 ? "scale-110" : "scale-100"}`}>
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              step === 3 ? "bg-amber-500 ring-4 ring-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.8)]" : "bg-slate-800/80 border border-slate-600 backdrop-blur-sm"
            }`}>
              {step === 3 ? (
                <Settings size={28} className="text-white animate-[spin_1.5s_linear_infinite]" /> 
              ) : (
                <FileCode2 size={28} className="text-amber-400" />
              )}
            </div>
            <p className={`mt-3 font-bold text-sm transition-colors ${step === 3 ? "text-amber-400 animate-pulse" : "text-slate-300"}`}>
              {step === 3 ? "Computing..." : "Model"}
            </p>
            <p className="text-[10px] text-slate-400">XGBoost.pkl</p>
          </div>

        </div>

        {/* --- KHUNG LOG DƯỚI CÙNG --- */}
        <div className="bg-[#050b14]/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-4 font-mono text-xs relative z-20 shadow-inner">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <Terminal size={14} className="text-slate-500 ml-2" />
            <span className="text-slate-400 text-[10px] tracking-widest uppercase font-bold">System Log</span>
          </div>
          <div className="space-y-1.5 min-h-[70px] flex flex-col justify-end">
            {logs.map((log) => (
              <div key={log.id} className={`animate-in slide-in-from-left-2 duration-300 opacity-100 ${
                log.type === "req" ? "text-purple-400" :
                log.type === "db" ? "text-emerald-400" :
                log.type === "ai" ? "text-amber-400" :
                log.type === "success" ? "text-green-400 font-bold" : "text-slate-500"
              }`}>
                <span className="text-slate-600 mr-2">{'>'}</span>{log.text}
              </div>
            ))}
          </div>
        </div>

        {/* --- CSS Animations (Tối ưu mượt mà) --- */}
        <style jsx>{`
          @keyframes dash {
            to { stroke-dashoffset: -20; }
          }
          @keyframes moveStoW {
            0% { cx: 20%; cy: 20%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { cx: 50%; cy: 20%; opacity: 0; }
          }
          @keyframes moveWtoR {
            0% { cx: 50%; cy: 20%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { cx: 50%; cy: 75%; opacity: 0; }
          }
          @keyframes moveRtoM {
            0% { cx: 50%; cy: 75%; opacity: 0; }
            10% { opacity: 1; }
            25% { cx: 80%; cy: 75%; opacity: 1; } /* Bay đến Model mượt mà */
            75% { cx: 80%; cy: 75%; opacity: 1; } /* Nằm im để Model xoay */
            90% { opacity: 1; }
            100% { cx: 50%; cy: 75%; opacity: 0; } /* Bay ngược về mượt mà */
          }
          @keyframes moveRtoW {
            0% { cx: 50%; cy: 75%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { cx: 50%; cy: 20%; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function Information() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-12 bg-white pb-20">
      
      {/* Header Chính */}
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
          Europe Birth Rate Analysis
        </h1>
        <p className="text-lg font-medium text-slate-500 max-w-3xl mx-auto leading-relaxed">
          An interactive dashboard exploring fertility trends across European countries, powered by real OECD data and Machine Learning.
        </p>
      </div>

      {/* --- PHẦN THÔNG TIN GIỚI THIỆU DỰ ÁN (MỚI THÊM) --- */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Cpu size={28} className="text-blue-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Project Architecture & Overview</h2>
          </div>
          
          <div className="flex flex-wrap gap-2.5 mb-6">
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 font-bold text-xs rounded-full flex items-center gap-1.5"><Code size={14}/> Node.js / React</span>
            <span className="px-3 py-1.5 bg-slate-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5"><Globe size={14}/> Vercel Hosted</span>
            <span className="px-3 py-1.5 bg-violet-100 text-violet-700 font-bold text-xs rounded-full flex items-center gap-1.5"><Server size={14}/> Render API</span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full flex items-center gap-1.5"><Cpu size={14}/> AI Co-piloted</span>
          </div>

          <div className="text-slate-600 text-lg leading-relaxed space-y-4">
            <p>
              <strong>EuroStats</strong> is the product of an in-depth birth rate analysis project. Its goal goes beyond simply visualizing historical data; it aims to utilize Machine Learning to forecast future demographic trends across Europe.
            </p>
            <p>
              The system is built on a <strong>Node.js</strong> environment, utilizing modern frontend libraries such as React, Tailwind CSS, and D3.js. The entire user interface (Web App) is automatically built and deployed on <strong>Vercel's</strong> fast edge network.
            </p>
            <p>
              The computational core and the Artificial Intelligence (XGBoost Model) are hosted independently on <strong>Render.com</strong>. When a user interacts with the dashboard, data is securely transmitted back and forth between the Web and Render in real-time. Notably, the architecture, UI design, and codebase of this project were structured and developed with the partial assistance of <strong>AI tools</strong> (Co-piloted).
            </p>
          </div>
        </div>
      </section>

      {/* --- KHỐI MÔ PHỎNG (HOW IT WORKS) --- */}
      <SystemFlowSection />

      {/* Project Capabilities */}
      <section className="bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <Heart size={28} className="text-rose-500 fill-rose-500/20" />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Project Capabilities</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-slate-600 font-medium">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              Interactive Choropleth map displaying fertility rates by country over 20+ years.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              Dynamic sidebar rankings highlighting year-over-year demographic shifts.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
              Hover tooltips revealing historical line charts for every selected region.
            </li>
          </ul>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0"></span>
              <strong>AI Prediction:</strong> Uses an XGBoost model to forecast the immediate next year's rate.
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0"></span>
              Deep Analysis view for comparing multiple sociological factors.
            </li>
          </ul>
        </div>
      </section>

      {/* Data Sources */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <Database size={28} className="text-emerald-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Reliable Data Sources</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <Globe size={24} className="text-blue-500" />
              OECD Data Explorer
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-6">
              Core demographic indicators, including total fertility rates and birth trends, are sourced directly from the OECD's official open dataset.
            </p>
            <a href="https://data-explorer.oecd.org/" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
              Visit Source <ExternalLink size={16} />
            </a>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              <BarChart2 size={24} className="text-emerald-500" />
              World Bank Data
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-6">
              Supplementary socioeconomic data used to train the Machine Learning model is aggregated from World Bank's global repositories.
            </p>
            <a href="https://ourworldindata.org/grapher/children-per-woman-un?time=2022" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
              Visit Source <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <div className="text-center text-slate-400 font-medium text-sm pt-8">
        <p>EuroStats Dashboard • Developed in 2026</p>
      </div>

    </div>
  );
}