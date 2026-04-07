import { Utensils, Radio, BookOpen, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const cards = [
  {
    title: "Receita do Dia",
    description: "Receitas ayurvédicas para equilibrar seu dosha.",
    icon: Utensils,
    to: "/cursos",
    badge: "Em breve",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Live do Dia",
    description: "Acompanhe aulas ao vivo sobre Ayurveda.",
    icon: Radio,
    to: "/cursos",
    badge: "Em breve",
    color: "text-pitta",
    bgColor: "bg-pitta/10",
  },
  {
    title: "Biblioteca",
    description: "Mais de 900 vídeos organizados por dosha.",
    icon: BookOpen,
    to: "/biblioteca",
    badge: null,
    color: "text-vata",
    bgColor: "bg-vata/10",
  },
  {
    title: "Métricas",
    description: "Acompanhe sua jornada de autoconhecimento.",
    icon: BarChart3,
    to: "/cursos",
    badge: "Em breve",
    color: "text-kapha",
    bgColor: "bg-kapha/10",
  },
];

const QuickAccessCards = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.to}
              className="group relative bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-3"
            >
              {card.badge && (
                <Badge className="absolute top-2 right-2 text-[10px] bg-muted text-muted-foreground border-0">
                  {card.badge}
                </Badge>
              )}
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <h3 className="font-serif font-bold text-primary text-sm !italic-none" style={{ fontStyle: "normal" }}>
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-snug">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default QuickAccessCards;
