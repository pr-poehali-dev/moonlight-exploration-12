import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface Message {
  role: "user" | "kira";
  text: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "Привет! Я КИРА — ваш персональный ИИ-помощник. Могу создать текст, код, изображение, найти информацию или просто поговорить. Что сделать для вас?",
  музык: "Отлично! Опишите жанр и настроение — и я создам трек. Например: «лёгкая джазовая мелодия для фона рабочего пространства».",
  код: "Конечно! Напишите задачу — я подготовлю код на Python, JavaScript, HTML/CSS или другом языке. Пример: «сделай форму обратной связи на HTML».",
  реферат: "Понял! Укажите тему, объём и предмет — я подготовлю структурированный реферат с источниками.",
  сайт: "Помогу с диагностикой и оптимизацией. Опишите проблему или вставьте URL сайта — разберёмся вместе.",
  привет: "Привет! Рада вас слышать. Чем могу помочь сегодня?",
  изображен: "Опишите, что хотите увидеть — стиль, объект, настроение. Я сгенерирую изображение по вашему описанию.",
};

function getKiraResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const key of Object.keys(DEMO_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) {
      return DEMO_RESPONSES[key];
    }
  }
  return DEMO_RESPONSES.default;
}

export function KiraChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "kira", text: DEMO_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
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
    utter.rate = 0.95;
    utter.pitch = 1.1;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleRu = voices.find(
        (v) => v.lang.startsWith("ru") && /female|woman|женский|Milena|Irina|Katya/i.test(v.name)
      ) || voices.find((v) => v.lang.startsWith("ru"));
      if (femaleRu) utter.voice = femaleRu;
    };

    setVoice();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text };
    const kiraMsg: Message = { role: "kira", text: getKiraResponse(text) };
    setMessages((prev) => [...prev, userMsg, kiraMsg]);
    setInput("");
    setTimeout(() => speak(kiraMsg.text), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  const toggleListen = () => {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Ваш браузер не поддерживает распознавание речи. Используйте Chrome.");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ru-RU";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
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
          {/* Chat window */}
          <div className="border border-border/50 bg-white/[0.02] rounded-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-white/[0.02]">
              <div className={`w-2.5 h-2.5 rounded-full ${speaking ? "bg-primary animate-pulse" : "bg-primary/60"}`} />
              <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">
                КИРА {speaking ? "— говорит..." : "— онлайн"}
              </span>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-5 py-5 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 font-mono text-xs leading-relaxed rounded-sm ${
                      msg.role === "kira"
                        ? "bg-primary/10 border border-primary/20 text-foreground/90"
                        : "bg-white/[0.06] border border-border/40 text-foreground/70"
                    }`}
                  >
                    {msg.role === "kira" && (
                      <span className="text-primary font-semibold uppercase tracking-wider text-[10px] block mb-1">
                        КИРА
                      </span>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
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
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none border border-border/40 rounded-sm px-4 py-2.5 focus:border-primary/50 transition-colors"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={toggleListen}
                className={`border-border/40 hover:border-primary/50 shrink-0 ${listening ? "border-primary text-primary" : ""}`}
                title="Голосовой ввод"
              >
                <Icon name={listening ? "MicOff" : "Mic"} size={16} />
              </Button>
              <Button
                size="sm"
                onClick={() => sendMessage(input)}
                className="shrink-0"
                disabled={!input.trim()}
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
