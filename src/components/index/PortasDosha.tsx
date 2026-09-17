import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Flame, Leaf, Mountain, Wind, type LucideIcon } from "lucide-react";
import DoshaClock from "@/components/dosha/DoshaClock";

type DoshaId = "vata" | "pitta" | "kapha";

type Guia = {
  id: DoshaId;
  to: string;
  Icon: LucideIcon;
  emoji: string;
  titulo: string;
  elementos: string;
  descricao: string;
  sinais: string[];
  acalma: string;
  hora: string;
  fundo: string;
  borda: string;
  texto: string;
};

const GUIAS: Guia[] = [
  {
    id: "vata",
    to: "/biblioteca/vata",
    Icon: Wind,
    emoji: "🌬️",
    titulo: "Vata",
    elementos: "Éter + Ar",
    descricao: "Movimento, ritmo e o que resseca.",
    sinais: ["Gases", "Constipação", "Insônia", "Ansiedade"],
    acalma: "doce, salgado e ácido",
    hora: "2h às 6h e 14h às 18h",
    fundo: "bg-gradient-to-b from-vata/25 to-vata/5",
    borda: "border-vata/40",
    texto: "text-vata",
  },
  {
    id: "pitta",
    to: "/biblioteca/pitta",
    Icon: Flame,
    emoji: "☀️",
    titulo: "Pitta",
    elementos: "Fogo + Água",
    descricao: "Digestão, calor e inflamação.",
    sinais: ["Inflamação", "Azia", "Irritabilidade", "Problemas de pele"],
    acalma: "doce, amargo e adstringente",
    hora: "10h às 14h e 22h às 2h",
    fundo: "bg-gradient-to-b from-pitta/25 to-pitta/5",
    borda: "border-pitta/40",
    texto: "text-pitta",
  },
  {
    id: "kapha",
    to: "/biblioteca/kapha",
    Icon: Mountain,
    emoji: "⛰️",
    titulo: "Kapha",
    elementos: "Terra + Água",
    descricao: "Estrutura, peso e estagnação.",
    sinais: ["Muco", "Mente lenta", "Retenção", "Obesidade"],
    acalma: "picante, amargo e adstringente",
    hora: "6h às 10h e 18h às 22h",
    fundo: "bg-gradient-to-b from-kapha/25 to-kapha/5",
    borda: "border-kapha/40",
    texto: "text-kapha",
  },
];

const doshaDaHora = (h: number): DoshaId => {
  if (h >= 2 && h < 6) return "vata";
  if (h >= 6 && h < 10) return "kapha";
  if (h >= 10 && h < 14) return "pitta";
  if (h >= 14 && h < 18) return "vata";
  if (h >= 18 && h < 22) return "kapha";
  return "pitta";
};

const PortasDosha = () => {
  const [hora, setHora] = useState<number | null>(null);

  useEffect(() => {
    setHora(new Date().getHours());
  }, []);

  const doshaAgora = hora === null ? null : doshaDaHora(hora);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
        <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary text-center">
          Guias de Vata, Pitta e Kapha
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          Cada guia tem alimentação, horários, remédios caseiros e vídeos.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {GUIAS.map((g) => (
            <Link
              key={g.id}
              to={g.to}
              className={`group relative flex min-h-[260px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2 p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${g.fundo} ${g.borda}`}
            >
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full bg-card ${g.texto}`}
                aria-hidden="true"
              >
                <g.Icon className="h-5 w-5" />
              </span>

              <p className="relative mt-3 text-[11px] font-medium text-muted-foreground">{g.elementos}</p>
              <h3 className="relative font-serif font-bold text-base leading-tight text-primary">
                {g.titulo} <span aria-hidden="true">{g.emoji}</span>
              </h3>
              <p className="relative mt-1 text-xs leading-snug text-foreground/80">{g.descricao}</p>

              {doshaAgora === g.id ? (
                <span
                  className={`relative mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${g.texto} bg-card/80`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${g.texto}`} />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                  No comando agora
                </span>
              ) : null}

              <p className="relative mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sinais de excesso
              </p>
              <div className="relative mt-1.5 flex flex-wrap gap-1">
                {g.sinais.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-card/70 px-2 py-0.5 text-[10px] leading-tight text-foreground/80"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="relative mt-3 space-y-1 text-[11px] leading-snug text-foreground/75">
                <p className="flex items-start gap-1.5">
                  <Leaf className={`mt-0.5 h-3 w-3 shrink-0 ${g.texto}`} aria-hidden="true" />
                  <span>
                    <span className="font-semibold text-foreground/85">Acalma:</span> {g.acalma}
                  </span>
                </p>
                <p className="flex items-start gap-1.5">
                  <Clock className={`mt-0.5 h-3 w-3 shrink-0 ${g.texto}`} aria-hidden="true" />
                  <span>
                    <span className="font-semibold text-foreground/85">Hora dele:</span> {g.hora}
                  </span>
                </p>
              </div>

              <span className={`relative mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold ${g.texto}`}>
                Abrir guia <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}

          <Link
            to="/biblioteca/horarios"
            className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-2 border-accent/50 bg-gradient-to-b from-accent/25 to-accent/5 p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 opacity-25"
              aria-hidden="true"
            >
              <DoshaClock variant="neutral" hideCenter compact />
            </div>

            <span
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card text-accent-foreground"
              aria-hidden="true"
            >
              <Clock className="h-5 w-5" />
            </span>

            <p className="relative mt-3 text-[11px] font-medium text-muted-foreground">Dinacharya</p>
            <h3 className="relative font-serif font-bold text-base leading-tight text-primary">
              Relógio dos Doshas <span aria-hidden="true">🕐</span>
            </h3>
            <p className="relative mt-1 text-xs leading-snug text-foreground/80">
              A hora certa de cada coisa no dia.
            </p>

            <span className="relative mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-accent-foreground">
              Abrir compêndio{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortasDosha;
