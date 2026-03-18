import React from "react";

export default function RankingSidebar({ 
  data, 
  prevYearData = [], 
  selectedCountry, 
  setSelectedCountry 
}) {
  const sortedData = [...data]
    .filter(item => item.birth_rate != null)
    .sort((a, b) => (b.birth_rate || 0) - (a.birth_rate || 0));

  const getBarColor = (val) => {
    if (val < 8) return "#e0f2fe";
    if (val < 9.5) return "#bae6fd";
    if (val < 11) return "#7dd3fc";
    if (val < 12.5) return "#38bdf8";
    if (val < 14) return "#0ea5e9";
    return "#1e40af";
  };

  // Calculate top movers for the bottom section (top 5 biggest changes)
  const topMovers = React.useMemo(() => {
    if (!prevYearData.length) return [];

    const changes = data
      .map(item => {
        const prev = prevYearData.find(p => p.REF_AREA === item.REF_AREA);
        if (!prev || !prev.birth_rate || !item.birth_rate) return null;
        const change = item.birth_rate - prev.birth_rate;
        return { ...item, change };
      })
      .filter(Boolean)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 5);

    return changes;
  }, [data, prevYearData]);

  return (
    <div className="w-72 bg-slate-50 border-l border-slate-200 h-screen flex flex-col z-20 shadow-inner">
      {/* PART 1: RANKINGS LIST */}
      <div className="flex-1 p-5 overflow-y-auto scrollbar-hide">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
          RANKINGS
        </h3>

        <div className="space-y-3.5">
          {sortedData.map((item) => {
            const val = item.birth_rate || 0;
            const barColor = getBarColor(val);
            const isSelected = selectedCountry === item.REF_AREA;

            // Calculate change vs previous year
            const prev = prevYearData.find(p => p.REF_AREA === item.REF_AREA);
            const change = prev && prev.birth_rate != null 
              ? (val - prev.birth_rate).toFixed(2) 
              : null;
            const isUp = change > 0;
            const showChange = change !== null;

            const barWidth = Math.min((val / 16) * 100, 100);

            return (
              <div
                key={item.REF_AREA}
                onMouseEnter={() => setSelectedCountry(item.REF_AREA)}
                onMouseLeave={() => setSelectedCountry(null)}
                className={`transition-all duration-200 p-2.5 rounded-xl ${
                  isSelected 
                    ? 'scale-[1.02] bg-white shadow-md' 
                    : 'hover:bg-white/60'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: Country + Change value + Arrow */}
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className={isSelected ? "text-blue-700" : "text-slate-700"}>
                      {item.REF_AREA}
                    </span>
                    {showChange && (
                      <span className={`tabular-nums font-extrabold flex items-center gap-1 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {isUp ? '+' : ''}{change} {isUp ? '↑' : '↓'}
                      </span>
                    )}
                  </div>

                  {/* Row 2: Bar */}
                  <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden relative">
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 2: BOTTOM SQUARE – TOP MOVERS / BIGGEST CHANGES */}
      <div className="p-5 border-t border-slate-200 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-5 shadow-lg shadow-blue-200/50 border border-blue-200/70 transition-all hover:shadow-blue-300/60 hover:scale-[1.015]">
          
          <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest mb-3 text-center">
            TOP MOVERS THIS YEAR
          </p>

          <div className="space-y-2.5 text-[11px] text-slate-800">
            {topMovers.length > 0 ? (
              topMovers.map((mover) => {
                const isUp = mover.change > 0;
                return (
                  <div 
                    key={mover.REF_AREA} 
                    className="flex justify-between items-center px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-semibold text-blue-900">{mover.REF_AREA}</span>
                    <span className={`font-bold tabular-nums flex items-center gap-1.5 ${isUp ? 'text-green-700' : 'text-red-700'}`}>
                      {isUp ? '+' : ''}{mover.change.toFixed(2)} {isUp ? '↑' : '↓'}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-slate-600 py-5 italic text-[11px]">
                No significant changes this year
              </p>
            )}
          </div>

          <p className="text-[9px] text-blue-700/80 font-medium mt-4 text-center">
            Biggest changes vs previous year
          </p>
        </div>
      </div>
    </div>
  );
}