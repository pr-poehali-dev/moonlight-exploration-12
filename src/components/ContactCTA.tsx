import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ContactCTA() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <section id="contact" className="py-24 md:py-36 relative z-10 border-t border-border/30">
      <div className="container">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Доступ</p>
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Запросить <i className="font-light">доступ</i>
          </h2>
          <p className="font-mono text-sm text-foreground/60 mb-10">
            Оставьте email — администратор рассмотрит заявку и откроет доступ к платформе
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ваш@email.ru"
                required
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-foreground/30 outline-none border border-border/50 rounded-sm px-4 py-3 focus:border-primary/60 transition-colors"
              />
              <Button type="submit" className="shrink-0">
                [Запросить доступ]
              </Button>
            </form>
          ) : (
            <div className="border border-primary/30 bg-primary/5 rounded-sm px-6 py-5">
              <p className="font-mono text-sm text-primary">
                Заявка отправлена! Ожидайте подтверждения от администратора.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="container mt-24 pt-8 border-t border-border/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-foreground/30">© 2025 КИРА. Все права защищены.</p>
          <p className="font-mono text-xs text-foreground/30">Соответствует GDPR и 152-ФЗ</p>
        </div>
      </div>
    </section>
  );
}
