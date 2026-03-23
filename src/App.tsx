import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { useState, FormEvent } from "react";
import axios from "axios";
import { Plus, Calendar, Trash2, Wallet, Users, ArrowDownCircle, Pencil, LogIn } from "lucide-react";

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
  shuttlecocks_remaining: number;
  expenses: Expense[];
  players: Player[];
  user_id: string;
  user_name?: string;
  user_email?: string;
}

// Helper to format number with thousands separator (.)
const formatCurrency = (val: number | string) => {
  if (val === undefined || val === null || val === "") return "";
  const num = typeof val === "string" ? parseInt(val.replace(/\./g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("id-ID");
};

// Helper to parse formatted string back to number
const parseCurrency = (val: string) => {
  const num = parseInt(val.replace(/\./g, ""), 10);
  return isNaN(num) ? 0 : num;
};

function App() {
  const { isLoaded } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fetching, setFetching] = useState(false);
  const [view, setView] = useState<"landing" | "home">("landing");

  const fetchSessions = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API_URL}/sessions`);
      const sortedSessions = res.data.sort(
        (a: Session, b: Session) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sortedSessions);
    } catch (err) {
      console.error("Gagal mengambil sesi:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleGoToHome = async () => {
    await fetchSessions();
    setView("home");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="glass-card text-center px-12 py-8">
          <p className="animate-pulse" style={{ color: "#d4af37" }}>
            Memuat aplikasi...
          </p>
        </div>
      </div>
    );
  }

  if (view === "landing") {
    return <LandingPage onGoHome={handleGoToHome} fetching={fetching} />;
  }

  return (
    <div className="container mx-auto max-w-full pb-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 px-10 py-4 gap-6 bg-white/5 backdrop-blur-md w-full">
        <div className="flex items-center justify-center gap-4">
          <img src="/SHUTTLECOCK.png" alt="Logo" className="w-20 h-20 -m-8" />
          <div className="flex flex-col items-center justify-center md:items-start md:justify-between">
            <div className="flex justify-center items-center gap-2">
              <h1 className="text-2xl font-bold text-[#cebc17aa]">PB JP GOLD</h1>
              <h2 className="text-xl font-bold text-[#6366f1]">Badminton Tracker</h2>
            </div>
            <p className="text-[#94a3b8]">Pelaporan Bulutangkis Mingguan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 rounded-lg text-sm text-[#94a3b8] hover:text-white transition-colors"
            onClick={() => setView("landing")}
          >
            ← Beranda
          </button>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-primary">
                <LogIn /> Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <SignedOut>
          <p className="text-center text-[#94a3b8] mb-10 bg-yellow-300/10">
            Silahkan Login Untuk Mengedit
          </p>
        </SignedOut>
        <Dashboard sessions={sessions} onRefresh={fetchSessions} />
      </div>
    </div>
  );
}

function LandingPage({
  onGoHome,
  fetching,
}: {
  onGoHome: () => void;
  fetching: boolean;
}) {
  return (
    <div className="landing-page">
      {/* Ambient glow orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="landing-card">
        {/* Logo */}
        <div className="landing-logo-wrap">
          <div className="landing-logo-ring">
            <img
              src="/SHUTTLECOCK.png"
              alt="JP GOLD Logo"
              className="landing-logo"
            />
          </div>
          <span className="gold-badge">⭐ Sistem Pelaporan Resmi</span>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          PB JP <span className="gold-text">GOLD</span>
        </h1>
        <p className="landing-subtitle">Badminton Tracker</p>

        <p className="landing-desc">
          Platform pelaporan sesi bulutangkis mingguan yang elegan. Pantau
          keuangan, kehadiran, dan perkembangan komunitas Anda.
        </p>

        {/* Divider */}
        <div className="gold-divider" />

        {/* Feature pills */}
        <div className="stats-row">
          <div className="stat-pill">
            <span>🏸</span>
            <span>Laporan Sesi</span>
          </div>
          <div className="stat-pill">
            <span>💰</span>
            <span>Keuangan Kas</span>
          </div>
          <div className="stat-pill">
            <span>👥</span>
            <span>Data Pemain</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="landing-cta">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="landing-btn-login">
                <LogIn size={20} />
                Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="landing-signed-in">
              <UserButton afterSignOutUrl="/" />
              <span className="text-sm" style={{ color: "#d4af37" }}>
                Sudah Login
              </span>
            </div>
          </SignedIn>

          <button
            className="landing-btn-history"
            onClick={onGoHome}
            disabled={fetching}
          >
            {fetching ? (
              <>
                <span className="spinner" />
                Memuat...
              </>
            ) : (
              <>
                <Calendar size={20} />
                Riwayat Sesi
              </>
            )}
          </button>
        </div>

        <p className="landing-footer">
          PB JP GOLD &copy; 2025 &middot; Pelaporan Bulutangkis Mingguan
        </p>
      </div>
    </div>
  );
}

function Dashboard({
  sessions,
  onRefresh,
}: {
  sessions: Session[];
  onRefresh: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const { getToken } = useAuth();
  const { user } = useUser();

  const latestSession = sessions[0];
  const latestBalance = latestSession
    ? latestSession.initial_cash -
      latestSession.expenses.reduce((a, c) => a + c.amount, 0) +
      latestSession.players.reduce(
        (a, c) => a + (c.has_paid ? c.contribution_amount : 0),
        0
      )
    : 0;

  const averagePlayers =
    sessions.length > 0
      ? (
          sessions.reduce((acc, s) => acc + s.players.length, 0) /
          sessions.length
        ).toFixed(1)
      : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
    try {
      const token = await getToken();
      await axios.delete(`${API_URL}/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh();
    } catch (err) {
      console.error("Gagal menghapus:", err);
      alert("Gagal menghapus laporan");
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setIsAdding(true);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingSession(null);
  };

  return (
    <div className="space-y-12">
      {!isAdding && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <div className="bg-[#6366f1]/20 p-4 rounded-2xl text-[#6366f1]">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-sm text-[#94a3b8]">Saldo Terkini</p>
              <p className="text-2xl font-bold">
                Rp {latestBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <div className="bg-[#10b981]/20 p-4 rounded-2xl text-[#10b981]">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-[#94a3b8]">Rata-rata Kehadiran</p>
              <p className="text-2xl font-bold">
                {averagePlayers} Pemain/Sesi
              </p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <div className="bg-[#ef4444]/20 p-4 rounded-2xl text-[#ef4444]">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm text-[#94a3b8]">Total Sesi</p>
              <p className="text-2xl font-bold">{sessions.length} Sesi</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">
          {isAdding
            ? editingSession
              ? "Edit Laporan"
              : "Buat Laporan Baru"
            : "Riwayat Sesi"}
        </h2>
        {!isAdding && user && (
          <button
            className="btn btn-primary"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={20} /> Laporan Baru
          </button>
        )}
      </div>

      {isAdding ? (
        <NewSessionForm
          initialData={editingSession || undefined}
          onCancel={handleCancelForm}
          onSaved={() => {
            handleCancelForm();
            onRefresh();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={() => handleDelete(session.id)}
              onEdit={() => handleEdit(session)}
            />
          ))}
          {sessions.length === 0 && (
            <div className="glass-card col-span-full text-center py-20">
              <p className="text-lg text-[#94a3b8]">
                Belum ada laporan.{" "}
                {user
                  ? "Buat laporan pertama Anda!"
                  : "Silakan login untuk membuat laporan."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  onEdit,
}: {
  session: Session;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { user } = useUser();
  const expensesTotal = session.expenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const incomeTotal = session.players.reduce(
    (acc, curr) => acc + (curr.has_paid ? curr.contribution_amount : 0),
    0
  );
  const sisa = session.initial_cash - expensesTotal;
  const kasAkhir = sisa + incomeTotal;
  const isOwner = user?.id === session.user_id;

  const formattedDate = new Date(session.date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-card relative group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 text-[#6366f1]">
          <Calendar size={18} />
          <span className="text-sm font-bold">{formattedDate}</span>
        </div>
        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-[#94a3b8] hover:text-white transition-colors"
              title="Edit Sesi"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-[#94a3b8] hover:text-rose-500 transition-colors"
              title="Hapus Sesi"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {(session.user_name || session.user_email) && (
        <div className="text-[10px] text-[#94a3b8] mb-6 flex items-center gap-2">
          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">
            Oleh: {session.user_name}
          </span>
        </div>
      )}

      <div className="space-y-3">
        <StatRow
          label="Uang Kas Awal"
          value={`Rp ${session.initial_cash.toLocaleString()}`}
        />

        <div className="space-y-2">
          <StatRow
            label="Total Pengeluaran"
            value={`Rp ${expensesTotal.toLocaleString()}`}
            color="text-rose-400"
          />
          {session.expenses.length > 0 && (
            <div className="pl-4 border-l border-rose-500/20 space-y-1">
              {session.expenses.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-[11px] text-[#94a3b8]"
                >
                  <span>• {exp.name}</span>
                  <span>Rp {exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <StatRow label="Sisa Kas" value={`Rp ${sisa.toLocaleString()}`} />
        <StatRow
          label="Total Iuran"
          value={`Rp ${incomeTotal.toLocaleString()}`}
          color="text-[#10b981]"
        />

        <div className="h-px bg-white/10 my-2" />

        <StatRow
          label="Saldo Akhir"
          value={`Rp ${kasAkhir.toLocaleString()}`}
          weight="font-bold"
          size="text-xl"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold flex items-center gap-2">
            <Users size={16} /> Pemain ({session.players.length})
          </p>
          {session.shuttlecocks_remaining !== null && (
            <span className="text-[10px] text-[#94a3b8] font-medium italic">
              Sisa Kok: {session.shuttlecocks_remaining}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {session.players.map((p) => (
            <span
              key={p.id}
              className={`badge ${p.has_paid ? "badge-paid" : "badge-unpaid"}`}
              title={p.has_paid ? "Sudah Bayar" : "Belum Bayar"}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  color?: string;
  weight?: string;
  size?: string;
}

function StatRow({ label, value, color, weight, size }: StatRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-[#94a3b8]">{label}</span>
      <span
        className={`${color || "text-white"} ${weight || "font-semibold"} ${
          size || "text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function NewSessionForm({
  initialData,
  onCancel,
  onSaved,
}: {
  initialData?: Session;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [date, setDate] = useState(
    initialData
      ? initialData.date.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [cash, setCash] = useState(initialData ? initialData.initial_cash : 0);
  const [shuttlecocks, setShuttlecocks] = useState(
    initialData ? initialData.shuttlecocks_remaining : 8
  );
  const [expenseList, setExpenseList] = useState<Omit<Expense, "id">[]>(
    initialData ? initialData.expenses : []
  );
  const [playerList, setPlayerList] = useState<Omit<Player, "id">[]>(
    initialData ? initialData.players : []
  );
  const [submitting, setSubmitting] = useState(false);

  const [newExpName, setNewExpName] = useState("");
  const [newExpAmount, setNewExpAmount] = useState(0);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAmount, setNewPlayerAmount] = useState(20000);
  const [newPlayerPaid, setNewPlayerPaid] = useState(true);

  const addExpense = () => {
    if (newExpName && newExpAmount > 0) {
      setExpenseList([
        ...expenseList,
        { name: newExpName, amount: newExpAmount },
      ]);
      setNewExpName("");
      setNewExpAmount(0);
    }
  };

  const removeExpense = (index: number) => {
    setExpenseList(expenseList.filter((_, i) => i !== index));
  };

  const addPlayer = () => {
    if (newPlayerName) {
      setPlayerList([
        ...playerList,
        {
          name: newPlayerName,
          contribution_amount: newPlayerAmount,
          has_paid: newPlayerPaid,
        },
      ]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayerList(playerList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      const payload = {
        date,
        initial_cash: cash,
        shuttlecocks_remaining: shuttlecocks,
        expenses: expenseList,
        players: playerList,
        user_name: user?.fullName || user?.username || user?.firstName,
        user_email: user?.primaryEmailAddress?.emailAddress,
      };

      if (initialData) {
        await axios.put(`${API_URL}/sessions/${initialData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/sessions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSaved();
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert(`Gagal ${initialData ? "memperbarui" : "menyimpan"} laporan`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Tanggal Sesi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-[#334155] border border-[#475569] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Saldo Awal Kas (Rp)
            </label>
            <input
              type="text"
              value={formatCurrency(cash)}
              onChange={(e) => setCash(parseCurrency(e.target.value))}
              required
              placeholder="Contoh: 50.000"
              className="w-full bg-[#334155] border border-[#475569] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Sisa Kok (Biji)
            </label>
            <input
              type="number"
              value={shuttlecocks}
              onChange={(e) => setShuttlecocks(Number(e.target.value))}
              className="w-full bg-[#334155] border border-[#475569] rounded-lg p-3 text-white focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Expenses Column */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <h4 className="flex items-center gap-2 text-lg font-bold mb-6 text-rose-400">
              <ArrowDownCircle size={20} /> Pengeluaran
            </h4>
            <div className="space-y-4 mb-8">
              <input
                type="text"
                placeholder="Nama barang (misal: Kok, Sewa Lapangan)"
                value={newExpName}
                onChange={(e) => setNewExpName(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#475569] rounded-lg p-3 text-white focus:ring-1 focus:ring-rose-400/50 outline-none transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nominal Rp"
                  value={formatCurrency(newExpAmount)}
                  onChange={(e) =>
                    setNewExpAmount(parseCurrency(e.target.value))
                  }
                  className="flex-1 bg-[#1e293b] border border-[#475569] rounded-lg p-3 text-white focus:ring-1 focus:ring-rose-400/50 outline-none transition-all"
                />
                <button
                  type="button"
                  className="btn bg-[#6366f1] hover:bg-[#4f46e5] h-[50px] w-[50px] !p-0 justify-center rounded-xl transition-all"
                  onClick={addExpense}
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {expenseList.map((exp, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-sm tracking-tight">
                      {exp.name}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      Rp {exp.amount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExpense(i)}
                    className="p-2 text-rose-400 opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {expenseList.length === 0 && (
                <p className="text-center py-4 text-[#94a3b8] text-xs italic">
                  Belum ada pengeluaran ditambahkan
                </p>
              )}
            </div>
          </div>

          {/* Players Column */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
            <h4 className="flex items-center gap-2 text-lg font-bold mb-6 text-[#10b981]">
              <Users size={20} /> Daftar Pemain
            </h4>
            <div className="space-y-4 mb-8">
              <input
                type="text"
                placeholder="Nama Pemain"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full bg-[#1e293b] border border-[#475569] rounded-lg p-3 text-white focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Iuran Rp"
                  value={formatCurrency(newPlayerAmount)}
                  onChange={(e) =>
                    setNewPlayerAmount(parseCurrency(e.target.value))
                  }
                  className="flex-1 bg-[#1e293b] border border-[#475569] rounded-lg p-3 text-white focus:ring-1 focus:ring-[#10b981]/50 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setNewPlayerPaid(!newPlayerPaid)}
                  className={`btn h-[50px] min-w-[80px] text-xs font-bold rounded-xl transition-all ${
                    newPlayerPaid ? "badge-paid" : "badge-unpaid"
                  }`}
                >
                  {newPlayerPaid ? "Lunas" : "Belum"}
                </button>
                <button
                  type="button"
                  className="btn bg-[#6366f1] hover:bg-[#4f46e5] h-[50px] w-[50px] !p-0 justify-center rounded-xl transition-all"
                  onClick={addPlayer}
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {playerList.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-sm tracking-tight">{p.name}</p>
                    <p className="text-xs text-[#94a3b8]">
                      Rp {p.contribution_amount.toLocaleString()} &bull;{" "}
                      {p.has_paid ? "Lunas" : "Belum Bayar"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlayer(i)}
                    className="p-2 text-rose-400 opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {playerList.length === 0 && (
                <p className="text-center py-4 text-[#94a3b8] text-xs italic">
                  Belum ada pemain ditambahkan
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-8 border-t border-white/10">
          <button
            type="button"
            className="px-8 py-3 rounded-lg font-bold text-white bg-white/5 hover:bg-white/10 transition-all outline-none"
            onClick={onCancel}
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn-primary px-10 shadow-lg shadow-[#6366f1]/20"
            disabled={submitting}
          >
            {submitting
              ? "Menyimpan..."
              : initialData
              ? "Update Laporan"
              : "Simpan Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
