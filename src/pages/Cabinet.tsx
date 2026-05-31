import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useKiraHistory, type HistorySession } from "@/hooks/useKiraHistory";

const TASK_LABELS: Record<string, string> = {
  code: "Код", image: "Изображение", music: "Музыка",
  study: "Учёба", search: "Поиск", support: "Техподдержка", chat: "Чат",
};

const TASK_COLORS: Record<string, string> = {
  code: "text-blue-400/70 border-blue-400/20 bg-blue-400/5",
  image: "text-pink-400/70 border-pink-400/20 bg-pink-400/5",
  music: "text-orange-400/70 border-orange-400/20 bg-orange-400/5",
  study: "text-green-400/70 border-green-400/20 bg-green-400/5",
  search: "text-cyan-400/70 border-cyan-400/20 bg-cyan-400/5",
  support: "text-yellow-400/70 border-yellow-400/20 bg-yellow-400/5",
  chat: "text-primary/70 border-primary/20 bg-primary/5",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function getSessionTaskType(session: HistorySession): string {
  const kiraMsg = session.messages.find((m) => m.role === "kira" && m.taskType);
  return kiraMsg?.taskType || "chat";
}

export default function Cabinet() {
  const { sessions, deleteSession, clearHistory } = useKiraHistory();
  const [selected, setSelected] = useState<HistorySession | null>(null);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.messages.some((m) => m.text.toLowerCase().includes(search.toLowerCase()))
  );

  const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
  const taskCounts = sessions.reduce<Record<string, number>>((acc, s) => {
    const t = getSessionTaskType(s);
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const topTask = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/30 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="text-foreground/40 hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={16} />
          </a>
          <div className="w-px h-4 bg-border/50" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-mono text-sm uppercase tracking-widest">Личный кабинет</span>
          </div>
        </div>
        <a href="/#demo">
          <Button size="sm">
            <Icon name="MessageSquare" size={14} className="mr-2" />
            Новый диалог
          </Button>
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {sessions.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Icon name="MessageSquare" size={28} className="text-primary/50" />
            </div>
            <h2 className="font-sentient text-3xl mb-3">История пуста</h2>
            <p className="font-mono text-sm text-foreground/40 mb-8 max-w-xs">
              Начните диалог с КИРОЙ — все сообщения будут сохранены здесь автоматически
            </p>
            <a href="/#demo">
              <Button>[Начать диалог с КИРОЙ]</Button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Left: session list */}
            <div className="flex flex-col gap-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Диалогов", value: sessions.length },
                  { label: "Сообщений", value: totalMessages },
                  { label: "Тема #1", value: topTask ? (TASK_LABELS[topTask[0]] || topTask[0]) : "—" },
                ].map((s) => (
                  <div key={s.label} className="border border-border/40 bg-white/[0.02] rounded-sm p-3 text-center">
                    <div className="font-mono text-base font-bold text-foreground">{s.value}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-foreground/30 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по истории..."
                  className="w-full bg-transparent font-mono text-xs text-foreground placeholder:text-foreground/30 outline-none border border-border/40 rounded-sm pl-8 pr-4 py-2.5 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Session list */}
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.length === 0 && (
                  <p className="font-mono text-xs text-foreground/30 text-center py-6">Ничего не найдено</p>
                )}
                {filtered.map((session) => {
                  const taskType = getSessionTaskType(session);
                  const isActive = selected?.id === session.id;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelected(session)}
                      className={`text-left border rounded-sm p-4 transition-all duration-150 group ${
                        isActive
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/30 bg-white/[0.01] hover:border-border/60 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`font-mono text-[9px] uppercase tracking-wider border px-1.5 py-0.5 rounded-sm shrink-0 ${TASK_COLORS[taskType] || TASK_COLORS.chat}`}>
                          {TASK_LABELS[taskType] || taskType}
                        </span>
                        <span className="font-mono text-[10px] text-foreground/30 shrink-0">{formatTime(session.startedAt)}</span>
                      </div>
                      <p className="font-mono text-xs text-foreground/80 leading-relaxed line-clamp-2">{session.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-mono text-[10px] text-foreground/30">{formatDate(session.startedAt)}</span>
                        <span className="font-mono text-[10px] text-foreground/30">{session.messages.length} сообщ.</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clear all */}
              <div className="mt-auto pt-2">
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="font-mono text-[10px] uppercase tracking-wider text-foreground/20 hover:text-red-400/60 transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="Trash2" size={11} />
                    Очистить всю историю
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-foreground/40">Уверены?</span>
                    <button onClick={() => { clearHistory(); setSelected(null); setConfirmClear(false); }}
                      className="font-mono text-[10px] text-red-400/70 hover:text-red-400 transition-colors underline">Да, удалить</button>
                    <button onClick={() => setConfirmClear(false)}
                      className="font-mono text-[10px] text-foreground/30 hover:text-foreground/60 transition-colors underline">Отмена</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: selected session */}
            <div className="border border-border/40 bg-white/[0.01] rounded-sm overflow-hidden flex flex-col">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <Icon name="ArrowLeft" size={24} className="text-foreground/20 mb-4" />
                  <p className="font-mono text-sm text-foreground/30">Выберите диалог из списка</p>
                </div>
              ) : (
                <>
                  {/* Session header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                    <div>
                      <p className="font-mono text-xs text-foreground/80 font-medium">{selected.title}</p>
                      <p className="font-mono text-[10px] text-foreground/30 mt-0.5">
                        {formatDate(selected.startedAt)} · {formatTime(selected.startedAt)} · {selected.messages.length} сообщений
                      </p>
                    </div>
                    <button
                      onClick={() => { deleteSession(selected.id); setSelected(null); }}
                      className="text-foreground/20 hover:text-red-400/60 transition-colors p-1"
                      title="Удалить диалог"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3 max-h-[70vh]">
                    {selected.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-3 font-mono text-xs leading-relaxed rounded-sm ${
                          msg.role === "kira"
                            ? "bg-primary/10 border border-primary/20 text-foreground/90"
                            : "bg-white/[0.05] border border-border/40 text-foreground/70"
                        }`}>
                          {msg.role === "kira" && (
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-primary font-semibold uppercase tracking-wider text-[10px]">КИРА</span>
                              {msg.taskType && msg.taskType !== "chat" && (
                                <span className={`text-[9px] uppercase tracking-wider border px-1.5 py-0.5 rounded-sm ${TASK_COLORS[msg.taskType] || TASK_COLORS.chat}`}>
                                  {TASK_LABELS[msg.taskType] || msg.taskType}
                                </span>
                              )}
                            </div>
                          )}
                          <span className="whitespace-pre-wrap">{msg.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
