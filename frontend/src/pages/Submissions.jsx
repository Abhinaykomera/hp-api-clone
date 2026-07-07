import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
    </div>
  );
}

// Pretty-print any value for a table cell
function CellValue({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-slate-600 italic">—</span>;
  }
  if (typeof value === 'object') {
    return <span className="text-slate-400 text-xs font-mono">{JSON.stringify(value)}</span>;
  }
  return <span>{String(value)}</span>;
}

// Entity type badge colours
const ENTITY_COLORS = {
  Character: 'text-purple-300 bg-purple-900/40 border-purple-700/40',
  Student:   'text-blue-300   bg-blue-900/40   border-blue-700/40',
  Staff:     'text-amber-300  bg-amber-900/40  border-amber-700/40',
  House:     'text-emerald-300 bg-emerald-900/40 border-emerald-700/40',
};
const defaultBadge = 'text-slate-300 bg-slate-800/40 border-slate-600/40';

function EntityBadge({ type }) {
  const cls = ENTITY_COLORS[type] ?? defaultBadge;
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      {type ?? 'Unknown'}
    </span>
  );
}

export default function Submissions() {
  const { user } = useAuth();

  const [rows,    setRows]    = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/submissions');
      const rawRows = Array.isArray(data.data) ? data.data : [];
      setRows(rawRows);

      // Derive column names from the union of all row keys
      if (rawRows.length > 0) {
        const allKeys = [...new Set(rawRows.flatMap((r) => Object.keys(r)))];
        // Put known important columns first
        const priority = ['entityType', 'name', 'timestamp', 'createdAt'];
        const sorted = [
          ...priority.filter((k) => allKeys.includes(k)),
          ...allKeys.filter((k) => !priority.includes(k)),
        ];
        setColumns(sorted);
      }
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // Client-side search across all string values
  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(row).some((v) =>
      v != null && String(v).toLowerCase().includes(q)
    );
  });

  const prettyLabel = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">📋</span>
            <h1 className="text-3xl font-extrabold text-white">Submissions Log</h1>
          </div>
          <div className="ml-14 flex items-center gap-3">
            <p className="text-slate-400 text-sm">
              {loading ? 'Loading…' : `${filtered.length} submission${filtered.length !== 1 ? 's' : ''}${search ? ' (filtered)' : ''}`}
            </p>
            <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#d4af37]">
              Admin only
            </span>
          </div>
        </div>
        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2a2a4a] px-4 py-2.5 text-sm font-medium text-slate-300
                     hover:border-[#d4af37]/40 hover:text-white disabled:opacity-40 transition-colors shrink-0"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span> Refresh
        </button>
      </div>

      {/* Admin chip */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#2a2a4a] bg-[#1a1a2e] px-4 py-3">
        <span className="text-lg">🔐</span>
        <p className="text-sm text-slate-400">
          Signed in as <span className="text-white font-semibold">{user?.name ?? user?.email}</span>
          {' '}— <span className="text-[#d4af37]">Administrator</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span>⚠️</span>
          <span className="flex-1">{error}</span>
          <button onClick={fetchSubmissions} className="shrink-0 underline hover:text-red-200 text-xs">Retry</button>
        </div>
      )}

      {loading && <Spinner />}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-6xl mb-4">📭</span>
          <h2 className="text-xl font-semibold text-white mb-2">No submissions yet</h2>
          <p className="text-slate-400 text-sm">
            Entries will appear here once characters, students, or staff are created.
          </p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <>
          {/* Search */}
          <div className="relative mb-5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search submissions…"
              className="w-full sm:max-w-sm rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] pl-9 pr-4 py-2.5 text-sm text-white
                         placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-[#2a2a4a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2a4a] bg-[#0d0d1a]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-8">
                      #
                    </th>
                    {columns.map((col) => (
                      <th key={col}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {prettyLabel(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1}
                          className="px-4 py-10 text-center text-sm text-slate-500 italic">
                        No results match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row, idx) => (
                      <tr key={idx}
                          className={`border-b border-[#2a2a4a]/60 transition-colors hover:bg-[#d4af37]/5
                                     ${idx % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#1a1a2e]/60'}`}>
                        <td className="px-4 py-3 text-slate-600 text-xs">{idx + 1}</td>
                        {columns.map((col) => (
                          <td key={col} className="px-4 py-3 text-slate-300 whitespace-nowrap max-w-xs truncate">
                            {col === 'entityType'
                              ? <EntityBadge type={row[col]} />
                              : <CellValue value={row[col]} />
                            }
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="border-t border-[#2a2a4a] bg-[#0d0d1a] px-4 py-3">
              <p className="text-xs text-slate-500">
                Data sourced from Google Sheets via the backend webhook proxy.{' '}
                {!error && <span>{rows.length} total row{rows.length !== 1 ? 's' : ''}.</span>}
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
