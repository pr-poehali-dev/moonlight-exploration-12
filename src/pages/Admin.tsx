import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const STATS_URL = "https://functions.poehali.dev/9e0a6aa4-3469-49f4-91b1-edbb79525caa";
const ACCESS_URL = "https://functions.poehali.dev/482a22c8-30af-4ed7-adcd-92ac972045b7";

interface Stats {
  overview: {
    total_requests: number;
    self_resolved: number;
    api_calls: number;
    unique_sessions: number;
    avg_rating: number;
    autonomy_pct: number;
    knowledge_count: number;
    active_users: number;
    pending_requests: number;
  };
  task_distribution: { type: string; count: number }[];
  daily_trend: { date: string; count: number }[];
}

interface AccessRequest {
  id: number;
  email: string;
  status: string;
  created_at: string;
}

const TASK_LABELS: Record<string, string> = {
  code: "Код", image: "Изображения", music: "Музыка",
  study: "Учёба", search: "Поиск", support: "Техподдержка", chat: "Чат",
};

export default function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "users">("stats");

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(STATS_URL);
      const raw = await res.json();
      setStats(typeof raw === "string" ? JSON.parse(raw) : raw);
    } catch {
      //
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await fetch(ACCESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ action: "list" }),
      });
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setRequests(data.requests || []);
    } catch {
      //
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.length >= 4) {
      setAuthed(true);
      loadStats();
      loadRequests();
    }
  };

  const handleApprove = async (id: number, decision: "approve" | "reject") => {
    try {
      await fetch(ACCESS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify({ action: "approve", request_id: id, decision }),
      });
      loadRequests();
    } catch {
      //
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-border/50 bg-white/[0.02] rounded-sm p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">КИРА Admin</span>
          </div>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Admin ключ..."
              className="bg-transparent font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none border border-border/50 rounded-sm px-4 py-3 focus:border-primary/60 transition-colors"
            />
            <Button type="submit">[Войти]</Button>
          </form>
        </div>
      </div>
    );
  }

  const ov = stats?.overview;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-mono text-sm uppercase tracking-widest">КИРА — Панель управления</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { loadStats(); loadRequests(); }} disabled={loadingStats}>
            <Icon name="RefreshCw" size={14} className={loadingStats ? "animate-spin" : ""} />
          </Button>
          <a href="/">
            <Button size="sm" variant="outline">← Сайт</Button>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border/30">
        {(["stats", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-2 transition-colors border-b-2 -mb-px ${
              activeTab === tab ? "border-primary text-foreground" : "border-transparent text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {tab === "stats" ? "Статистика" : `Заявки ${ov?.pending_requests ? `(${ov.pending_requests})` : ""}`}
          </button>
        ))}
      </div>

      {activeTab === "stats" && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Всего запросов", value: ov?.total_requests ?? 0, icon: "MessageSquare" },
              { label: "Самостоятельно", value: `${ov?.autonomy_pct ?? 0}%`, icon: "Brain" },
              { label: "Активных юзеров", value: ov?.active_users ?? 0, icon: "Users" },
              { label: "База знаний", value: ov?.knowledge_count ?? 0, icon: "Database" },
            ].map((kpi) => (
              <div key={kpi.label} className="border border-border/40 bg-white/[0.02] p-5 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name={kpi.icon} fallback="BarChart2" size={14} className="text-primary/60" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/40">{kpi.label}</span>
                </div>
                <span className="font-mono text-2xl font-bold text-foreground">{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Progress autonomy */}
          <div className="border border-border/40 bg-white/[0.02] p-6 rounded-sm mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-foreground/60">Уровень самостоятельности КИРЫ</span>
              <span className="font-mono text-sm text-primary">{ov?.autonomy_pct ?? 0}%</span>
            </div>
            <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(ov?.autonomy_pct ?? 0, 100)}%` }}
              />
            </div>
            <p className="font-mono text-xs text-foreground/30 mt-2">
              Цель: 60% — {ov?.total_requests ? `ещё ${Math.max(0, Math.ceil((0.6 * ov.total_requests - (ov.self_resolved ?? 0)) / 0.4))} запросов до порога` : "накапливаем данные..."}
            </p>
          </div>

          {/* Task distribution */}
          {stats?.task_distribution && stats.task_distribution.length > 0 && (
            <div className="border border-border/40 bg-white/[0.02] p-6 rounded-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-foreground/40 mb-5">Типы запросов</p>
              <div className="flex flex-col gap-3">
                {stats.task_distribution.map((t) => {
                  const total = stats.task_distribution.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
                  return (
                    <div key={t.type} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-foreground/50 w-24 shrink-0">{TASK_LABELS[t.type] || t.type}</span>
                      <div className="flex-1 h-1 bg-border/20 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-xs text-foreground/40 w-10 text-right">{t.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!ov?.total_requests && (
            <div className="text-center py-12">
              <p className="font-mono text-sm text-foreground/30">Данные появятся после первых запросов к КИРЕ</p>
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <div className="border border-border/40 bg-white/[0.02] rounded-sm overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-mono text-sm text-foreground/30">Заявок пока нет</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  {["Email", "Статус", "Дата", "Действия"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-foreground/30 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                    <td className="font-mono text-sm text-foreground px-5 py-3">{r.email}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-xs uppercase tracking-wider px-2 py-1 rounded-sm border ${
                        r.status === "pending" ? "text-yellow-400/70 border-yellow-400/20 bg-yellow-400/5" :
                        r.status === "approved" ? "text-primary/70 border-primary/20 bg-primary/5" :
                        "text-red-400/70 border-red-400/20 bg-red-400/5"
                      }`}>{r.status}</span>
                    </td>
                    <td className="font-mono text-xs text-foreground/40 px-5 py-3">
                      {new Date(r.created_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-5 py-3">
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(r.id, "approve")}>
                            Одобрить
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(r.id, "reject")}>
                            Отклонить
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
