import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

type Classe =
  | "Curioso"
  | "Entusiasta"
  | "Engajado"
  | "Estudante"
  | "Praticante"
  | "Expert"
  | "Terapeuta";

interface Jornada {
  teste?: { quando?: string | null; dosha?: string | null; id_publico?: string | null } | null;
  rotina?: { ativa?: boolean; via_premium?: boolean } | null;
  premium?: { ativo?: boolean } | null;
  cursos?: Array<{ titulo: string; comprado?: boolean }> | null;
  escola?: { aluno?: boolean } | null;
  evolucao?: { classe?: Classe | string; pontos?: number; streak?: number } | null;
}

const CLASSES_ORDER: Classe[] = [
  "Curioso",
  "Entusiasta",
  "Engajado",
  "Estudante",
  "Praticante",
  "Expert",
  "Terapeuta",
];

const FRASES: Record<Classe, string> = {
  Curioso: "Você deu o primeiro passo — e ele é o mais importante.",
  Entusiasta: "A curiosidade virou vontade de aprender mais.",
  Engajado: "O Ayurveda já faz parte dos seus dias.",
  Estudante: "Cada leitura sua vira raiz para o que vem.",
  Praticante: "Sua constância virou raiz.",
  Expert: "Você conhece o próprio corpo com clareza rara.",
  Terapeuta: "Você agora caminha guiando outras pessoas.",
};

const KAPHA_DARK = "#3F6B47";
const KAPHA_MID = "#7FB08A";
const KAPHA_LIGHT = "#C7E3CB";
const EARTH = "#8B6F52";
const EARTH_LIGHT = "#C9AF95";

const Plant = ({ stage }: { stage: number }) => {
  // stage 1..7
  const s = Math.max(1, Math.min(7, stage));
  const soil = (
    <>
      <ellipse cx="100" cy="175" rx="70" ry="8" fill={EARTH_LIGHT} opacity="0.6" />
      <path d="M35 175 Q100 195 165 175 L165 185 Q100 200 35 185 Z" fill={EARTH} />
    </>
  );

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden>
      {soil}
      {s === 1 && (
        <g>
          <path d="M100 175 L100 155" stroke={KAPHA_DARK} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M100 158 Q92 152 88 158 Q95 160 100 158" fill={KAPHA_MID} />
          <path d="M100 158 Q108 152 112 158 Q105 160 100 158" fill={KAPHA_MID} />
        </g>
      )}
      {s === 2 && (
        <g>
          <path d="M100 175 L100 130" stroke={KAPHA_DARK} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="88" cy="140" rx="12" ry="6" fill={KAPHA_MID} transform="rotate(-25 88 140)" />
          <ellipse cx="112" cy="140" rx="12" ry="6" fill={KAPHA_MID} transform="rotate(25 112 140)" />
          <circle cx="100" cy="128" r="4" fill={KAPHA_LIGHT} />
        </g>
      )}
      {s === 3 && (
        <g>
          <path d="M100 175 L100 100" stroke={KAPHA_DARK} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="82" cy="145" rx="16" ry="8" fill={KAPHA_MID} transform="rotate(-25 82 145)" />
          <ellipse cx="118" cy="130" rx="16" ry="8" fill={KAPHA_MID} transform="rotate(25 118 130)" />
          <ellipse cx="85" cy="115" rx="14" ry="7" fill={KAPHA_MID} transform="rotate(-30 85 115)" />
          <ellipse cx="115" cy="105" rx="14" ry="7" fill={KAPHA_MID} transform="rotate(30 115 105)" />
        </g>
      )}
      {s === 4 && (
        <g>
          <path d="M100 175 L100 70" stroke={KAPHA_DARK} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="78" cy="150" rx="18" ry="9" fill={KAPHA_MID} transform="rotate(-25 78 150)" />
          <ellipse cx="122" cy="140" rx="18" ry="9" fill={KAPHA_MID} transform="rotate(25 122 140)" />
          <ellipse cx="75" cy="120" rx="20" ry="10" fill={KAPHA_DARK} transform="rotate(-30 75 120)" />
          <ellipse cx="125" cy="110" rx="20" ry="10" fill={KAPHA_DARK} transform="rotate(30 125 110)" />
          <ellipse cx="88" cy="88" rx="16" ry="8" fill={KAPHA_MID} transform="rotate(-35 88 88)" />
          <ellipse cx="112" cy="80" rx="16" ry="8" fill={KAPHA_MID} transform="rotate(35 112 80)" />
        </g>
      )}
      {s === 5 && (
        <g>
          <path d="M100 175 L100 55" stroke={KAPHA_DARK} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="75" cy="145" rx="20" ry="10" fill={KAPHA_MID} transform="rotate(-25 75 145)" />
          <ellipse cx="125" cy="135" rx="20" ry="10" fill={KAPHA_MID} transform="rotate(25 125 135)" />
          <ellipse cx="72" cy="105" rx="22" ry="11" fill={KAPHA_DARK} transform="rotate(-30 72 105)" />
          <ellipse cx="128" cy="95" rx="22" ry="11" fill={KAPHA_DARK} transform="rotate(30 128 95)" />
          <circle cx="100" cy="55" r="6" fill="#F4C4C4" />
          <circle cx="85" cy="65" r="4" fill="#F4C4C4" />
          <circle cx="115" cy="62" r="4" fill="#F4C4C4" />
        </g>
      )}
      {s === 6 && (
        <g>
          <path d="M100 175 L100 50" stroke={KAPHA_DARK} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="70" cy="140" rx="22" ry="11" fill={KAPHA_MID} transform="rotate(-25 70 140)" />
          <ellipse cx="130" cy="130" rx="22" ry="11" fill={KAPHA_MID} transform="rotate(25 130 130)" />
          <ellipse cx="65" cy="100" rx="24" ry="12" fill={KAPHA_DARK} transform="rotate(-30 65 100)" />
          <ellipse cx="135" cy="90" rx="24" ry="12" fill={KAPHA_DARK} transform="rotate(30 135 90)" />
          {[[100,45],[82,55],[118,52],[92,38],[108,40]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="7" fill="#EDA6B8" />
              <circle cx={x} cy={y} r="2.5" fill="#F9E7A0" />
            </g>
          ))}
        </g>
      )}
      {s === 7 && (
        <g>
          <path d="M100 175 L100 90" stroke={EARTH} strokeWidth="7" strokeLinecap="round" />
          <path d="M100 130 Q80 120 70 105" stroke={EARTH} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 120 Q125 110 135 95" stroke={EARTH} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="70" cy="80" r="28" fill={KAPHA_DARK} opacity="0.85" />
          <circle cx="130" cy="75" r="30" fill={KAPHA_DARK} opacity="0.85" />
          <circle cx="100" cy="55" r="34" fill={KAPHA_MID} />
          <circle cx="85" cy="72" r="24" fill={KAPHA_MID} opacity="0.9" />
          <circle cx="118" cy="70" r="26" fill={KAPHA_MID} opacity="0.9" />
        </g>
      )}
    </svg>
  );
};

const formatData = (iso?: string | null): string => {
  if (!iso) return "há algum tempo";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "há algum tempo";
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};

const scrollToReteste = () => {
  const el = document.getElementById("reteste-anchor");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-akasha", "ring-offset-2");
    setTimeout(() => el.classList.remove("ring-2", "ring-akasha", "ring-offset-2"), 2500);
  }
};

const MinhaCaminhadaSection = () => {
  const { user } = useUser();
  const [data, setData] = useState<Jornada | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: resp, error } = await (supabase.rpc as any)("get_minha_jornada");
      if (cancelled) return;
      if (!error) setData((resp as Jornada) ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || !data) return null;

  const classe = (data.evolucao?.classe as Classe) || "Curioso";
  const stage = Math.max(1, CLASSES_ORDER.indexOf(classe) + 1);
  const pontos = data.evolucao?.pontos ?? 0;
  const streak = data.evolucao?.streak ?? 0;
  const cursosComprados = (data.cursos ?? []).filter((c) => c.comprado);

  const fecho = (() => {
    if (!data.rotina?.ativa) {
      return {
        texto: "Quando sentir que é hora do próximo passo, sua rotina personalizada te espera — desenhada para o seu dosha.",
        link: { to: "/minha-rotina", label: "conhecer a rotina" },
      };
    }
    if (data.rotina?.ativa && !data.premium?.ativo) {
      return {
        texto: "Se um dia quiser a Akasha caminhando com você, o Premium está aqui.",
        link: { to: "/assinar", label: "conhecer o Premium" },
      };
    }
    return {
      texto: "Seu corpo muda com as estações — que tal reencontrar seu dosha este mês?",
      link: { to: "#reteste", label: "fazer minha revisão", onClick: scrollToReteste },
    };
  })();

  return (
    <section
      aria-labelledby="caminhada-titulo"
      className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-kapha/30 bg-gradient-to-br from-kapha/5 via-white to-kapha/10 p-5 md:p-8"
    >
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-widest text-kapha font-semibold">Sua Caminhada</p>
        <h2 id="caminhada-titulo" className="sr-only">Sua Caminhada no Ayurveda</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* PARTE 1 — O MOMENTO */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left gap-3">
          <div className="w-40 h-40 md:w-48 md:h-48">
            <Plant stage={stage} />
          </div>
          <p className="font-serif text-lg md:text-xl text-primary leading-snug">
            Você está no momento <span className="font-bold italic">{classe}</span> da sua caminhada
          </p>
          <p className="text-sm text-foreground/75 leading-relaxed">{FRASES[classe]}</p>
          <div className="w-full mt-2 rounded-2xl bg-white/70 border border-kapha/20 p-3">
            <p className="text-sm text-foreground">
              {streak > 0
                ? <>Constância: <span className="font-bold text-kapha">{streak}</span> dias seguidos cuidando de você</>
                : "Cada dia é um bom dia para recomeçar."}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">{pontos} pontos de caminhada</p>
        </div>

        {/* PARTE 2 — SEUS MARCOS */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Seus marcos</p>
          <ul className="space-y-2 text-sm text-foreground/85 leading-relaxed">
            <li>
              Seu primeiro encontro com seu dosha: <span className="font-medium">{formatData(data.teste?.quando)}</span>
              {data.teste?.dosha ? <> — <span className="font-medium">{data.teste.dosha}</span></> : null}
            </li>
            {data.rotina?.ativa && (
              <li>
                Sua rotina personalizada caminha com você —{" "}
                <Link to="/minha-rotina" className="underline decoration-kapha/60 hover:decoration-kapha text-kapha font-medium">
                  abrir a de hoje
                </Link>
              </li>
            )}
            {data.premium?.ativo && (
              <li>Você vive o portal completo — a Akasha te acompanha sempre.</li>
            )}
            {data.escola?.aluno && (
              <li>
                Aluna da Formação Profissional —{" "}
                <Link to="/escola/aluno/modulos" className="underline decoration-kapha/60 hover:decoration-kapha text-kapha font-medium">
                  meus módulos
                </Link>
              </li>
            )}
            {cursosComprados.length > 0 && (
              <li>
                Seus cursos: <span className="font-medium">{cursosComprados.map((c) => c.titulo).join(", ")}</span> —{" "}
                <Link to="/cursos" className="underline decoration-kapha/60 hover:decoration-kapha text-kapha font-medium">
                  acessar
                </Link>
              </li>
            )}
          </ul>

          <div className="pt-4 mt-2 border-t border-kapha/20">
            <p className="text-sm text-foreground/85 leading-relaxed italic">
              {fecho.texto}{" "}
              {fecho.link.onClick ? (
                <button
                  type="button"
                  onClick={fecho.link.onClick}
                  className="underline decoration-kapha hover:text-kapha font-medium"
                >
                  {fecho.link.label}
                </button>
              ) : (
                <Link
                  to={fecho.link.to}
                  className="underline decoration-kapha hover:text-kapha font-medium"
                >
                  {fecho.link.label}
                </Link>
              )}
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MinhaCaminhadaSection;
