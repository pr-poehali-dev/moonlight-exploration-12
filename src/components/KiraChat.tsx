import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const CHAT_URL = "https://functions.poehali.dev/c6d2bb21-3063-4993-b1b5-b5c284a5e0ca";

interface Message {
  role: "user" | "kira";
  text: string;
  taskType?: string;
}

const WELCOME = "Привет! Я КИРА — самообучающийся ИИ-помощник. Могу создать текст, код, объяснить тему, найти информацию или помочь с сайтом. Что сделать для вас?";

const sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function KiraChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "kira", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ru-RU";
    utter.rate = 0.93;
    utter.pitch = 1.15;

    const applyVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleRu =
        voices.find((v) => v.lang.startsWith("ru") && /female|woman|Milena|Irina|Katya|женск/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("ru"));
      if (femaleRu) utter.voice = femaleRu;
    };

    applyVoice();
    if (!window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.onvoiceschanged = applyVoice;
    }
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages.slice(-10).map((m) => ({
      role: m.role === "kira" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const responseText = parsed.response || "Не удалось получить ответ.";
      const kiraMsg: Message = {
        role: "kira",
        text: responseText,
        taskType: parsed.task_type,
      };
      setMessages((prev) => [...prev, kiraMsg]);
      setTimeout(() => speak(responseText), 200);
    } catch {
      const errMsg: Message = {
        role: "kira",
        text: "Произошла ошибка соединения. Проверьте подключение и попробуйте снова.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  const toggleListen = () => {
    const SR =
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SR) {
      alert("Голосовой ввод недоступен. Используйте Chrome или Edge.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.onresult = (e) => sendMessage(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const taskLabel: Record<string, string> = {
    code: "код",
    image: "изображение",
    music: "музыка",
    study: "учёба",
    search: "поиск",
    support: "техподдержка",
    chat: "чат",
  };

  return (
    <section id="demo" className="py-24 md:py-36 relative z-10 border-t border-border/30">
      <div className="container">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Демо</p>
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Поговорите с <i className="font-light">КИРОЙ</i>
          </h2>
          <p className="font-mono text-sm text-foreground/60 max-w-[440px] mx-auto">
            Напишите или скажите — КИРА ответит голосом и текстом
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="border border-border/50 bg-white/[0.02] rounded-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${speaking ? "bg-primary animate-pulse scale-125" : loading ? "bg-primary/40 animate-pulse" : "bg-primary/70"}`} />
                <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">
                  КИРА {speaking ? "— говорит..." : loading ? "— думает..." : "— онлайн"}
                </span>
              </div>
              <button
                onClick={() => speaking && window.speechSynthesis.cancel()}
                className="font-mono text-[10px] uppercase text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                {speaking ? "[ стоп ]" : ""}
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto px-5 py-5 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] px-4 py-3 font-mono text-xs leading-relaxed rounded-sm ${
                    msg.role === "kira"
                      ? "bg-primary/10 border border-primary/20 text-foreground/90"
                      : "bg-white/[0.06] border border-border/40 text-foreground/70"
                  }`}>
                    {msg.role === "kira" && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-primary font-semibold uppercase tracking-wider text-[10px]">КИРА</span>
                        {msg.taskType && msg.taskType !== "chat" && (
                          <span className="text-[9px] uppercase tracking-wider text-primary/50 border border-primary/20 px-1.5 py-0.5 rounded-sm">
                            {taskLabel[msg.taskType] || msg.taskType}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-primary/10 border border-primary/20 px-4 py-3 rounded-sm">
                    <span className="text-primary font-semibold uppercase tracking-wider text-[10px] block mb-1">КИРА</span>
                    <span className="font-mono text-xs text-foreground/50 animate-pulse">думаю...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-4 border-t border-border/40">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите запрос..."
                disabled={loading}
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none border border-border/40 rounded-sm px-4 py-2.5 focus:border-primary/50 transition-colors disabled:opacity-50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={toggleListen}
                disabled={loading}
                className={`border-border/40 hover:border-primary/50 shrink-0 ${listening ? "border-primary text-primary" : ""}`}
                title="Голосовой ввод"
              >
                <Icon name={listening ? "MicOff" : "Mic"} size={16} />
              </Button>
              <Button
                size="sm"
                onClick={() => sendMessage(input)}
                className="shrink-0"
                disabled={!input.trim() || loading}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>

          <p className="text-center font-mono text-xs text-foreground/30 mt-4">
            Это демо-версия. Полный доступ — после регистрации.
          </p>
        </div>
      </div>
    </section>
  );
}
