import { Link } from "react-router-dom";
import { ArrowRight, Clock, Droplet, Flame, Wind, type LucideIcon } from "lucide-react";

type Guia = {
  to: string;
  Icon: LucideIcon;
  titulo: string;
  descricao: string;
  cta: string;
  fundo: string;
  borda: string;
  texto: string;
};

const GUIAS: Guia[] = [
  {
    to: "/biblioteca/vata",
    Icon: Wind,
    titulo: "Vata",
    descricao: "Éter e ar. Movimento, ritmo e o que resseca.",
    cta: "Abrir guia",
    fundo: "#EEF2FF",
    borda: "#D7DFFF",
    texto: "#3F55B8",
  },
  {
    to: "/biblioteca/pitta",
    Icon: Flame,
    titulo: "Pitta",
    descricao: "Fogo e água. Digestão, calor e inflamação.",
    cta: "Abrir guia",
    fundo: "#FFF0F0",
    borda: "#FFDADA",
    texto: "#B23B3B",
  },
  {
    to: "/biblioteca/kapha",
    Icon: Droplet,
    titulo: "Kapha",
    descricao: "Terra e água. Estrutura, peso e estagnação.",
    cta: "Abrir guia",
    fundo: "#EFFAEC",
    borda: "#D6EFD0",
    texto: "#3F7D46",
  },
  {
    to: "/biblioteca/horarios",
    Icon: Clock,
    titulo: "Relógio dos Doshas",
    descricao: "Dinacharya: a hora certa de cada coisa no dia.",
    cta: "Abrir compêndio",
    fundo: "#FFF8EE",
    borda: "#F2E6D6",
    texto: "#9A6512",
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
        {GUIAS.map(({ to, Icon, titulo, descricao, cta, fundo, borda, texto }) => (
          <Link
            key={to}
            to={to}
            className="flex min-h-[190px] flex-col rounded-md border p-4 transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: fundo, borderColor: borda, color: texto }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card" aria-hidden="true">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-serif font-bold text-base leading-tight" style={{ color: texto }}>{titulo}</h3>
            <p className="mt-1 text-xs leading-snug" style={{ color: texto }}>{descricao}</p>
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold">
              {cta} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default PortasDosha;