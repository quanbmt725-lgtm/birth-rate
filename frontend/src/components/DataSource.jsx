// src/components/DataSource.jsx
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { RefreshCw, Table, Eye, FileDown, Filter, BarChart3, X } from "lucide-react";

const AVAILABLE_TABLES = [
  { value: "birth-rate", label: "Birth Rate" },
  { value: "government", label: "Government Spending" },
  { value: "population_age", label: "Population by Age" },
  { value: "employment", label: "Employment Data" },
  { value: "household", label: "Household Statistics" },
  { value: "Tax", label: "Tax Data" },
];

const GLOBAL_YEARS = Array.from({ length: 22 }, (_, i) => 2000 + i);
const PREVIEW_OPTIONS = [50, 100, 250, 500, 1000];

export default function DataSource({ allData }) {
  const [selectedTable, setSelectedTable] = useState("Tax");
  const [tableData, setTableData] = useState([]);
  const [tableCounts, setTableCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [fromYear, setFromYear] = useState("2015");
  const [toYear, setToYear] = useState("2021");
  const [previewLimit, setPreviewLimit] = useState(100);

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = useState([]);

  // Fetch số dòng
  const fetchAllTableCounts = async () => {
    const counts = {};
    for (const t of AVAILABLE_TABLES) {
      try {
        const { count } = await supabase.from(t.value).select("*", { count: 'exact', head: true });
        counts[t.value] = count || 0;
      } catch {}
    }
    setTableCounts(counts);
  };

  // Fetch dữ liệu
  const fetchTableData = async () => {
    setLoading(true);
    try {
      let data = selectedTable === "birth-rate" && allData?.length > 0 
        ? allData 
        : (await supabase.from(selectedTable).select("*").limit(3000)).data || [];

      setTableData(data);
      console.log(`Loaded ${data.length} rows from ${selectedTable}`);
    } catch (err) {
      console.error(err);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTableCounts();
  }, []);

  useEffect(() => {
    if (selectedTable === "Tax") {
      setFromYear("2015");
      setToYear("2021");
    }
    fetchTableData();
  }, [selectedTable]);

  // Lấy danh sách quốc gia duy nhất
  const uniqueCountries = useMemo(() => {
    const countries = tableData.map(row => 
      row.COUNTRY || row.REF_AREA || row.country || row.Country || ""
    ).filter(Boolean);
    return [...new Set(countries)].sort();
  }, [tableData]);

  const filteredData = useMemo(() => {
    return tableData.filter(row => {
      const rowYear = Number(row.Year || row.year || row.YEAR || 0);
      const rowCountry = row.COUNTRY || row.REF_AREA || row.country || row.Country || "";
      
      const countryMatch = !selectedCountry || rowCountry === selectedCountry;
      const yearMatch = rowYear >= Number(fromYear) && rowYear <= Number(toYear);

      return countryMatch && yearMatch;
    });
  }, [tableData, selectedCountry, fromYear, toYear]);

  const previewData = filteredData.slice(0, previewLimit);
  const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  useEffect(() => {
    if (headers.length > 0 && selectedExportColumns.length === 0) {
      setSelectedExportColumns(headers);
    }
  }, [headers]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert("No data to export");

    const cols = selectedExportColumns.length > 0 ? selectedExportColumns : headers;
    
    const csv = [
      cols.join(","),
      ...filteredData.map(row => 
        cols.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_${fromYear}-${toYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Row counts */}
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_TABLES.map(t => (
          <div key={t.value} className="bg-white px-5 py-2.5 rounded-2xl border flex items-center gap-2 text-sm">
            <BarChart3 size={16} className="text-blue-600" />
            {t.label}: <span className="font-bold text-blue-600">{tableCounts[t.value]?.toLocaleString() || 0}</span> rows
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow border p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div>
          <label className="text-sm font-semibold mb-2 block">Dataset</label>
          <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}
            className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500">
            {AVAILABLE_TABLES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({tableCounts[opt.value] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* === PHẦN CHỌN COUNTRY ĐÃ THÊM === */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Country</label>
          <select 
            value={selectedCountry} 
            onChange={e => setSelectedCountry(e.target.value)}
            className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">From Year</label>
          <select value={fromYear} onChange={e => setFromYear(e.target.value)}
            className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500">
            {GLOBAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">To Year</label>
          <select value={toYear} onChange={e => setToYear(e.target.value)}
            className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500">
            {GLOBAL_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Preview Rows</label>
          <select value={previewLimit} onChange={e => setPreviewLimit(Number(e.target.value))}
            className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500">
            {PREVIEW_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <button onClick={fetchTableData} disabled={loading}
          className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium">
          {loading ? <RefreshCw className="animate-spin" /> : <Eye />} Refresh
        </button>

        <button onClick={handleExportCSV} disabled={filteredData.length === 0}
          className="flex items-center gap-3 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium">
          <FileDown /> Download CSV
        </button>

        <button onClick={() => setShowColumnSelector(true)}
          className="flex items-center gap-3 px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-medium">
          <Filter /> Columns ({selectedExportColumns.length})
        </button>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-3xl shadow border overflow-hidden">
        <div className="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Table className="text-blue-600" /> 
            Preview: {selectedTable} ({previewData.length} rows)
          </h2>
          <span className="text-slate-600">{filteredData.length} filtered rows total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                {headers.map(h => (
                  <th key={h} className="px-8 py-5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {previewData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/50">
                  {headers.map(h => (
                    <td key={h} className="px-8 py-4">{row[h] ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Select Columns to Export</h3>
              <button onClick={() => setShowColumnSelector(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 gap-3">
              {headers.map(col => (
                <label key={col} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-3 rounded-2xl">
                  <input
                    type="checkbox"
                    checked={selectedExportColumns.includes(col)}
                    onChange={() => {
                      if (selectedExportColumns.includes(col)) {
                        setSelectedExportColumns(selectedExportColumns.filter(c => c !== col));
                      } else {
                        setSelectedExportColumns([...selectedExportColumns, col]);
                      }
                    }}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <span className="font-medium">{col}</span>
                </label>
              ))}
            </div>

            <div className="p-6 border-t flex justify-end gap-4">
              <button 
                onClick={() => setShowColumnSelector(false)}
                className="px-8 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowColumnSelector(false)}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}