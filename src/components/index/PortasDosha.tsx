import { Link } from "react-router-dom";
import { ChevronRight, Clock, Flame, Mountain, Wind, type LucideIcon } from "lucide-react";
import DoshaClock from "@/components/dosha/DoshaClock";

type DoshaId = "vata" | "pitta" | "kapha";

type Guia = {
  id: DoshaId;
  to: string;
  Icon: LucideIcon;
  titulo: string;
  elementos: string;
  qualidades: string;
  equilibrio: string[];
  excesso: string[];
  fundo: string;
  borda: string;
  texto: string;
  fill: string;
  outline: string;
  seta: string;
};

const GUIAS: Guia[] = [
  {
    id: "vata",
    to: "/biblioteca/vata",
    Icon: Wind,
    titulo: "Vata",
    elementos: "Éter + Ar",
    qualidades: "Móvel, difuso, leve, frio e seco.",
    equilibrio: ["Criatividade", "Adaptação", "Comunicação", "Mobilidade"],
    excesso: ["Gases", "Constipação", "Insônia", "Ansiedade", "Estufamento", "Pele ressecada"],
    fundo: "bg-gradient-to-b from-vata/25 to-vata/5",
    borda: "border-vata/40",
    texto: "text-vata-5",
    fill: "bg-vata-1 text-vata-5",
    outline: "border-vata-2 text-vata-5",
    seta: "bg-vata-5",
  },
  {
    id: "pitta",
    to: "/biblioteca/pitta",
    Icon: Flame,
    titulo: "Pitta",
    elementos: "Fogo + Água",
    qualidades: "Quente, penetrante, brilhante, úmido e leve.",
    equilibrio: ["Discernimento", "Compromisso", "Precisão", "Liderança"],
    excesso: ["Inflamação", "Azia", "Irritabilidade", "Problemas de pele", "Estresse", "Refluxo"],
    fundo: "bg-gradient-to-b from-pitta/25 to-pitta/5",
    borda: "border-pitta/40",
    texto: "text-pitta-5",
    fill: "bg-pitta-1 text-pitta-5",
    outline: "border-pitta-2 text-pitta-5",
    seta: "bg-pitta-5",
  },
  {
    id: "kapha",
    to: "/biblioteca/kapha",
    Icon: Mountain,
    titulo: "Kapha",
    elementos: "Terra + Água",
    qualidades: "Pesado, úmido, denso, estável e resistente.",
    equilibrio: ["Vigorosidade", "Resistência", "Compreensão", "Amorosidade"],
    excesso: ["Muco", "Mente lenta", "Retenção", "Obesidade", "Letargia", "Sensação de peso"],
    fundo: "bg-gradient-to-b from-kapha/25 to-kapha/5",
    borda: "border-kapha/40",
    texto: "text-kapha-5",
    fill: "bg-kapha-1 text-kapha-5",
    outline: "border-kapha-2 text-kapha-5",
    seta: "bg-kapha-5",
  },
];

const PortasDosha = () => {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
        <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary text-center">
          Guias de Vata, Pitta e Kapha
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          Cada guia tem alimentação, horários, herbologia e videoaulas.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {GUIAS.map((g) => (
            <Link
              key={g.id}
              to={g.to}
              className={`group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2 p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${g.fundo} ${g.borda}`}
            >
              <div className="relative flex items-start justify-between gap-2">
                <h3 className={`font-serif font-bold text-base leading-tight ${g.texto}`}>{g.titulo}</h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`hidden sm:block text-[11px] font-medium ${g.texto} opacity-80`}>
                    {g.elementos}
                  </span>
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-card">
                    <g.Icon className={`h-3.5 w-3.5 ${g.texto}`} aria-hidden="true" />
                  </span>
                </div>
              </div>

              <p className="relative mt-1 text-[11px] leading-snug text-foreground/75">{g.qualidades}</p>

              <p className={`relative mt-3 text-[10px] font-bold uppercase tracking-wider ${g.texto}`}>
                EM EQUILÍBRIO
              </p>
              <div className="relative mt-1.5 flex flex-wrap gap-1">
                {g.equilibrio.map((s) => (
                  <span
                    key={s}
                    className={`rounded-full px-2 py-0.5 text-[10px] leading-tight font-medium ${g.fill}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className={`relative mt-3 text-[10px] font-bold uppercase tracking-wider ${g.texto}`}>
                SINAIS DE EXCESSO
              </p>
              <div className={`relative mt-1.5 flex flex-wrap gap-1 pr-10`}>
                {g.excesso.map((s) => (
                  <span
                    key={s}
                    className={`rounded-full border bg-card/70 px-2 py-0.5 text-[10px] leading-tight ${g.outline}`}
                  >
                    {s}
                  </span>
                ))}
              </div>

              <span
                className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform group-hover:translate-x-0.5 ${g.seta}`}
                aria-hidden="true"
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}

          <Link
            to="/biblioteca/horarios"
            className="group relative flex h-full flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2 border-accent/50 bg-gradient-to-b from-accent/25 to-accent/5 p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative flex items-start justify-between gap-2">
              <h3 className="font-serif font-bold text-base leading-tight text-primary">
                Relógio dos Doshas
              </h3>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="hidden sm:block text-[11px] font-medium text-muted-foreground">
                  Dinacharya
                </span>
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-card text-accent-foreground">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>

            <p className="relative mt-1 text-[11px] leading-snug text-foreground/75">
              A hora certa de cada coisa no dia.
            </p>

            <div className="relative mt-auto flex justify-center pt-2">
              <div className="w-24 md:w-28">
                <DoshaClock
                  variant="neutral"
                  hideCenter
                  compact
                  hiddenMarkers={["02h", "10h", "14h", "22h"]}
                />
              </div>
            </div>

            <span
              className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortasDosha;
