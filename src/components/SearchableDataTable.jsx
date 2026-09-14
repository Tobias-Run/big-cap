import React, { useState, useMemo } from 'react';
import { CURRENT_YEAR } from '../utils/dateConstants';
import {
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Search,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const SearchableDataTable = ({ 
  filteredCompanies, 
  onSelectCompany, 
  mode 
}) => {
  const isCrazy = mode === 'crazy';
  const [sortField, setSortField] = useState('marketCap');
  const [sortDirection, setSortDirection] = useState('desc');
  const [tableSearch, setTableSearch] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const processedData = useMemo(() => {
    let result = [...filteredCompanies];

    if (tableSearch) {
      const q = tableSearch.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.ticker.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'age') {
        aVal = CURRENT_YEAR - a.foundingYear;
        bVal = CURRENT_YEAR - b.foundingYear;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [filteredCompanies, tableSearch, sortField, sortDirection]);

  // Export CSV functionality
  const handleExportCSV = () => {
    const headers = ['Company Name', 'Ticker', 'Market Cap ($B USD)', 'Founding Year', 'Age', 'Sector', 'Industry', 'Country', 'Region', 'Origin Type', 'Is From-Scratch', 'Founders', 'Citation'];
    const rows = processedData.map(c => [
      `"${c.name}"`,
      `"${c.ticker}"`,
      c.marketCap,
      c.foundingYear,
      CURRENT_YEAR - c.foundingYear,
      c.isTech ? 'High-Tech' : 'Other',
      `"${c.industry}"`,
      `"${c.country}"`,
      `"${c.region}"`,
      `"${c.originType}"`,
      c.isFromScratch ? 'Yes' : 'No',
      `"${c.founders || ''}"`,
      `"${c.citation || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `global_companies_from_scratch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-400" /> : <ArrowDown className="w-3 h-3 text-purple-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Filter table rows..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Showing {processedData.length} of {filteredCompanies.length} companies
          </span>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className={`rounded-xl border overflow-hidden transition-all ${
        isCrazy 
          ? 'bg-slate-950 border-purple-900/60 shadow-xl shadow-purple-950/40' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-950/90 sticky top-0 z-10 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th onClick={() => handleSort('name')} className="py-3 px-4 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    <span>Company</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th onClick={() => handleSort('marketCap')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    <span>Market Cap</span>
                    {getSortIcon('marketCap')}
                  </div>
                </th>
                <th onClick={() => handleSort('foundingYear')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    <span>Founded</span>
                    {getSortIcon('foundingYear')}
                  </div>
                </th>
                <th onClick={() => handleSort('age')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    <span>Age</span>
                    {getSortIcon('age')}
                  </div>
                </th>
                <th onClick={() => handleSort('region')} className="py-3 px-3 cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">
                    <span>Region</span>
                    {getSortIcon('region')}
                  </div>
                </th>
                <th className="py-3 px-3">Industry</th>
                <th className="py-3 px-3">Lineage / Origin</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {processedData.map((c) => {
                const age = CURRENT_YEAR - c.foundingYear;
                return (
                  <tr 
                    key={c.id} 
                    onClick={() => onSelectCompany(c)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.isTech ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                        <span>{c.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({c.ticker})</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                      ${c.marketCap >= 1000 ? `${(c.marketCap / 1000).toFixed(2)}T` : `${c.marketCap}B`}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {c.foundingYear}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-purple-300 font-semibold">
                      {age}y
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                        {c.region === 'EU' ? '🇪🇺 EU' : c.region === 'US' ? '🇺🇸 US' : c.region === 'CHINA' ? '🇨🇳 China' : c.region === 'ASIA_EX_CHINA' ? '🌏 Asia' : c.region === 'EUROPE_NON_EU' ? '🇬🇧 Europe' : '🌐 ROW'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[180px]" title={c.industry}>
                      {c.industry}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        c.isFromScratch 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {c.originType === 'from_scratch' ? 'From-Scratch' : c.originType === 'joint_venture' ? 'Joint Venture' : c.originType === 'spinoff' ? 'Spinoff' : 'Merger'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-purple-400 group-hover:underline text-[11px] font-medium">
                        View →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
