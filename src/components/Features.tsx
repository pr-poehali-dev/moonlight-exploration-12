import Icon from "@/components/ui/icon";

const features = [
  {
    icon: "Music",
    title: "Музыка и видео",
    description: "Создаю треки в любом жанре, монтирую короткие ролики и анимации по вашему описанию.",
  },
  {
    icon: "Image",
    title: "Изображения",
    description: "Генерирую иллюстрации, арты, баннеры и фото по текстовому запросу.",
  },
  {
    icon: "FileText",
    title: "Тексты и контент",
    description: "Пишу статьи, рефераты, доклады, посты и сценарии любой сложности.",
  },
  {
    icon: "Code2",
    title: "Код",
    description: "Разрабатываю и отлаживаю код на Python, JavaScript, HTML/CSS и других языках.",
  },
  {
    icon: "GraduationCap",
    title: "Помощь в учёбе",
    description: "Объясняю сложные темы, решаю задачи, готовлю презентации и доклады.",
  },
  {
    icon: "Globe",
    title: "Поиск информации",
    description: "Нахожу данные в интернете и составляю обобщённые ответы с источниками.",
  },
  {
    icon: "Wrench",
    title: "Техподдержка сайтов",
    description: "Диагностирую ошибки, даю рекомендации по оптимизации и помогаю с хостингом и CMS.",
  },
  {
    icon: "Mic",
    title: "Голосовое управление",
    description: "Распознаю речь и отвечаю естественным женским голосом — спокойно и дружелюбно.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-36 relative z-10">
      <div className="container">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Возможности</p>
          <h2 className="text-4xl md:text-5xl font-sentient mb-6">
            Всё, что умеет <i className="font-light">КИРА</i>
          </h2>
          <p className="font-mono text-sm text-foreground/60 max-w-[480px] mx-auto">
            Единый ИИ-помощник, который заменяет десятки инструментов и обучается вместе с вами
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group border border-border/50 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/40 transition-all duration-300 p-6 rounded-sm"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <Icon name={f.icon} fallback="Star" size={18} className="text-primary" />
              </div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wider mb-2 text-foreground">
                {f.title}
              </h3>
              <p className="font-mono text-xs text-foreground/50 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}