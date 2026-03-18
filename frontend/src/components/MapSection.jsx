import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";

export default function MapSection({
  yearData,
  selectedCountry,
  setSelectedCountry,
  pinnedCountry,
  onCountryClick,
  colorScale,
}) {
  const countryDataMap = useMemo(() => {
    const map = new Map();
    yearData.forEach((d) => {
      if (d.REF_AREA && d.birth_rate != null) {
        map.set(d.REF_AREA.trim(), d.birth_rate);
      }
    });
    return map;
  }, [yearData]);

  return (
    <div className="flex-1 relative bg-gray-50 flex items-center justify-center">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{ rotate: [-10, -52, 0], scale: 850 }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso = geo.properties.ISO3 || geo.properties.iso_a3 || geo.properties.ISO_A3;
              if (!iso) return null;

              const val = countryDataMap.get(iso);
              const hasData = val !== undefined && val !== null;

              // Xác định màu nền
              let geoColor = "#f1f5f9"; // no data
              if (hasData) {
                if (val < 8) geoColor = "#e0f2fe";
                else if (val < 9.5) geoColor = "#bae6fd";
                else if (val < 11) geoColor = "#7dd3fc";
                else if (val < 12.5) geoColor = "#38bdf8";
                else if (val < 14) geoColor = "#0ea5e9";
                else geoColor = "#1e40af";
              }

              const isPinned = pinnedCountry === iso;
              const isHovered = selectedCountry === iso;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    console.log("Hover map:", iso, "val:", val);
                    setSelectedCountry(iso);
                  }}
                  onMouseLeave={() => {
                    console.log("Leave map:", iso);
                    setSelectedCountry(null);
                  }}
                  onClick={() => {
                    console.log("Click map:", iso);
                    if (onCountryClick) onCountryClick(iso);
                  }}
                  style={{
                    default: {
                      fill: geoColor,
                      stroke: isPinned ? "#1e40af" : "#cbd5e1",
                      strokeWidth: isPinned ? 3 : 0.8,
                      outline: "none",
                      pointerEvents: "all",
                      transition: "all 0.2s ease",
                    },
                    hover: {
                      fill: hasData ? "#60a5fa" : geoColor,
                      stroke: "#1e40af",
                      strokeWidth: 2.5,
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.2s ease",
                    },
                    pressed: {
                      fill: "#1e40af",
                      outline: "none",
                    },
                  }}
                >
                  <title>
                    {geo.properties.NAME || geo.properties.name || iso}
                    {hasData ? `: ${val.toFixed(1)} births/1k` : " (No data)"}
                    {isPinned ? " (Pinned)" : ""}
                  </title>
                </Geography>
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}