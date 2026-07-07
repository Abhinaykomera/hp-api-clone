import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURE_CARDS = [
  { icon: '🏰', title: 'Houses',     desc: 'Explore the four houses of Hogwarts — their traits, colours, and history.',   to: '/houses'     },
  { icon: '🧙', title: 'Characters', desc: 'Browse every witch and wizard from the wizarding world.',                     to: '/characters' },
  { icon: '📚', title: 'Students',   desc: 'View students sorted by house, year, and blood status.',                      to: '/students'   },
  { icon: '⚗️', title: 'Staff',      desc: 'Meet the professors and staff of Hogwarts School of Witchcraft and Wizardry.', to: '/staff'      },
];

export default function Home() {
  const { token } = useAuth();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4 text-center"
               style={{ background: 'radial-gradient(ellipse at center top, #1a1a3e 0%, #0d0d0d 70%)' }}>
        {/* subtle star grid */}
        <div className="pointer-events-none absolute inset-0 opacity-20"
             style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-xs font-medium text-[#d4af37] mb-6">
            ⚡ Harry Potter REST API
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Explore the{' '}
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent">
              Wizarding World
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            A fully-featured RESTful API for Harry Potter data — characters, houses, students,
            staff, and more. Built with Node.js, Express, and MongoDB.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {token ? (
              <Link
                to="/characters"
                className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] transition-colors shadow-lg shadow-[#d4af37]/20"
              >
                Browse Characters →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0d0d0d] hover:bg-[#e0c04a] transition-colors shadow-lg shadow-[#d4af37]/20"
                >
                  Get started
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-[#2a2a4a] px-6 py-3 text-sm font-medium text-slate-300 hover:border-[#d4af37]/40 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl font-bold text-white mb-12">
          What&apos;s inside?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map(({ icon, title, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-[#2a2a4a] bg-[#1a1a2e] p-6 hover:border-[#d4af37]/40 hover:bg-[#1a1a2e]/80
                         transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#d4af37]/5"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
