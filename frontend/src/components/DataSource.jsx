// src/components/DataSource.jsx
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { RefreshCw, Table, Eye, FileDown, Filter, BarChart3, X, Globe, Calendar, List } from "lucide-react";

const AVAILABLE_TABLES = [
  { value: "birth-rate", label: "Birth Rate" },
  { value: "government", label: "Government Spending" },
  { value: "population_age", label: "Population by Age" },
  { value: "employment", label: "Employment Data" },
  { value: "household", label: "Household Statistics" },
  { value: "Tax", label: "Tax Data" },
];

export default function DataSource() {
  const [selectedTable, setSelectedTable] = useState("Tax");
  const [tableData, setTableData] = useState([]);
  const [tableCounts, setTableCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = useState([]);

  // States để lưu danh sách filters lấy từ Server
  const [dbMinYear, setDbMinYear] = useState(null);
  const [dbMaxYear, setDbMaxYear] = useState(null);
  const [dbCountries, setDbCountries] = useState([]);

  // 1. Fetch tổng số dòng của tất cả các bảng
  const fetchAllTableCounts = async () => {
    const counts = {};
    for (const t of AVAILABLE_TABLES) {
      try {
        const { count } = await supabase.from(t.value).select("*", { count: "exact", head: true });
        counts[t.value] = count || 0;
      } catch {}
    }
    setTableCounts(counts);
  };


  // 2. Fetch Metadata (Min/Max Year & Countries) từ bảng hiện tại trước khi lấy data
  const fetchTableMetadata = async () => {
    setLoading(true);
    try {
      // Cách nhanh nhất để lấy min/max year
      const { data: minData } = await supabase.from(selectedTable).select("Year").order("Year", { ascending: true }).limit(1);
      const { data: maxData } = await supabase.from(selectedTable).select("Year").order("Year", { ascending: false }).limit(1);
      
      const minY = minData?.[0]?.Year ? Number(minData[0].Year) : 2000;
      const maxY = maxData?.[0]?.Year ? Number(maxData[0].Year) : 2021;
      
      setDbMinYear(minY);
      setDbMaxYear(maxY);
      setFromYear(minY.toString());
      setToYear(maxY.toString());

      // FIX LỖI Ở ĐÂY: Dùng vòng lặp gom đủ danh sách nước (Vượt rào 1000 dòng)
      let allCountries = new Set();
      let currentOffset = 0;
      const step = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from(selectedTable)
          .select("*") // Dùng * cho an toàn vì các bảng có tên cột khác nhau
          .range(currentOffset, currentOffset + step - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          // Lọc lấy Country của cụm 1000 dòng này nhét vào Set (Set tự động loại bỏ trùng lặp)
          data.forEach(row => {
            const code = (row.REF_AREA || row.COUNTRY || row.country || "").trim();
            if (code) allCountries.add(code);
          });
          
          currentOffset += step;
          if (data.length < step) hasMore = false; // Đã đến dòng cuối cùng
        } else {
          hasMore = false;
        }
      }

      // Đẩy danh sách đã gom đầy đủ vào State
      setDbCountries([...allCountries].sort());
    } catch (err) {
      console.error("Lỗi lấy metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Data chính theo Filter (Phân trang tự động để không bị thiếu)
  const fetchTableData = async () => {
    setLoading(true);
    setTableData([]); // Reset bảng trước khi load mới
    
    try {
      let query = supabase.from(selectedTable).select("*").order("Year", { ascending: true });

      // Áp dụng bộ lọc trực tiếp lên Supabase Query giúp tải RẤT NHANH
      if (selectedCountry) {
        query = query.eq("REF_AREA", selectedCountry);
      }
      if (fromYear) {
        query = query.gte("Year", Number(fromYear));
      }
      if (toYear) {
        query = query.lte("Year", Number(toYear));
      }

      // Logic phân trang tự động để gom hết kết quả (vượt qua giới hạn 1000)
      let allFetchedRows = [];
      let currentOffset = 0;
      const step = 1000;
      let hasMoreData = true;

      while (hasMoreData) {
        const { data, error } = await query.range(currentOffset, currentOffset + step - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allFetchedRows = [...allFetchedRows, ...data];
          currentOffset += step;
          if (data.length < step) hasMoreData = false;
        } else {
          hasMoreData = false;
        }
      }

      setTableData(allFetchedRows);
    } catch (err) {
      console.error("Lỗi tải data:", err);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Chạy khi vừa mở trang
  useEffect(() => {
    fetchAllTableCounts();
  }, []);

  // Chạy khi người dùng chọn Bảng khác
  useEffect(() => {
    setSelectedCountry(""); // Reset country
    setSelectedExportColumns([]); // Reset cột xuất CSV
    setTableData([]); // Clear bảng
    fetchTableMetadata(); // Lấy lại Min/Max Year và danh sách Countries mới
  }, [selectedTable]);

  // Tạo mảng năm để hiển thị ở Dropdown
  const availableYears = useMemo(() => {
    if (!dbMinYear || !dbMaxYear) return [];
    return Array.from({ length: dbMaxYear - dbMinYear + 1 }, (_, i) => dbMinYear + i);
  }, [dbMinYear, dbMaxYear]);

  // Lọc lại Data trên Frontend (Phòng trường hợp có lọc thừa) và giới hạn 500 dòng render
  const filteredData = useMemo(() => {
    let result = [...tableData];
    result.sort((a, b) => Number(a.Year || 0) - Number(b.Year || 0));
    return result;
  }, [tableData]);

  const previewData = filteredData.slice(0, 500); 
  const headers = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  useEffect(() => {
    if (headers.length > 0 && selectedExportColumns.length === 0) {
      setSelectedExportColumns(headers);
    }
  }, [headers]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert("No data to export");

    const cols = selectedExportColumns.length > 0 ? selectedExportColumns : headers;

    const csv = [
      cols.join(","),
      ...filteredData.map((row) =>
        cols.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}_${selectedCountry || "ALL"}_${fromYear || dbMinYear}-${toYear || dbMaxYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Row counts */}
      <div className="flex flex-wrap gap-3">
        {AVAILABLE_TABLES.map((t) => (
          <div key={t.value} className={`px-5 py-2.5 rounded-2xl border flex items-center gap-2 text-sm transition-all ${selectedTable === t.value ? "bg-blue-50 border-blue-200" : "bg-white"}`}>
            <BarChart3 size={16} className={selectedTable === t.value ? "text-blue-600" : "text-slate-400"} />
            <span className={selectedTable === t.value ? "text-blue-900 font-medium" : "text-slate-600"}>{t.label}:</span> 
            <span className="font-bold text-blue-600">{tableCounts[t.value]?.toLocaleString() || 0}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow border p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700"><Table size={16}/> Dataset</label>
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500">
            {AVAILABLE_TABLES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({tableCounts[opt.value] || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700"><Globe size={16}/> Country Code</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500" disabled={loading || dbCountries.length === 0}>
            <option value="">All Countries</option>
            {dbCountries.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700"><Calendar size={16}/> From Year</label>
          <select value={fromYear} onChange={(e) => setFromYear(e.target.value)} className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500" disabled={loading || availableYears.length === 0}>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 flex items-center gap-2 text-slate-700"><Calendar size={16}/> To Year</label>
          <select value={toYear} onChange={(e) => setToYear(e.target.value)} className="w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500" disabled={loading || availableYears.length === 0}>
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-4">
        <button onClick={fetchTableData} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium shadow-md transition-all">
          {loading ? <RefreshCw className="animate-spin" /> : <Eye />} Load Data Preview
        </button>

        <button onClick={handleExportCSV} disabled={filteredData.length === 0 || loading} className="flex items-center gap-3 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium shadow-md transition-all disabled:opacity-50">
          <FileDown /> Download CSV
        </button>

        <button onClick={() => setShowColumnSelector(true)} disabled={loading} className="flex items-center gap-3 px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-medium transition-all">
          <Filter /> Columns ({selectedExportColumns.length})
        </button>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-3xl shadow border overflow-hidden relative min-h-[400px]">
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <RefreshCw size={40} className="animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 font-medium animate-pulse">Processing request, please wait...</p>
          </div>
        )}

        <div className="px-8 py-6 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
            <List className="text-blue-600" /> Data Preview: {selectedTable}
          </h2>
          <span className="text-sm bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold">
            Showing Top {previewData.length} of {filteredData.length.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-8 py-4 text-left font-semibold text-slate-700 whitespace-nowrap border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewData.length > 0 ? (
                previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-colors">
                    {headers.map((h) => (
                      <td key={h} className="px-8 py-4 whitespace-nowrap text-slate-600">
                        {row[h] !== null && row[h] !== undefined ? String(row[h]) : "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length || 1} className="px-8 py-16 text-center text-slate-400 italic">
                    {loading ? "Loading data..." : "Click 'Load Data Preview' to view results."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Select Export Columns</h3>
              <button onClick={() => setShowColumnSelector(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {headers.map((col) => (
                <label key={col} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                  <input
                    type="checkbox"
                    checked={selectedExportColumns.includes(col)}
                    onChange={() => {
                      if (selectedExportColumns.includes(col)) {
                        setSelectedExportColumns(selectedExportColumns.filter((c) => c !== col));
                      } else {
                        setSelectedExportColumns([...selectedExportColumns, col]);
                      }
                    }}
                    className="w-5 h-5 accent-blue-600 rounded"
                  />
                  <span className="font-medium text-slate-700">{col}</span>
                </label>
              ))}
            </div>

            <div className="p-6 border-t flex justify-end gap-4 bg-slate-50">
              <button onClick={() => setShowColumnSelector(false)} className="px-8 py-3 text-slate-600 hover:bg-slate-200 rounded-2xl font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowColumnSelector(false)} className="px-8 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium transition-colors shadow-md">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}