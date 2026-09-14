import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame, Mountain, Wind, type LucideIcon } from "lucide-react";
import DoshaClock from "@/components/dosha/DoshaClock";

type Guia = {
  to: string;
  Icon: LucideIcon;
  emoji: string;
  titulo: string;
  elementos: string;
  descricao: string;
  cta: string;
  fundo: string;
  borda: string;
  texto: string;
  relogio?: "neutral";
};

const GUIAS: Guia[] = [
  {
    to: "/biblioteca/vata",
    Icon: Wind,
    emoji: "🌬️",
    titulo: "Vata",
    elementos: "Éter + Ar",
    descricao: "Movimento, ritmo e o que resseca.",
    cta: "Abrir guia",
    fundo: "bg-gradient-to-b from-vata/25 to-vata/5",
    borda: "border-vata/40",
    texto: "text-vata",
  },
  {
    to: "/biblioteca/pitta",
    Icon: Flame,
    emoji: "☀️",
    titulo: "Pitta",
    elementos: "Fogo + Água",
    descricao: "Digestão, calor e inflamação.",
    cta: "Abrir guia",
    fundo: "bg-gradient-to-b from-pitta/25 to-pitta/5",
    borda: "border-pitta/40",
    texto: "text-pitta",
  },
  {
    to: "/biblioteca/kapha",
    Icon: Mountain,
    emoji: "⛰️",
    titulo: "Kapha",
    elementos: "Terra + Água",
    descricao: "Estrutura, peso e estagnação.",
    cta: "Abrir guia",
    fundo: "bg-gradient-to-b from-kapha/25 to-kapha/5",
    borda: "border-kapha/40",
    texto: "text-kapha",
  },
  {
    to: "/biblioteca/horarios",
    Icon: Clock,
    emoji: "🕐",
    titulo: "Relógio dos Doshas",
    elementos: "Dinacharya",
    descricao: "A hora certa de cada coisa no dia.",
    cta: "Abrir compêndio",
    fundo: "bg-gradient-to-b from-accent/25 to-accent/5",
    borda: "border-accent/50",
    texto: "text-accent-foreground",
    relogio: "neutral",
  },
];

const PortasDosha = () => (
  <section className="bg-background">
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary text-center">
        Guias de Vata, Pitta e Kapha
      </h2>
      <p className="mt-1 text-sm text-muted-foreground text-center">
        Cada guia tem alimentação, horários, remédios caseiros e vídeos.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {GUIAS.map(({ to, Icon, emoji, titulo, elementos, descricao, cta, fundo, borda, texto, relogio }) => (
          <Link
            key={to}
            to={to}
            className={`group relative flex min-h-[200px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2 p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${fundo} ${borda}`}
          >
            {relogio ? (
              <div
                className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 opacity-25"
                aria-hidden="true"
              >
                <DoshaClock variant={relogio} hideCenter compact />
              </div>
            ) : null}

            <span className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-card ${texto}`} aria-hidden="true">
              <Icon className="h-5 w-5" />
            </span>

            <p className="relative mt-3 text-[11px] font-medium text-muted-foreground">{elementos}</p>
            <h3 className="relative font-serif font-bold text-base leading-tight text-primary">
              {titulo} <span aria-hidden="true">{emoji}</span>
            </h3>
            <p className="relative mt-1 text-xs leading-snug text-foreground/80">{descricao}</p>
            <span className={`relative mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold ${texto}`}>
              {cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default PortasDosha;
