import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { useState, FormEvent, useEffect, useMemo } from "react";
import axios from "axios";
import { Plus, Calendar, Trash2, Wallet, Users, ArrowDownCircle, Pencil, LogIn, LayoutDashboard, Menu, X, MapPin, Clock, DollarSign, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Expense {
  id?: string;
  name: string;
  amount: number;
}

interface Player {
  id?: string;
  name: string;
  contribution_amount: number;
  has_paid: boolean;
}

interface Session {
  id: string;
  date: string;
  initial_cash: number;
  shuttlecocks_initial?: number;
  shuttlecocks_remaining: number;
  shuttlecocks_brands?: string;
  expenses: Expense[];
  players: Player[];
  user_id: string;
  user_name?: string;
  user_email?: string;
}

const formatCurrency = (val: number | string) => {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "string" ? parseInt(val.replace(/\./g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

const parseCurrency = (val: string) => {
  const num = parseInt(val.replace(/\./g, ""), 10);
  return isNaN(num) ? 0 : num;
};

const parseKokList = (brandsStr?: string, initial?: number, remaining?: number) => {
  const genId = () => Math.random().toString(36).substr(2, 9);
  if (!brandsStr) return [{ id: genId(), brand: "Unknown", initial: initial || 0, remaining: remaining || 0 }];
  try {
    const parsed = JSON.parse(brandsStr);
    if (Array.isArray(parsed)) return parsed.map(p => ({ ...p, id: genId() }));
  } catch {
    // Legacy format (comma separated or single string)
  }
  return [{ id: genId(), brand: brandsStr, initial: initial || 0, remaining: remaining || 0 }];
};

export default function App() {
  useUser();
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "sessions" | "detail" | "form">("dashboard");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateTo = (newView: "dashboard" | "sessions" | "detail" | "form") => {
    setView(newView);
    setTimeout(() => {
      document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/sessions`);
      const sortedSessions = res.data.sort(
        (a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
    } catch (err) {
      console.error("Gagal mengambil sesi:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const lastBalance = useMemo(() => {
    if (sessions.length === 0) return 0;
    const s = sessions[0];
    const expensesTotal = s.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const incomeTotal = s.players.reduce((acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0), 0);
    return s.initial_cash - expensesTotal + incomeTotal;
  }, [sessions]);

  if (initialLoading) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-full bg-[#060609] text-slate-200 overflow-hidden font-inter selection:bg-indigo-500/30">

      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/SHUTTLECOCK.png" alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-[#cebc17aa]">JP GOLD</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-screen 
        w-full md:w-64 z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        p-4 md:p-6 flex flex-col gap-6
      `}>
        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 flex flex-col shadow-2xl">
          <div className="hidden md:flex items-center gap-3 mb-8 px-2 mt-2">
            <img src="/SHUTTLECOCK.png" alt="Logo" className="w-12 h-12" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#cebc17aa] leading-none">PB JP GOLD</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">Badminton</span>
            </div>
          </div>

          <nav className="flex flex-col gap-2 flex-1 mt-4 md:mt-0">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === "dashboard"} onClick={() => { navigateTo("dashboard"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={<Calendar size={20} />} label="Semua Sesi" active={view === "sessions" || view === "detail"} onClick={() => { navigateTo("sessions"); setIsMobileMenuOpen(false); }} />

            <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</div>
            <SidebarItem icon={<Plus size={20} />} label="Buat Laporan" active={view === "form"} onClick={() => { setSelectedSession(null); navigateTo("form"); setIsMobileMenuOpen(false); }} variant="primary" />
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex w-full items-center justify-center gap-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 py-2.5 rounded-xl text-sm font-semibold transition-all">
                  <LogIn size={16} /> Login Akun
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3 px-2 py-2 bg-white/5 rounded-xl border border-white/5">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm font-medium text-slate-300">Akun Saya</span>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main id="main-scroll-container" className="flex-1 h-screen overflow-y-auto overflow-x-hidden p-4 md:p-8 pt-20 md:pt-8 scroll-smooth">
        <div className="max-w-6xl mx-auto pb-20">
          {view === "dashboard" && (
            <DashboardView 
              sessions={sessions} 
              lastBalance={lastBalance}
            />
          )}
          {view === "sessions" && (
            <SessionsListView
              sessions={sessions}
              onViewSession={(s) => { setSelectedSession(s); navigateTo("detail"); }}
            />
          )}
          {view === "detail" && selectedSession && (
            <SessionDetailView
              session={selectedSession}
              onBack={() => navigateTo("sessions")}
              onEdit={() => navigateTo("form")}
              onDelete={async () => {
                if (confirm("Hapus laporan ini?")) {
                  try {
                    const token = await getToken();
                    await axios.delete(`${API_URL}/sessions/${selectedSession.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    await fetchSessions();
                    navigateTo("sessions");
                  } catch (e) { alert("Gagal menghapus"); }
                }
              }}
            />
          )}
          {view === "form" && (
            <NewSessionForm
              initialData={selectedSession || undefined}
              initialCashDefault={lastBalance}
              lastSession={sessions[0]}
              onCancel={() => {
                navigateTo("sessions");
              }}
              onSaved={async () => {
                await fetchSessions();
                navigateTo("sessions");
              }}
            />
          )}
        </div>
      </main>

    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, variant = "default" }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, variant?: "default" | "primary" }) {
  if (variant === "primary") {
    return (
      <button onClick={onClick} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 w-full text-left bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
        {icon} <span className="font-semibold text-sm">{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all w-full text-left text-sm font-medium
        ${active ? "bg-white/10 text-white shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
    >
      <div className={`${active ? "text-indigo-400" : ""}`}>{icon}</div>
      {label}
    </button>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#060609]">
      <div className="relative w-32 h-32 flex items-end justify-center mb-8">
        <img src="/SHUTTLECOCK.png" className="absolute inset-0 w-32 h-32 object-cover grayscale opacity-20" />
        <div className="absolute bottom-0 w-32 animate-fillUp overflow-hidden flex items-end">
          <img src="/SHUTTLECOCK.png" className="w-32 h-32 max-w-none object-cover object-bottom" style={{ objectPosition: 'bottom' }} />
        </div>
      </div>
      <h2 className="text-xl font-bold text-[#cebc17aa] font-outfit tracking-widest uppercase">Memuat Data...</h2>
      <p className="text-slate-500 text-sm mt-2">Menyiapkan Dashboard PB JP GOLD</p>
    </div>
  );
}

// ==========================================
// VIEWS
// ==========================================

function DashboardView({ sessions, lastBalance }: { sessions: Session[], lastBalance: number }) {
  const stats = useMemo(() => {
    let totalPlayers = 0;
    let totalSisaKok = 0;
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    let totalSessionsWithKok = 0;

    sessions.forEach(s => {
      totalPlayers += s.players.length;
      if (s.shuttlecocks_remaining !== null && s.shuttlecocks_remaining !== undefined) {
        totalSisaKok += s.shuttlecocks_remaining;
        totalSessionsWithKok++;
      }
      totalPengeluaran += s.expenses.reduce((acc, curr) => acc + curr.amount, 0);
      totalPemasukan += s.players.reduce((acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0), 0);
    });

    const len = sessions.length || 1;
    return {
      avgPlayers: (totalPlayers / len).toFixed(1),
      avgSisaKok: totalSessionsWithKok ? (totalSisaKok / totalSessionsWithKok).toFixed(1) : "0",
      avgPemasukan: totalPemasukan / len,
      avgPengeluaran: totalPengeluaran / len,
    };
  }, [sessions]);

  const chartData = useMemo(() => {
    return [...sessions].reverse().slice(-10).map(s => {
      const expensesTotal = s.expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const incomeTotal = s.players.reduce((acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0), 0);
      const balance = s.initial_cash - expensesTotal + incomeTotal;
      return {
        name: new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        Pemasukan: incomeTotal,
        Pengeluaran: expensesTotal,
        Saldo: balance
      };
    });
  }, [sessions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Statistik</h1>
          <p className="text-slate-400">Ringkasan aktivitas dan keuangan PB JP GOLD.</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-emerald-500/5 w-full md:w-auto">
          <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-xs text-emerald-400/80 uppercase font-bold tracking-wider mb-1">Saldo Kas Terkini</p>
            <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Rp {lastBalance.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card !p-5 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400"><MapPin size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Lokasi Member GOR Saat Ini</p>
            <p className="text-base font-bold">GOR Pakuhaji Balaraja</p>
          </div>
        </div>
        <div className="glass-card !p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="bg-amber-500/20 p-3 rounded-xl text-amber-400"><Clock size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Jadwal Sesi</p>
            <p className="text-base font-bold">18:00 - 20:00 WIB</p>
          </div>
        </div>
        <div className="glass-card !p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Harga Iuran</p>
            <p className="text-base font-bold">Rp 20.000 / Sesi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Rata-rata Pemain" value={`${stats.avgPlayers} Org/Sesi`} icon={<Users />} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard title="Rata-rata Sisa Kok" value={`${stats.avgSisaKok} Biji/Sesi`} icon={<Circle />} color="text-pink-400" bg="bg-pink-400/10" />
        <StatCard title="Rata Pemasukan" value={`Rp ${stats.avgPemasukan.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} icon={<Wallet />} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard title="Rata Pengeluaran" value={`Rp ${stats.avgPengeluaran.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`} icon={<ArrowDownCircle />} color="text-rose-400" bg="bg-rose-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Wallet size={20} className="text-emerald-400" /> Arus Kas (Pemasukan vs Pengeluaran)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Wallet size={20} className="text-indigo-400" /> Tren Saldo Kas</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Line type="monotone" dataKey="Saldo" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionsListView({ sessions, onViewSession }: { sessions: Session[], onViewSession: (s: Session) => void }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Riwayat Sesi</h1>
        <p className="text-slate-400">Daftar semua kegiatan bulutangkis sebelumnya.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Belum ada sesi tercatat.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map((s) => {
              const expensesTotal = s.expenses.reduce((acc, curr) => acc + curr.amount, 0);
              const incomeTotal = s.players.reduce((acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0), 0);
              const kasAkhir = s.initial_cash - expensesTotal + incomeTotal;

              return (
                <div key={s.id} onClick={() => onViewSession(s)} className="p-5 hover:bg-white/10 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-xl border border-indigo-500/20">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                        {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">{s.players.length} Pemain &bull; {s.expenses.length} Pengeluaran</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Saldo Akhir Sesi</p>
                      <p className="font-bold text-emerald-400 text-lg">
                        Rp {kasAkhir.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionDetailView({ session, onBack, onEdit, onDelete }: { session: Session, onBack: () => void, onEdit: () => void, onDelete: () => void }) {
  const { user } = useUser();
  const isOwner = user?.id === session.user_id;

  const expensesTotal = session.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const incomeTotal = session.players.reduce((acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0), 0);
  const sisa = session.initial_cash - expensesTotal;
  const kasAkhir = sisa + incomeTotal;

  const parsedKok = useMemo(() => {
    return parseKokList(session.shuttlecocks_brands, session.shuttlecocks_initial, session.shuttlecocks_remaining);
  }, [session]);

  const kokAwal = session.shuttlecocks_initial || 0;
  const kokSisa = session.shuttlecocks_remaining || 0;
  const kokTerpakai = kokAwal > 0 ? (kokAwal - kokSisa) : null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
      <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
        ← Kembali
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Sesi</h1>
          <p className="text-indigo-400 font-medium">{new Date(session.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <button onClick={onEdit} className="btn bg-white/10 hover:bg-white/20 text-white !py-2 !px-4 text-sm"><Pencil size={16} /> Edit</button>
            <button onClick={onDelete} className="btn bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 !py-2 !px-4 text-sm"><Trash2 size={16} /> Hapus</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keuangan Card */}
        <div className="glass-card space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3"><Wallet className="text-emerald-400" /> Laporan Keuangan</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Saldo Kas Awal</span><span className="font-bold">Rp {session.initial_cash.toLocaleString('id-ID')}</span></div>

            <div className="bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
              <div className="flex justify-between items-center mb-2"><span className="text-rose-400 font-bold text-sm">Total Pengeluaran</span><span className="font-bold text-rose-400">Rp {expensesTotal.toLocaleString('id-ID')}</span></div>
              <div className="space-y-1">
                {session.expenses.map((e, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-300 pl-2 border-l border-rose-500/20">
                    <span>{e.name}</span><span>Rp {e.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center"><span className="text-slate-400 text-sm">Sisa Kas Sementara</span><span className="font-medium">Rp {sisa.toLocaleString('id-ID')}</span></div>
            <div className="flex justify-between items-center"><span className="text-emerald-400 font-bold text-sm">Total Iuran Pemain</span><span className="font-bold text-emerald-400">+ Rp {incomeTotal.toLocaleString('id-ID')}</span></div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="font-bold text-white">Saldo Akhir</span>
              <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Rp {kasAkhir.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Players Card */}
        <div className="glass-card h-fit">
          <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 mb-4"><Users className="text-blue-400" /> Daftar Pemain ({session.players.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {session.players.map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-white">{p.name}</p>
                  <p className="text-xs font-medium text-slate-400">Rp {p.contribution_amount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  {p.has_paid ?
                    <CheckCircle2 className="text-emerald-500" size={20} /> :
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md border border-rose-400/20 uppercase">Belum</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kok Card */}
      <div className="glass-card">
        <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-3 mb-4"><Circle className="text-pink-400" /> Rincian Shuttlecock</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-3 font-semibold uppercase text-xs">Merk Kok</th>
                <th className="pb-3 font-semibold uppercase text-xs text-center">Jumlah Awal</th>
                <th className="pb-3 font-semibold uppercase text-xs text-center">Sisa Akhir</th>
                <th className="pb-3 font-semibold uppercase text-xs text-right">Terpakai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {parsedKok.map((k, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-amber-200">{k.brand}</td>
                  <td className="py-3 text-center">{k.initial}</td>
                  <td className="py-3 text-center">{k.remaining}</td>
                  <td className="py-3 text-right font-bold text-pink-400">{k.initial - k.remaining} Biji</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 font-bold">
                <td className="pt-3 text-slate-300">TOTAL KESELURUHAN</td>
                <td className="pt-3 text-center text-slate-300">{kokAwal}</td>
                <td className="pt-3 text-center text-slate-300">{kokSisa}</td>
                <td className="pt-3 text-right text-indigo-400 text-base">{kokTerpakai !== null ? kokTerpakai : "-"} Biji</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="glass-card !p-4 flex flex-col justify-center">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 font-semibold uppercase">{title}</p>
      <p className="text-lg md:text-xl font-bold mt-1 text-white">{value}</p>
    </div>
  );
}

function NewSessionForm({ initialData, initialCashDefault, lastSession, onCancel, onSaved }: any) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [date, setDate] = useState(initialData ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
  const [cash, setCash] = useState(initialData ? initialData.initial_cash : initialCashDefault);

  const initialKokState = useMemo(() => {
    const genId = () => Math.random().toString(36).substr(2, 9);
    if (initialData) return parseKokList(initialData.shuttlecocks_brands, initialData.shuttlecocks_initial, initialData.shuttlecocks_remaining);

    if (!lastSession) return [{ id: genId(), brand: "Unknown", initial: 12, remaining: 0 }];

    const parsed = parseKokList(lastSession.shuttlecocks_brands, lastSession.shuttlecocks_initial, lastSession.shuttlecocks_remaining);
    const carryOver = parsed.filter(p => p.remaining > 0).map(p => ({
      id: genId(),
      brand: p.brand,
      initial: p.remaining,
      remaining: 0
    }));

    if (carryOver.length === 0) {
      carryOver.push({ id: genId(), brand: "Unknown", initial: 12, remaining: 0 });
    }
    return carryOver;
  }, [initialData, lastSession]);

  const [kokList, setKokList] = useState(initialKokState);

  const [expenseList, setExpenseList] = useState<Omit<Expense, "id">[]>(initialData ? initialData.expenses : []);
  const [playerList, setPlayerList] = useState<Omit<Player, "id">[]>(initialData ? initialData.players : []);
  const [submitting, setSubmitting] = useState(false);

  const [newExpName, setNewExpName] = useState("");
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAmount, setNewPlayerAmount] = useState(20000);
  const [newPlayerPaid, setNewPlayerPaid] = useState(true);

  const updateKok = (id: string, field: string, value: string) => {
    setKokList(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k));
  };
  const removeKok = (id: string) => {
    setKokList(prev => prev.filter(k => k.id !== id));
  };
  const addKok = () => {
    setKokList(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), brand: "Unknown", initial: 12, remaining: 0 }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();

      const totalInitial = kokList.reduce((acc, curr) => acc + (Number(curr.initial) || 0), 0);
      const totalRemaining = kokList.reduce((acc, curr) => acc + (Number(curr.remaining) || 0), 0);
      const brandsJson = JSON.stringify(kokList.map(k => ({ brand: k.brand || "", initial: Number(k.initial) || 0, remaining: Number(k.remaining) || 0 })));

      const payload = {
        date,
        initial_cash: cash,
        shuttlecocks_initial: totalInitial,
        shuttlecocks_remaining: totalRemaining,
        shuttlecocks_brands: brandsJson,
        expenses: expenseList,
        players: playerList,
        user_name: user?.fullName || user?.username || user?.firstName,
        user_email: user?.primaryEmailAddress?.emailAddress,
      };

      if (initialData) {
        await axios.put(`${API_URL}/sessions/${initialData.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/sessions`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSaved();
    } catch (err) {
      alert("Gagal menyimpan laporan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card animate-in slide-in-from-bottom-8 duration-300">
      <h2 className="text-2xl font-bold mb-6">{initialData ? "Edit Laporan" : "Buat Laporan Baru"}</h2>
      <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tanggal Sesi</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Kas Terakhir (Awal Kas)</label>
            <input type="text" value={formatCurrency(cash)} onChange={(e) => setCash(parseCurrency(e.target.value))} required className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>

        {/* Section Kok Multi-input */}
        <div className="bg-pink-500/5 p-4 rounded-2xl border border-pink-500/10">
          <div className="flex justify-between items-center mb-4">
            <h4 className="flex items-center gap-2 text-lg font-bold text-pink-400"><Circle size={20} /> Data Shuttlecock</h4>
            <button type="button" onClick={addKok} className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 px-3 py-1.5 rounded-lg font-bold hover:bg-pink-500 hover:text-white transition-colors">+ Tambah Kok</button>
          </div>
          <div className="space-y-3">
            {kokList.map((k) => (
              <div key={k.id} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex-1 space-y-1 min-w-[120px]">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Merk</label>
                  <input type="text" value={k.brand} onChange={(e) => updateKok(k.id, "brand", e.target.value)} className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-pink-500 outline-none" />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Awal</label>
                  <input type="number" value={k.initial} onChange={(e) => updateKok(k.id, "initial", e.target.value)} className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-pink-500 outline-none" />
                </div>
                <div className="w-20 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Sisa</label>
                  <input type="number" value={k.remaining} onChange={(e) => updateKok(k.id, "remaining", e.target.value)} className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-pink-500 outline-none" />
                </div>
                {kokList.length > 1 && (
                  <button type="button" onClick={() => removeKok(k.id)} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg h-[38px] transition-colors"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pengeluaran */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <h4 className="flex items-center gap-2 text-lg font-bold mb-4 text-rose-400"><ArrowDownCircle size={20} /> Pengeluaran</h4>
            <div className="flex gap-2 mb-4 flex-wrap">
              <input type="text" placeholder="Nama (Mis: Sewa)" value={newExpName} onChange={(e) => setNewExpName(e.target.value)} className="flex-1 min-w-[120px] bg-[#1e293b] border border-slate-700 rounded-xl p-2 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" />
              <input type="text" placeholder="Rp" value={formatCurrency(newExpAmount)} onChange={(e) => setNewExpAmount(parseCurrency(e.target.value))} className="w-24 bg-[#1e293b] border border-slate-700 rounded-xl p-2 text-sm text-white focus:ring-1 focus:ring-rose-500 outline-none" />
              <button type="button" onClick={() => { if (newExpName) { setExpenseList([...expenseList, { name: newExpName, amount: newExpAmount }]); setNewExpName(""); setNewExpAmount(0); } }} className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {expenseList.map((e, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5 text-sm">
                  <span>{e.name} <span className="text-xs text-slate-400">Rp {e.amount.toLocaleString()}</span></span>
                  <button type="button" onClick={() => setExpenseList(expenseList.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-300"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Pemain */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <h4 className="flex items-center gap-2 text-lg font-bold mb-4 text-emerald-400"><Users size={20} /> Pemain</h4>
            <div className="flex gap-2 mb-4 flex-wrap">
              <input type="text" placeholder="Nama" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="flex-1 min-w-[100px] bg-[#1e293b] border border-slate-700 rounded-xl p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
              <input type="text" placeholder="Rp" value={formatCurrency(newPlayerAmount)} onChange={(e) => setNewPlayerAmount(parseCurrency(e.target.value))} className="w-24 bg-[#1e293b] border border-slate-700 rounded-xl p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
              <button type="button" onClick={() => setNewPlayerPaid(!newPlayerPaid)} className={`px-2 py-2 rounded-xl text-xs font-bold border ${newPlayerPaid ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>{newPlayerPaid ? "Lunas" : "Belum"}</button>
              <button type="button" onClick={() => { if (newPlayerName) { setPlayerList([...playerList, { name: newPlayerName, contribution_amount: newPlayerAmount, has_paid: newPlayerPaid }]); setNewPlayerName(""); } }} className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {playerList.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5 text-sm">
                  <span>{p.name} <span className="text-xs text-slate-400">Rp {p.contribution_amount.toLocaleString()}</span></span>
                  <div className="flex items-center gap-2">
                    {p.has_paid ? <span className="text-[10px] text-emerald-400">Lunas</span> : <span className="text-[10px] text-rose-400">Belum</span>}
                    <button type="button" onClick={() => setPlayerList(playerList.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-300"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-xl font-semibold bg-white/10 hover:bg-white/20 transition-colors">Batal</button>
          <button type="submit" disabled={submitting} className="px-8 py-2 rounded-xl font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all">
            {submitting ? "Menyimpan..." : "Simpan Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}
