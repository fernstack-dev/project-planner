import { Hero } from "@/components/landing/hero";
import { FeatureBlock } from "@/components/landing/feature-block";
import { CTASection } from "@/components/landing/cta-section";

const features = [
  {
    title: "Канбан-доски",
    description: "Визуально организуйте задачи, отслеживайте прогресс и управляйте рабочим процессом.",
    imageSrc: "/images/landing/kanban.png",
    reverse: false,
  },
  {
    title: "Календарь задач",
    description: "Планируйте сроки, дедлайны и синхронизируйте с задачами. Ничего не упустите.",
    imageSrc: "/images/landing/date.png",
    reverse: true,
  },
  {
    title: "Заметки и документация",
    description: "Структурируйте идеи, сохраняйте важные ссылки и обсуждайте в комментариях.",
    imageSrc: "/images/landing/notes.png",
    reverse: false,
  },
  {
    title: "Командная работа",
    description: "Совместная работа над проектами (мультипользовательское редактирование будет добавлено в будущем обновлении).",
    imageSrc: "/images/landing/participants.png",
    reverse: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Hero />

      <div id="features" className="divide-y divide-gray-800">
        {features.map((feature, idx) => (
          <FeatureBlock key={idx} {...feature} />
        ))}
      </div>

      <CTASection />
    </div>
  );
}