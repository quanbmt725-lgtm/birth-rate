import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Activity, Map as MapIcon } from "lucide-react";

// ========================================================================
// CONSTANTS & HELPERS
// ========================================================================
const BAR_GRADIENTS = [
  "from-rose-400 to-rose-600", "from-emerald-400 to-teal-500", "from-blue-400 to-indigo-600",
  "from-amber-400 to-orange-500", "from-fuchsia-400 to-purple-600", "from-cyan-400 to-sky-600", "from-yellow-400 to-amber-500"
];

// ========================================================================
// UI COMPONENTS
// ========================================================================
const StatCard = ({ title, value, icon, delta, loading, colorClass = "bg-blue-600" }) => (
  <div className="bg-white p-4 rounded-[1.8rem] border border-slate-100 shadow-sm flex flex-col gap-1 relative overflow-hidden transition-all hover:shadow-md h-full">
    {loading && <div className="absolute inset-0 bg-white/50 animate-pulse z-10" />}
    <div className="flex justify-between items-center">
      <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 text-slate-600`}>
        {React.cloneElement(icon, { size: 16, className: colorClass.replace("bg-", "text-") })}
      </div>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${delta >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
        {delta >= 0 ? `+${delta}%` : `${delta}%`}
      </span>
    </div>
    <h3 className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{value}</p>
  </div>
);

const AgeStructureCard = ({ title, data, loading }) => {
  const pieData = useMemo(() => data?.[0] ? [
    { name: "20-", value: Number(data[0].age1) || 0, gradId: "grad1", twBg: "from-violet-500 to-fuchsia-500" },
    { name: "20-64", value: Number(data[0].age2) || 0, gradId: "grad2", twBg: "from-cyan-400 to-blue-500" },
    { name: "65+", value: Number(data[0].age3) || 0, gradId: "grad3", twBg: "from-amber-400 to-orange-500" },
  ] : [], [data]);

  return (
    <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm flex flex-col relative h-full transition-shadow hover:shadow-md">
      {loading && <div className="absolute inset-0 bg-white/50 animate-pulse z-10 rounded-[1.8rem]" />}
      <h3 className="text-slate-800 text-[10px] font-black uppercase tracking-widest mb-2">{title}</h3>

      {!pieData.length ? <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">No data</div> : (
        <>
          <div className="flex-1 w-full min-h-[140px] flex items-center justify-center py-2 relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
              <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">100<span className="text-[12px] font-bold text-slate-400 ml-0.5">%</span></span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#D946EF" /></linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
                  <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#F97316" /></linearGradient>
                </defs>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius="72%" outerRadius="98%" paddingAngle={6} dataKey="value" stroke="none" cornerRadius={10}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={`url(#${entry.gradId})`} />)}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontSize: "12px", fontWeight: "bold" }} itemStyle={{ color: "#1e293b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center items-center gap-4 text-[9px] font-black text-slate-500 mt-3 px-1">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full shadow-sm bg-gradient-to-br ${item.twBg}`}></span>{item.name}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const HouseholdCostsCard = ({ title, expenditures, loading, selectedYear }) => (
  <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm flex flex-col gap-3 relative h-full transition-shadow hover:shadow-md lg:col-span-2">
    {loading && <div className="absolute inset-0 bg-white/50 animate-pulse z-10 rounded-[1.8rem]" />}
    <div className="flex justify-between items-center mb-1">
      <h3 className="text-slate-800 text-[11px] font-black uppercase tracking-widest">{title}</h3>
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Impact
      </div>
    </div>

    {expenditures?.length > 0 ? (
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        {expenditures.map((item, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <span className="w-32 lg:w-40 text-xs font-bold text-slate-500 truncate transition-colors group-hover:text-slate-900">{item.name}</span>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADIENTS[i % BAR_GRADIENTS.length]} transition-all duration-1000 ease-out`} style={{ width: `${Math.min(item.value, 100)}%` }} />
              </div>
              <span className="w-12 text-right text-xs font-black text-slate-700">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    ) : <div className="flex-1 flex items-center justify-center text-sm text-slate-400 italic py-4">No data for {selectedYear}</div>}
  </div>
);

// ========================================================================
// 2. MAIN COMPONENT (OPTIMIZED LOGIC)
// ========================================================================
export default function DeepAnalysis() {
  const [dataSets, setDataSets] = useState({ birth: [], population: [], government: [], tax: [], household: [] });
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("birth_rate");
  const [selectedYear, setSelectedYear] = useState(2021);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [birth, population, government, tax, household] = await Promise.all([
          supabase.from("birth-rate").select("*"), supabase.from("population_age").select("*"),
          supabase.from("government").select("*"), supabase.from("Tax").select("*"), supabase.from("household").select("*"),
        ]);
        setDataSets({ birth: birth.data || [], population: population.data || [], government: government.data || [], tax: tax.data || [], household: household.data || [] });
        const years = birth.data?.map(d => Number(d.Year)).filter(Boolean) || [];
        if (years.length) setSelectedYear(Math.max(...years));
      } catch (err) { console.error("Fetch error:", err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const uniqueYears = useMemo(() => [...new Set(dataSets.birth.map(d => Number(d.Year)))].filter(Boolean).sort((a, b) => b - a), [dataSets.birth]);

  // OPTIMIZED: O(N) Single-pass reduction
  const ageStructureData = useMemo(() => {
    const groups = {};
    dataSets.population.forEach(({ REF_AREA, Age, Year, '% Population': pct }) => {
      if (Number(Year) !== selectedYear || !REF_AREA || !Age) return;
      if (!groups[REF_AREA]) groups[REF_AREA] = { '20-': 0, '20-64': 0, '65+': 0, count: 0 };
      if (['20-', '20-64', '65+'].includes(Age.trim())) groups[REF_AREA][Age.trim()] += Number(pct) || 0;
      groups[REF_AREA].count++;
    });

    let [sum1, sum2, sum3, count] = [0, 0, 0, 0];
    Object.values(groups).forEach(g => { if (g.count > 0) { sum1 += g['20-']; sum2 += g['20-64']; sum3 += g['65+']; count++; } });
    return count ? [{ age1: (sum1 / count).toFixed(1), age2: (sum2 / count).toFixed(1), age3: (sum3 / count).toFixed(1) }] : [];
  }, [dataSets.population, selectedYear]);

  // OPTIMIZED: O(N) Single-pass reduction
  const householdCostsData = useMemo(() => {
    const grouped = {};
    let totalRaw = 0;
    let hasShare = false;

    dataSets.household.forEach(({ Year, Expenditure, Value_expenditure_Share, value_raw }) => {
      if (Number(Year) !== selectedYear) return;
      const exp = (Expenditure || "").trim().replace(/_/g, " ");
      if (!exp) return;
      
      if (Value_expenditure_Share !== undefined) hasShare = true;
      if (!grouped[exp]) grouped[exp] = { sum: 0, count: 0 };
      
      grouped[exp].sum += Number(hasShare ? Value_expenditure_Share : value_raw) || 0;
      grouped[exp].count++;
      totalRaw += Number(value_raw) || 0;
    });

    return Object.entries(grouped).map(([name, { sum, count }]) => ({
      name, value: Number(hasShare ? (sum / count) : totalRaw ? (sum / totalRaw) * 100 : 0).toFixed(1)
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 7);
  }, [dataSets.household, selectedYear]);

  // OPTIMIZED: O(N) Single-pass reduction for Trend
  const trendAnalysis = useMemo(() => {
    const groupedByYear = dataSets.birth.reduce((acc, d) => {
      const y = Number(d.Year);
      if (!y) return acc;
      if (!acc[y]) acc[y] = { sum: 0, count: 0 };
      acc[y].sum += Number(d[selectedMetric] || 0);
      acc[y].count++;
      return acc;
    }, {});
    
    return Object.entries(groupedByYear)
      .map(([year, { sum, count }]) => ({ year: Number(year), value: Number((sum / count).toFixed(2)) }))
      .sort((a, b) => a.year - b.year);
  }, [dataSets.birth, selectedMetric]);

  const dashboardData = useMemo(() => {
    const yearBirth = dataSets.birth.filter(d => Number(d.Year) === selectedYear);
    return {
      avg: (yearBirth.reduce((sum, d) => sum + Number(d[selectedMetric] || 0), 0) / (yearBirth.length || 1)).toFixed(2),
      regions: `${new Set(yearBirth.map(d => d.REF_AREA)).size}/50`
    };
  }, [dataSets.birth, selectedMetric, selectedYear]);

  const topGovSpending = useMemo(() => 
    dataSets.government.filter(d => Number(d.Year) === selectedYear)
      .sort((a, b) => Number(b.gov_spending || 0) - Number(a.gov_spending || 0)).slice(0, 6)
      .map(d => ({ name: d.REF_AREA, val: Number(d.gov_spending || 0).toFixed(2) }))
  , [dataSets.government, selectedYear]);

  return (
    <div className="p-8 space-y-6 bg-slate-50/40 min-h-screen text-slate-900">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-black uppercase italic">Deep Analysis</h2>
        <div className="flex items-center gap-3">
          <select value={selectedYear || ""} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm font-black text-[11px] outline-none cursor-pointer">
            {uniqueYears.map(yr => <option key={yr} value={yr}>{yr} YEAR</option>)}
          </select>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            {["birth_rate", "fertility"].map(m => (
              <button key={m} onClick={() => setSelectedMetric(m)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedMetric === m ? "bg-slate-900 text-white shadow-md" : "text-slate-400"}`}>
                {m.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="flex flex-col gap-5">
          <StatCard title={`Avg ${selectedMetric}`} value={dashboardData.avg} icon={<Activity />} delta={1.2} loading={loading} />
          <StatCard title="Active Regions" value={dashboardData.regions} icon={<MapIcon />} delta={0} loading={loading} colorClass="bg-slate-600" />
        </div>
        <AgeStructureCard title="Age Composition" data={ageStructureData} loading={loading} />
        <HouseholdCostsCard title="Household Spending" expenditures={householdCostsData} loading={loading} selectedYear={selectedYear} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
          <h4 className="text-xs font-black uppercase mb-6 italic tracking-widest text-slate-800">Demographic Timeline</h4>
          <div className="h-[320px] min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendAnalysis}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip formatter={val => val.toFixed(2)} contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fill="#2563eb" fillOpacity={0.05} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col">
          <h4 className="text-xs font-black uppercase mb-6 italic tracking-widest text-slate-800 text-center">Top Government Spending</h4>
          <div className="flex-1 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topGovSpending} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: "#1e293b", fontSize: 12, fontWeight: 900 }} width={45} />
                <Bar dataKey="val" fill="#7c3aed" radius={[0, 8, 8, 0]} barSize={20} />
                <Tooltip formatter={val => `${val}`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}