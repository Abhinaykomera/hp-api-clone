import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ── Constants ───────────────────────────────────────────────────────
const HOUSE_PALETTE = {
  Gryffindor: 'border-red-700/40 bg-red-900/10',
  Slytherin:  'border-emerald-700/40 bg-emerald-900/10',
  Ravenclaw:  'border-blue-700/40 bg-blue-900/10',
  Hufflepuff: 'border-yellow-700/40 bg-yellow-900/10',
};
const defaultCard = 'border-[#2a2a4a] bg-[#1a1a2e]';
const getPalette  = (name) => HOUSE_PALETTE[name] ?? defaultCard;

const inputCls =
  'w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition';
const labelCls  = 'block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400';
const selectCls = inputCls + ' cursor-pointer';
const LIMIT = 12;

// ── Micro-components ────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
    </div>
  );
}

function ErrorBanner({ msg, onDismiss }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <span>⚠️</span><span className="flex-1">{msg}</span>
      {onDismiss && <button onClick={onDismiss} className="hover:text-red-200">✕</button>}
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-slate-400">
        Showing <span className="text-white font-medium">{start}–{end}</span> of{' '}
        <span className="text-white font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={!pagination.hasPrevPage}
          className="rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm text-slate-300 hover:border-[#d4af37]/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ← Previous
        </button>
        <span className="rounded-lg border border-[#2a2a4a] bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37]">
          {page} / {totalPages}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNextPage}
          className="rounded-lg border border-[#2a2a4a] px-4 py-2 text-sm text-slate-300 hover:border-[#d4af37]/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}

function DeleteModal({ name, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handle = async () => {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    catch (err) { setError(err.response?.data?.message ?? 'Delete failed.'); setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#1a1a2e] shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h2 className="text-lg font-bold text-white mb-2">Delete Staff Member?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Delete <span className="text-white font-semibold">{name}</span>? This cannot be undone.
        </p>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 justify-center">
          <button onClick={onClose}
            className="rounded-lg border border-[#2a2a4a] px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 transition-colors">Cancel</button>
          <button onClick={handle} disabled={loading}
            className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors">
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Staff form modal ────────────────────────────────────────────────
const BLANK = { name: '', house: '', subject: '', title: 'Professor' };

function StaffModal({ initial, houses, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm]     = useState(() => initial
    ? { name: initial.name ?? '', house: initial.house?._id ?? initial.house ?? '', subject: initial.subject ?? '', title: initial.title ?? 'Professor' }
    : BLANK);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = {
        name:    form.name.trim(),
        house:   form.house || null,
        subject: form.subject.trim(),
        title:   form.title.trim(),
      };
      const { data } = isEdit
        ? await api.put(`/staff/${initial._id}`, payload)
        : await api.post('/staff', payload);
      onSaved(data.data, isEdit); onClose();
    } catch (err) { setError(err.response?.data?.message ?? 'Something went wrong.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a2a4a] px-6 py-4">
          <h2 className="text-lg font-bold text-white">{isEdit ? '✏️ Edit Staff Member' : '⚗️ New Staff Member'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <ErrorBanner msg={error} onDismiss={() => setError('')} />}

          <div>
            <label className={labelCls}>Name *</label>
            <input name="name" required value={form.name} onChange={set} placeholder="Albus Dumbledore" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title</label>
              <input name="title" value={form.title} onChange={set} placeholder="Professor" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>House</label>
              <select name="house" value={form.house} onChange={set} className={selectCls}>
                <option value="">— None —</option>
                {houses.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Subject</label>
            <input name="subject" value={form.subject} onChange={set} placeholder="Defence Against the Dark Arts" className={inputCls} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-[#2a2a4a] px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="rounded-lg bg-[#d4af37] px-5 py-2 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Staff card ──────────────────────────────────────────────────────
function StaffCard({ member, token, onEdit, onDelete }) {
  const pal = getPalette(member.house?.name);
  return (
    <div className={`relative rounded-2xl border ${pal} p-5 hover:scale-[1.01] transition-transform duration-200 shadow-md`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {member.title && (
              <span className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider">{member.title}</span>
            )}
          </div>
          <h2 className="text-base font-bold text-white mt-0.5 truncate">{member.name}</h2>
        </div>
        {token && (
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(member)}
              className="rounded-lg border border-[#2a2a4a] bg-[#0d0d1a]/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors">✏️</button>
            <button onClick={() => onDelete(member)}
              className="rounded-lg border border-[#2a2a4a] bg-[#0d0d1a]/80 px-2.5 py-1.5 text-xs text-slate-300 hover:border-red-500/50 hover:text-red-400 transition-colors">🗑️</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2">
        {member.subject && (
          <span className="flex items-center gap-1">
            <span className="text-slate-500">📖</span>
            <span className="text-slate-300">{member.subject}</span>
          </span>
        )}
        {member.house?.name && (
          <span className="rounded-full border border-[#2a2a4a] bg-[#0d0d1a]/70 px-2.5 py-0.5 text-[11px] text-slate-300">
            {member.house.name}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Staff page ─────────────────────────────────────────────────
export default function Staff() {
  const { token } = useAuth();

  const [staff,      setStaff]      = useState([]);
  const [houses,     setHouses]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [houseFil,   setHouseFil]   = useState('');
  const [page,       setPage]       = useState(1);
  const [modal,      setModal]      = useState(null);

  const searchTimer = useRef(null);
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPage(1), 400);
  };

  useEffect(() => {
    api.get('/houses?limit=100').then(({ data }) => setHouses(data.data ?? [])).catch(() => {});
  }, []);

  const fetchStaff = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search.trim()) params.set('name',  search.trim());
      if (houseFil)      params.set('house', houseFil);
      const { data } = await api.get(`/staff?${params}`);
      setStaff(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load staff.');
    } finally { setLoading(false); }
  }, [page, search, houseFil]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSaved   = (saved, isEdit) =>
    setStaff((p) => isEdit ? p.map((m) => m._id === saved._id ? saved : m) : [saved, ...p]);
  const handleDeleted = (id) =>
    setStaff((p) => p.filter((m) => m._id !== id));

  return (
    <>
      {modal?.mode === 'create' && (
        <StaffModal initial={null} houses={houses} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.mode === 'edit' && (
        <StaffModal initial={modal.item} houses={houses} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal name={modal.item.name} onClose={() => setModal(null)}
          onConfirm={async () => { await api.delete(`/staff/${modal.item._id}`); handleDeleted(modal.item._id); }} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">⚗️</span>
              <h1 className="text-3xl font-extrabold text-white">Staff</h1>
            </div>
            <p className="text-slate-400 text-sm ml-14">
              {loading ? 'Loading…' : `${pagination?.total ?? staff.length} staff member${(pagination?.total ?? staff.length) !== 1 ? 's' : ''}`}
            </p>
          </div>
          {token && (
            <button onClick={() => setModal({ mode: 'create' })}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] transition-colors shadow-lg shadow-[#d4af37]/20 shrink-0">
              <span>＋</span> Add Staff
            </button>
          )}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input value={search} onChange={handleSearchChange} placeholder="Search by name…"
              className="w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 transition" />
          </div>
          <select value={houseFil} onChange={(e) => { setHouseFil(e.target.value); setPage(1); }} className={`${selectCls} sm:w-52`}>
            <option value="">All Houses</option>
            {houses.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        </div>

        {error && <ErrorBanner msg={error} onDismiss={() => { setError(''); fetchStaff(); }} />}
        {loading && <Spinner />}

        {!loading && !error && staff.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🏫</span>
            <h2 className="text-xl font-semibold text-white mb-2">No staff members found</h2>
            <p className="text-slate-400 text-sm">
              {search || houseFil ? 'Try adjusting your filters.' : token ? 'Add the first staff member.' : 'Log in to add staff.'}
            </p>
          </div>
        )}

        {!loading && staff.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {staff.map((m) => (
              <StaffCard key={m._id} member={m} token={token}
                onEdit={(item) => setModal({ mode: 'edit',   item })}
                onDelete={(item) => setModal({ mode: 'delete', item })} />
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={setPage} />
      </main>
    </>
  );
}
