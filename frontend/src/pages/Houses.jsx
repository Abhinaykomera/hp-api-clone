import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ── House colour palette map ────────────────────────────────────────
const HOUSE_PALETTE = {
  Gryffindor: { bg: 'from-red-900/40 to-amber-900/30', border: 'border-red-700/40', badge: 'bg-red-900/50 text-red-300' },
  Slytherin:  { bg: 'from-emerald-900/40 to-slate-900/30', border: 'border-emerald-700/40', badge: 'bg-emerald-900/50 text-emerald-300' },
  Ravenclaw:  { bg: 'from-blue-900/40 to-slate-900/30', border: 'border-blue-700/40', badge: 'bg-blue-900/50 text-blue-300' },
  Hufflepuff: { bg: 'from-yellow-900/40 to-stone-900/30', border: 'border-yellow-700/40', badge: 'bg-yellow-900/50 text-yellow-300' },
};

const defaultPalette = { bg: 'from-[#1a1a2e] to-[#0d0d1a]', border: 'border-[#2a2a4a]', badge: 'bg-slate-800 text-slate-300' };

const getPalette = (name = '') =>
  HOUSE_PALETTE[name] ?? defaultPalette;

// ── Blank form state ────────────────────────────────────────────────
const BLANK = { name: '', founder: '', colors: '', animal: '', traits: '' };

// ── Small reusable components ───────────────────────────────────────

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
      <span className="mt-0.5">⚠️</span>
      <span className="flex-1">{msg}</span>
      <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-200">✕</button>
    </div>
  );
}

// ── HouseModal (create / edit) ──────────────────────────────────────
function HouseModal({ initial, onClose, onSaved }) {
  const isEdit = Boolean(initial?._id);
  const [form, setForm]     = useState(
    initial
      ? { ...initial, colors: initial.colors?.join(', ') ?? '', traits: initial.traits?.join(', ') ?? '' }
      : BLANK
  );
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name:    form.name.trim(),
        founder: form.founder.trim(),
        animal:  form.animal.trim(),
        colors:  form.colors.split(',').map((s) => s.trim()).filter(Boolean),
        traits:  form.traits.split(',').map((s) => s.trim()).filter(Boolean),
      };
      const { data } = isEdit
        ? await api.put(`/houses/${initial._id}`, payload)
        : await api.post('/houses', payload);
      onSaved(data.data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputCls =
    'w-full rounded-lg border border-[#2a2a4a] bg-[#0d0d1a] px-4 py-2.5 text-sm text-white placeholder-slate-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37]/60 transition';

  const labelCls = 'block mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e] shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[#2a2a4a] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {isEdit ? '✏️ Edit House' : '🏰 New House'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <ErrorBanner msg={error} onDismiss={() => setError('')} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>House Name *</label>
              <input name="name" required value={form.name} onChange={handleChange} placeholder="Gryffindor" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Founder *</label>
              <input name="founder" required value={form.founder} onChange={handleChange} placeholder="Godric Gryffindor" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Animal *</label>
              <input name="animal" required value={form.animal} onChange={handleChange} placeholder="Lion" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Colors * <span className="normal-case font-normal text-slate-500">(comma-separated)</span></label>
              <input name="colors" required value={form.colors} onChange={handleChange} placeholder="Scarlet, Gold" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Traits <span className="normal-case font-normal text-slate-500">(comma-separated, optional)</span></label>
            <input name="traits" value={form.traits} onChange={handleChange} placeholder="Bravery, Nerve, Chivalry" className={inputCls} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#2a2a4a] px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#d4af37] px-5 py-2 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create House'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DeleteConfirmModal ──────────────────────────────────────────────
function DeleteModal({ house, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/houses/${house._id}`);
      onDeleted(house._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Delete failed.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#1a1a2e] shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">🗑️</div>
        <h2 className="text-lg font-bold text-white mb-2">Delete House?</h2>
        <p className="text-sm text-slate-400 mb-5">
          Are you sure you want to delete <span className="text-white font-semibold">{house.name}</span>?
          This action cannot be undone.
        </p>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#2a2a4a] px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 hover:bg-red-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HouseCard ───────────────────────────────────────────────────────
function HouseCard({ house, token, onEdit, onDelete }) {
  const pal = getPalette(house.name);

  return (
    <div className={`relative rounded-2xl border ${pal.border} bg-gradient-to-br ${pal.bg} p-6 flex flex-col gap-4 
                     hover:scale-[1.02] transition-transform duration-200 shadow-lg`}>

      {/* Auth-only action buttons */}
      {token && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => onEdit(house)}
            title="Edit house"
            className="rounded-lg border border-[#2a2a4a] bg-[#0d0d1a]/80 px-2.5 py-1.5 text-xs text-slate-300
                       hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(house)}
            title="Delete house"
            className="rounded-lg border border-[#2a2a4a] bg-[#0d0d1a]/80 px-2.5 py-1.5 text-xs text-slate-300
                       hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Name */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight pr-16">{house.name}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Founded by {house.founder}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Animal</p>
          <p className="text-slate-200 font-medium">{house.animal}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Colors</p>
          <div className="flex flex-wrap gap-1">
            {house.colors?.map((c) => (
              <span key={c} className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${pal.badge}`}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Traits */}
      {house.traits?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Traits</p>
          <div className="flex flex-wrap gap-1.5">
            {house.traits.map((t) => (
              <span key={t} className="rounded-full border border-[#2a2a4a] bg-[#0d0d1a]/60 px-2.5 py-0.5 text-[11px] text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Houses page ────────────────────────────────────────────────
export default function Houses() {
  const { token } = useAuth();

  const [houses,      setHouses]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [modalState,  setModalState]  = useState(null); // null | { mode:'create' } | { mode:'edit', house } | { mode:'delete', house }

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchHouses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/houses?limit=100');
      setHouses(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load houses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHouses(); }, [fetchHouses]);

  // ── Optimistic state helpers ────────────────────────────────────
  const handleSaved = (saved, isEdit) => {
    setHouses((prev) =>
      isEdit
        ? prev.map((h) => (h._id === saved._id ? saved : h))
        : [...prev, saved]
    );
  };

  const handleDeleted = (id) =>
    setHouses((prev) => prev.filter((h) => h._id !== id));

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* Modals */}
      {modalState?.mode === 'create' && (
        <HouseModal
          initial={null}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
      {modalState?.mode === 'edit' && (
        <HouseModal
          initial={modalState.house}
          onClose={() => setModalState(null)}
          onSaved={handleSaved}
        />
      )}
      {modalState?.mode === 'delete' && (
        <DeleteModal
          house={modalState.house}
          onClose={() => setModalState(null)}
          onDeleted={handleDeleted}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">🏰</span>
              <h1 className="text-3xl font-extrabold text-white">Houses</h1>
            </div>
            <p className="text-slate-400 text-sm ml-14">
              {loading ? 'Loading…' : `${houses.length} house${houses.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {token && (
            <button
              onClick={() => setModalState({ mode: 'create' })}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0d0d0d]
                         hover:bg-[#e0c04a] active:bg-[#c49e2a] transition-colors shadow-lg shadow-[#d4af37]/20 shrink-0"
            >
              <span className="text-base">＋</span> Create House
            </button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <ErrorBanner
            msg={error}
            onDismiss={() => { setError(''); fetchHouses(); }}
          />
        )}

        {/* Loading state */}
        {loading && <Spinner />}

        {/* Empty state */}
        {!loading && !error && houses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🏚️</span>
            <h2 className="text-xl font-semibold text-white mb-2">No houses yet</h2>
            <p className="text-slate-400 text-sm mb-6">
              {token ? 'Get started by creating the first house.' : 'Log in to create houses.'}
            </p>
            {token && (
              <button
                onClick={() => setModalState({ mode: 'create' })}
                className="rounded-xl bg-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] transition-colors"
              >
                Create First House
              </button>
            )}
          </div>
        )}

        {/* Card grid */}
        {!loading && houses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
            {houses.map((house) => (
              <HouseCard
                key={house._id}
                house={house}
                token={token}
                onEdit={(h) => setModalState({ mode: 'edit', house: h })}
                onDelete={(h) => setModalState({ mode: 'delete', house: h })}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
