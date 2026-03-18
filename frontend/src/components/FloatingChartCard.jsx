import React from "react";
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  YAxis, 
  XAxis, 
  ReferenceLine 
} from "recharts";

export default function FloatingChartCard({ 
  year, 
  selectedCountry, 
  currentVal, 
  historyData, 
  position 
}) {
  if (!selectedCountry || !historyData?.length) return null;

  const CARD_WIDTH = 288;
  const CARD_HEIGHT = 240;

  const clampedX = Math.min(Math.max(position.x + 24, 20), window.innerWidth - CARD_WIDTH - 20);
  const clampedY = Math.min(Math.max(position.y - 160, 20), window.innerHeight - CARD_HEIGHT - 100);

  // Hàm lấy màu theo ngưỡng (đồng bộ với ranking bar)
  const getLineColor = (val) => {
    if (val < 8)        return "#e0f2fe";   // rất nhạt
    if (val < 9.5)      return "#bae6fd";
    if (val < 11)       return "#7dd3fc";
    if (val < 12.5)     return "#38bdf8";
    if (val < 14)       return "#0ea5e9";
    return "#1e40af";                       // đậm nhất
  };

  // Màu của dot (có thể đậm hơn line một chút để nổi bật)
  const getDotColor = (val) => {
    if (val < 8)        return "#bfdbfe";
    if (val < 9.5)      return "#7dd3fc";
    if (val < 11)       return "#38bdf8";
    if (val < 12.5)     return "#0ea5e9";
    if (val < 14)       return "#1d4ed8";
    return "#1e3a8a";   // đậm hơn nữa cho điểm nhấn
  };

  const lineColor  = currentVal != null ? getLineColor(currentVal) : "#94a3b8"; // fallback xám nếu không có data
  const dotColor   = currentVal != null ? getDotColor(currentVal)  : "#64748b";

  // Tìm index của năm hiện tại để vẽ dot
  const currentYearIndex = historyData.findIndex(d => String(d.Year) === String(year));

  const CustomDot = (props) => {
    const { cx, cy, index } = props;
    if (index !== currentYearIndex) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={dotColor}
        stroke="white"
        strokeWidth={2}
        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))" }}
      />
    );
  };

  return (
    <div 
      className="fixed pointer-events-none bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-slate-200 w-72 z-[999] text-sm"
      style={{ 
        left: clampedX, 
        top: clampedY,
        transition: 'left 0.08s ease-out, top 0.08s ease-out'
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-black text-slate-900 text-lg leading-none">{selectedCountry}</h4>
        <span className="text-xs font-bold text-slate-400 tracking-widest">{year}</span>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span 
          className="text-5xl font-black tabular-nums transition-colors"
          style={{ color: lineColor }}  // màu số lớn cũng đồng bộ với line
        >
          {currentVal !== null ? currentVal.toFixed(1) : "–"}
        </span>
        <span className="text-base text-slate-500 font-medium leading-none mt-2">
          births<br />per woman
        </span>
      </div>

      <div className="h-28 border-t border-slate-100 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={historyData}
            margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
          >
            <Line 
              type="monotone" 
              dataKey="birth_rate" 
              stroke={lineColor}
              strokeWidth={3.2}
              dot={<CustomDot />}
              activeDot={false}
            />
            
            <ReferenceLine 
              x={year.toString()} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              strokeWidth={2}
            />

            <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
            <XAxis dataKey="Year" hide />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}