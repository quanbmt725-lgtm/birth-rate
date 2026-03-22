import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { Download, RefreshCw, Table, Eye, FileDown, Filter, X, Globe, Calendar, List } from "lucide-react";

const AVAILABLE_TABLES = [
  { value: "birth-rate", label: "Birth Rate" },
  { value: "government", label: "Government Spending" },
  { value: "population_age", label: "Population by Age" },
  { value: "employment", label: "Employment Data" },
  { value: "household", label: "Household Statistics" },
  { value: "Tax", label: "Tax Data" },
];

export default function DataSource({ allData }) {
  const [selectedTable, setSelectedTable] = useState("birth-rate");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewLimit, setPreviewLimit] = useState(50);
  const [isExporting, setIsExporting] = useState(false);

  // Filters - Countries giờ là single select giống Year
  const [selectedCountry, setSelectedCountry] = useState(""); // single country
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = useState([]);

  const fetchTableData = async () => {
    if (selectedTable === "birth-rate" && allData.length > 0) {
      setTableData(allData);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select("*")
        .order("Year", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setTableData(data || []);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [selectedTable, allData]);

  useEffect(() => {
    setSelectedCountry("");
    setFromYear("");
    setToYear("");
    setSelectedExportColumns([]);
  }, [selectedTable]);

  const uniqueCountries = useMemo(() => {
    const set = new Set(tableData.map(row => row.COUNTRY || row.REF_AREA || row.country || "").filter(Boolean));
    return Array.from(set).sort();
  }, [tableData]);

  const uniqueYears = useMemo(() => {
    const years = new Set(tableData.map(row => Number(row.Year || row.YEAR)).filter(y => !isNaN(y) && y > 1900 && y < 2100));
    return Array.from(years).sort((a, b) => a - b);
  }, [tableData]);

  const filteredData = useMemo(() => {
    return tableData.filter(row => {
      const rowYear = Number(row.Year || row.YEAR || 0);
      const rowCountry = row.COUNTRY || row.REF_AREA || row.country || "";

      const countryMatch = !selectedCountry || rowCountry === selectedCountry;
      const yearMatch = 
        (!fromYear || rowYear >= Number(fromYear)) &&
        (!toYear || rowYear <= Number(toYear));

      return countryMatch && yearMatch;
    });
  }, [tableData, selectedCountry, fromYear, toYear]);

  const previewData = filteredData.slice(0, previewLimit);
  const headers = tableData[0] ? Object.keys(tableData[0]) : [];

  useEffect(() => {
    if (headers.length > 0 && selectedExportColumns.length === 0) {
      setSelectedExportColumns(headers);
    }
  }, [headers]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert("No data to export.");
    setIsExporting(true);

    const exportCols = selectedExportColumns.length ? selectedExportColumns : headers;
    const csv = [
      exportCols.join(","),
      ...filteredData.map(row =>
        exportCols.map(col => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_filtered_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <List size={24} className="text-blue-600" />
            Data Explorer & Export
          </h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dataset */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Table size={16} /> Dataset
            </label>
            <select
              value={selectedTable}
              onChange={e => setSelectedTable(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {AVAILABLE_TABLES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Country - Single select, giống Year */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Globe size={16} /> Country
            </label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={loading || uniqueCountries.length === 0}
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* From Year */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} /> From Year
            </label>
            <select
              value={fromYear}
              onChange={e => setFromYear(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={loading || uniqueYears.length === 0}
            >
              <option value="">All (earliest)</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* To Year */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar size={16} /> To Year
            </label>
            <select
              value={toYear}
              onChange={e => setToYear(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={loading || uniqueYears.length === 0}
            >
              <option value="">All (latest)</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 flex flex-wrap gap-4 justify-end border-t bg-slate-50">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Preview Rows:</label>
            <select
              value={previewLimit}
              onChange={e => setPreviewLimit(Number(e.target.value))}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>

          <button
            onClick={fetchTableData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Eye size={18} />}
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || filteredData.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            {isExporting ? <RefreshCw size={18} className="animate-spin" /> : <FileDown size={18} />}
            {isExporting ? "Exporting..." : "Download CSV"}
          </button>

          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-800 font-medium rounded-xl hover:bg-slate-300 transition-all"
          >
            <Filter size={18} />
            Columns
          </button>
        </div>

        {/* Column Selector */}
        {showColumnSelector && headers.length > 0 && (
          <div className="p-6 border-t bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Export Columns</h3>
              <X size={20} className="cursor-pointer text-slate-500 hover:text-red-600" onClick={() => setShowColumnSelector(false)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {headers.map(col => (
                <label key={col} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-100 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedExportColumns.includes(col)}
                    onChange={e => {
                      if (e.target.checked) setSelectedExportColumns([...selectedExportColumns, col]);
                      else setSelectedExportColumns(selectedExportColumns.filter(c => c !== col));
                    }}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <RefreshCw size={40} className="animate-spin text-blue-600" />
          </div>
        )}

        <div className="px-6 py-5 border-b bg-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <Table size={20} className="text-blue-600" />
            Preview: {selectedTable} ({previewData.length} rows)
          </h2>
          <span className="text-sm text-slate-600">
            {filteredData.length} filtered rows total
          </span>
        </div>

        {error ? (
          <div className="p-10 text-center text-red-600 bg-red-50">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-slate-100 sticky top-0 z-10">
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-6 py-4 text-left font-semibold border-b">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="py-16 text-center text-slate-500">
                      No matching data — try adjusting filters
                    </td>
                  </tr>
                ) : (
                  previewData.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-blue-50/50 transition-colors">
                      {headers.map(h => (
                        <td key={h} className="px-6 py-4 whitespace-nowrap">
                          {row[h] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {(selectedCountry || fromYear || toYear) && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setSelectedCountry("");
              setFromYear("");
              setToYear("");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all shadow-sm"
          >
            <X size={18} /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}