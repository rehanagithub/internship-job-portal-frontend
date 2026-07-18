import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const CATEGORIES = [
  { name: 'Technology', img: 'https://static.vecteezy.com/system/resources/thumbnails/049/191/168/small/a-modern-workspace-featuring-advanced-technology-including-a-holographic-calendar-and-illuminated-data-streams-creating-an-innovative-and-dynamic-environment-for-productivity-photo.jpg' },
  { name: 'Marketing', img: 'https://www.inseec.com/wp-content/uploads/sites/32/2025/11/guide-inseec-hero-quest-ce-que-Marketing-Digital.jpg?w=1372' },
  { name: 'Design', img: 'https://img.magnific.com/free-vector/multicolor-floral-design_1215-613.jpg' },
  { name: 'Finance', img: 'https://lntedutech.com/wp-content/uploads/2024/04/Personal-Finance-Management-scaled-1.jpg' },
  { name: 'Healthcare', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIULKdG0XdIhGJ-bD4HoMIUStL2mP69NEvZOab9_7dUp-koA7bK5AyQ7o1&s=10' },
  { name: 'Education', img: 'https://etimg.etb2bimg.com/thumb/msid-75729537,width-1200,height-900,resizemode-4/.jpg' },
  { name: 'Sales', img: 'https://www.highspot.com/wp-content/uploads/2023/07/essential-sales-skills.jpg' },
  { name: 'Engineering', img: 'https://www.datocms-assets.com/38028/1660154352-reliability-engineer-inspecting-machine.jpg?auto=format' },
];

const BOARD = [
  { role: 'Frontend Engineer Intern', company: 'Nimbus Labs', loc: 'Bengaluru', type: 'Internship', status: 'OPEN' },
  { role: 'Growth Marketing Analyst', company: 'Foundry & Co', loc: 'Remote', type: 'Full-time', status: 'OPEN' },
  { role: 'Product Designer', company: 'Orbit Studio', loc: 'Pune', type: 'Full-time', status: 'CLOSING SOON' },
  { role: 'Data Analyst Intern', company: 'Vertex Health', loc: 'Hyderabad', type: 'Internship', status: 'OPEN' },
  { role: 'Sales Development Rep', company: 'Northline', loc: 'Mumbai', type: 'Full-time', status: 'OPEN' },
  { role: 'ML Research Intern', company: 'Cortex AI', loc: 'Remote', type: 'Internship', status: 'CLOSING SOON' },
];

const STEPS = [
  { n: '01', title: 'Build your profile', desc: 'Add your skills, education, and resume in one place — it takes about five minutes.' },
  { n: '02', title: 'Find the right fit', desc: 'Filter thousands of roles by location, type, and category until the list is actually useful.' },
  { n: '03', title: 'Apply and track it', desc: 'One click to apply, then watch every application move through review to offer.' },
];

const TESTIMONIALS = [
  { quote: "I found my internship in nine days flat. The application tracker meant I never had to email anyone asking for an update.", name: 'Ananya R.', role: 'Product Design Intern, Orbit Studio', img: 'https://picsum.photos/seed/launchpad-person1/200/200' },
  { quote: "As a hiring manager, the difference is applicant quality. The screening questions filter out the people who didn't actually read the listing.", name: 'Karan M.', role: 'Engineering Manager, Nimbus Labs', img: 'https://picsum.photos/seed/launchpad-person2/200/200' },
  { quote: "Went from graduating to a signed offer in three weeks. I didn't expect a job board to feel this fast.", name: 'Priya S.', role: 'Data Analyst, Vertex Health', img: 'https://picsum.photos/seed/launchpad-person3/200/200' },
];

function DeparturesBoard() {
  const rows = [...BOARD, ...BOARD];
  return (
    <div className="rounded-2xl bg-[#0F1B2D] border border-white/10 overflow-hidden shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1FAE7A] animate-pulse" />
          <span className="font-[JetBrains_Mono] text-[11px] tracking-widest text-white/60 uppercase">Now boarding</span>
        </div>
        <span className="font-[JetBrains_Mono] text-[11px] text-white/40">{BOARD.length} roles live</span>
      </div>
      <div className="hidden sm:grid grid-cols-[2.2fr_1.4fr_1fr_1fr_1.1fr] gap-2 px-5 py-2 border-b border-white/5 font-[JetBrains_Mono] text-[10px] tracking-widest text-white/35 uppercase">
        <span>Role</span><span>Company</span><span>Location</span><span>Type</span><span className="text-right">Status</span>
      </div>
      <div className="board-scroll h-[280px] overflow-hidden relative">
        <div className="board-track">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[2.2fr_1.4fr_1fr_1fr_1.1fr] gap-2 px-5 py-3 border-b border-white/5 items-center font-[JetBrains_Mono] text-[12px] sm:text-[13px]">
              <span className="text-white font-medium truncate">{r.role}</span>
              <span className="text-white/60 truncate hidden sm:inline">{r.company}</span>
              <span className="text-white/50 truncate hidden sm:inline">{r.loc}</span>
              <span className="text-white/50 truncate hidden sm:inline">{r.type}</span>
              <span className={`text-right font-semibold ${r.status === 'OPEN' ? 'text-[#1FAE7A]' : 'text-[#F5A623]'}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialSlider() {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(timer.current);
  }, []);

  const go = (d) => {
    clearInterval(timer.current);
    setIdx(i => (i + d + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[idx];

  return (
    <div className="relative max-w-3xl mx-auto">
      <Quote size={40} className="text-[#F5A623]/30 mb-4" />
      <p className="font-[Outfit] text-xl sm:text-2xl text-[#0F1B2D] leading-snug mb-8 min-h-[96px] transition-all">
        "{t.quote}"
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#F5A623]" />
          <div>
            <p className="font-semibold text-[#0F1B2D] text-sm">{t.name}</p>
            <p className="text-[#0F1B2D]/50 text-xs">{t.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} className="w-9 h-9 rounded-full border border-[#0F1B2D]/15 flex items-center justify-center hover:bg-[#0F1B2D] hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => go(1)} className="w-9 h-9 rounded-full border border-[#0F1B2D]/15 flex items-center justify-center hover:bg-[#0F1B2D] hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1 rounded-full transition-all ${i === idx ? 'w-8 bg-[#F5A623]' : 'w-1.5 bg-[#0F1B2D]/15'}`} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params}`);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] font-[IBM_Plex_Sans]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .board-track { animation: board-scroll 14s linear infinite; }
        @keyframes board-scroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @media (prefers-reduced-motion: reduce) { .board-track { animation: none; } }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/launchpad-hero/1800/1100" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2D]/85 via-[#0F1B2D]/80 to-[#EEF2F6]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <span className="inline-block font-[JetBrains_Mono] text-[11px] tracking-widest uppercase text-[#F5A623] border border-[#F5A623]/40 rounded-full px-3 py-1.5 mb-6">
              10,000+ roles live right now
            </span>
            <h1 className="font-[Outfit] font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white mb-6">
              Your career,<br />cleared for <span className="text-[#F5A623]">takeoff.</span>
            </h1>
            <p className="text-white/70 text-lg mb-10 max-w-lg">
              Every internship and entry-level role, in one board that actually tells you what's still open.
            </p>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={18} className="text-[#0F1B2D]/40 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Job title or keyword"
                  className="flex-1 py-2.5 text-[#0F1B2D] text-sm focus:outline-none placeholder-[#0F1B2D]/35" />
              </div>
              <div className="flex items-center gap-2 flex-1 px-3 border-t sm:border-t-0 sm:border-l border-[#0F1B2D]/10">
                <MapPin size={18} className="text-[#0F1B2D]/40 flex-shrink-0" />
                <input value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="Location or remote"
                  className="flex-1 py-2.5 text-[#0F1B2D] text-sm focus:outline-none placeholder-[#0F1B2D]/35" />
              </div>
              <button type="submit" className="px-6 py-3 bg-[#F5A623] text-[#0F1B2D] font-semibold rounded-xl hover:bg-[#ffb84d] transition-colors text-sm flex-shrink-0">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5 mt-5">
              {['Remote', 'Internship', 'Full-time', 'Part-time'].map(t => (
                <button key={t} onClick={() => navigate(`/jobs?job_type=${t.toLowerCase()}`)}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium text-white border border-white/15 transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <DeparturesBoard />
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-[#0F1B2D]/8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10K+', 'Active roles'], ['5K+', 'Companies hiring'], ['50K+', 'Candidates placed'], ['9 days', 'Median time to offer']].map(([n, l]) => (
            <div key={l}>
              <p className="font-[Outfit] font-bold text-2xl sm:text-3xl text-[#0F1B2D]">{n}</p>
              <p className="text-[#0F1B2D]/50 text-xs sm:text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="font-[JetBrains_Mono] text-[11px] tracking-widest uppercase text-[#2C5AA0]">Browse</span>
            <h2 className="font-[Outfit] font-bold text-3xl text-[#0F1B2D] mt-1">Find your runway</h2>
          </div>
          <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-[#2C5AA0] text-sm font-semibold hover:underline">
            View all roles <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <button key={cat.name} onClick={() => navigate(`/jobs?category=${cat.name}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] text-left">
              <img src={cat.img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2D] via-[#0F1B2D]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-[Outfit] font-semibold text-white text-base">{cat.name}</p>
                <span className="text-white/60 text-xs font-[JetBrains_Mono]">Explore →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0F1B2D] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="font-[JetBrains_Mono] text-[11px] tracking-widest uppercase text-[#F5A623]">Flight plan</span>
          <h2 className="font-[Outfit] font-bold text-3xl text-white mt-1 mb-14">Three stops to an offer</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative pl-2">
                <span className="font-[JetBrains_Mono] text-5xl font-bold text-white/10">{s.n}</span>
                <h3 className="font-[Outfit] font-semibold text-xl text-white mt-2 mb-3">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 -right-5 w-10 h-px bg-white/15" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <TestimonialSlider />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden">
          <img src="https://picsum.photos/seed/launchpad-cta/1600/700" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1B2D]/95 via-[#0F1B2D]/85 to-[#0F1B2D]/60" />
          <div className="relative p-10 sm:p-14 text-white max-w-xl">
            <h2 className="font-[Outfit] font-bold text-3xl sm:text-4xl mb-3">Ready when you are.</h2>
            <p className="text-white/70 mb-8">Whether you're chasing your first role or hiring your next team member, the board's open.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="px-7 py-3 bg-[#F5A623] text-[#0F1B2D] font-semibold rounded-xl hover:bg-[#ffb84d] transition-colors text-center">
                Find a job
              </Link>
              <Link to="/register?role=employer" className="px-7 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-center">
                Post a job
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0F1B2D]/8 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#0F1B2D]/40 text-sm">
          © 2026 Launchpad. All rights reserved.
        </div>
      </footer>
    </div>
  );
}