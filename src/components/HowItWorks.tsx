const steps = [
  {
    num: "01",
    title: "Говорите или пишите",
    description: "Задайте вопрос голосом или текстом — КИРА поймёт и контекст, и интонацию.",
  },
  {
    num: "02",
    title: "КИРА анализирует",
    description: "Система определяет тип задачи и маршрутизирует запрос к лучшему ИИ-сервису.",
  },
  {
    num: "03",
    title: "Получаете результат",
    description: "Текст, код, изображение или голосовой ответ — быстро и точно.",
  },
  {
    num: "04",
    title: "КИРА обучается",
    description: "Каждый запрос пополняет базу знаний. Со временем КИРА решает больше задач самостоятельно.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 md:py-36 relative z-10 border-t border-border/30">
      <div className="container">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Как работает</p>
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Просто <i className="font-light">спросите</i>
          </h2>
          <p className="font-mono text-sm text-foreground/60 max-w-[440px] mx-auto">
            КИРА сама разберётся с задачей — вам не нужно знать, какой ИИ за что отвечает
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="relative p-8 border-l border-border/30 first:border-l-0 md:first:border-l md:[&:nth-child(3)]:border-l-0 lg:[&:nth-child(3)]:border-l">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 w-px h-8 bg-primary/20" />
              )}
              <div className="font-mono text-4xl font-bold text-primary/20 mb-6">{step.num}</div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider mb-3 text-foreground">
                {step.title}
              </h3>
              <p className="font-mono text-xs text-foreground/50 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Learning progress bar */}
        <div className="mt-20 border border-border/40 bg-white/[0.02] p-8 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-foreground/60">Уровень самостоятельности КИРЫ</p>
            <span className="font-mono text-sm text-primary">60%+</span>
          </div>
          <div className="h-px bg-border/40 relative overflow-hidden rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000"
              style={{ width: "60%" }}
            />
          </div>
          <p className="font-mono text-xs text-foreground/40 mt-3">
            После обучения на ваших запросах КИРА решает более 60% задач без привлечения внешних API
          </p>
        </div>
      </div>
    </section>
  );
}
