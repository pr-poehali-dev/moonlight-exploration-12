import Icon from "@/components/ui/icon";

const items = [
  { icon: "ShieldCheck", title: "Аутентификация", desc: "Регистрация только с подтверждения администратора. Контроль доступа: администратор, модератор, пользователь." },
  { icon: "Lock", title: "Шифрование", desc: "TLS/SSL для передачи данных. Вся база знаний зашифрована." },
  { icon: "ScrollText", title: "Логирование", desc: "Все действия пользователей и системы записываются для аудита и защиты." },
  { icon: "Ban", title: "Защита от злоупотреблений", desc: "Лимиты на запросы и автоматическая фильтрация вредоносных команд." },
  { icon: "FileCheck2", title: "GDPR и 152-ФЗ", desc: "Полное соответствие требованиям по защите персональных данных." },
  { icon: "DatabaseBackup", title: "Резервное копирование", desc: "Регулярные бэкапы базы знаний и настроек — ваши данные в безопасности." },
];

export function Security() {
  return (
    <section id="security" className="py-24 md:py-36 relative z-10 border-t border-border/30">
      <div className="container">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Безопасность</p>
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Ваши данные <i className="font-light">защищены</i>
          </h2>
          <p className="font-mono text-sm text-foreground/60 max-w-[440px] mx-auto">
            КИРА построена на принципах нулевого доверия и соответствует российским и европейским стандартам
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="border border-border/40 bg-white/[0.02] hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-300 p-6 rounded-sm flex gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name={item.icon} fallback="Shield" size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider mb-2 text-foreground">
                  {item.title}
                </h3>
                <p className="font-mono text-xs text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
