import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight } from "lucide-react";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";

type Modulo = {
  id: string;
  numero: number;
  semestre: number | null;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
};

const SEMESTRES = [
  { num: 1, titulo: "Semestre 1", subtitulo: "Fundamentos (1–5)" },
  { num: 2, titulo: "Semestre 2", subtitulo: "Aprofundamento (6–10)" },
  { num: 3, titulo: "Semestre 3", subtitulo: "Especialização (11–15)" },
];

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const findCurrentId = (mods: Modulo[]): string | null => {
  if (mods.length === 0) return null;
  const now = Date.now();
  const emCurso = mods.find((m) => {
    const s = new Date(m.data_inicio).getTime();
    const e = new Date(m.data_fim).getTime();
    return s <= now && now <= e;
  });
  if (emCurso) return emCurso.id;
  const futuros = mods
    .filter((m) => new Date(m.data_inicio).getTime() > now)
    .sort((a, b) => +new Date(a.data_inicio) - +new Date(b.data_inicio));
  if (futuros[0]) return futuros[0].id;
  const passados = mods
    .filter((m) => new Date(m.data_fim).getTime() < now)
    .sort((a, b) => +new Date(b.data_fim) - +new Date(a.data_fim));
  return passados[0]?.id ?? null;
};

const Conteudo = () => {
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const currentRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_modulos")
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim")
        .order("numero", { ascending: true });
      setModulos((data ?? []) as Modulo[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading && currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  const currentId = findCurrentId(modulos);
  const now = Date.now();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          <Link to="/escola/aluno">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </Button>
        <h1
          className="font-serif text-2xl md:text-3xl font-bold italic"
          style={{ color: branding.darkColor }}
        >
          Os 15 módulos
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        SEMESTRES.map((s) => {
          const itens = modulos.filter((m) => (m.semestre ?? 0) === s.num);
          return (
            <section key={s.num} className="space-y-3">
              <div
                className="pl-3 border-l-4"
                style={{ borderColor: branding.primaryColor }}
              >
                <h2
                  className="font-serif text-xl font-bold italic"
                  style={{ color: branding.darkColor }}
                >
                  {s.titulo}
                </h2>
                <p className="text-sm text-muted-foreground">{s.subtitulo}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {itens.map((m) => {
                  const isCurrent = m.id === currentId;
                  const isFuture = new Date(m.data_inicio).getTime() > now && !isCurrent;
                  return (
                    <Link
                      key={m.id}
                      to={`/escola/aluno/modulo/${m.id}`}
                      ref={isCurrent ? currentRef : undefined}
                      className={`group block bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 transition-all ${
                        isFuture ? "opacity-60 hover:opacity-100" : ""
                      }`}
                      style={{
                        borderColor: isCurrent
                          ? branding.primaryColor
                          : `${branding.primaryColor}22`,
                        boxShadow: isCurrent
                          ? `0 8px 24px -12px ${branding.primaryColor}66`
                          : undefined,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 font-serif font-bold text-base"
                          style={{
                            background: isCurrent
                              ? branding.primaryColor
                              : `${branding.primaryColor}15`,
                            color: isCurrent ? "#fff" : branding.primaryColor,
                          }}
                        >
                          {m.numero}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className="font-serif font-bold italic leading-snug text-base"
                              style={{ color: branding.darkColor }}
                            >
                              {m.titulo}
                            </h3>
                            {isCurrent && (
                              <Badge
                                className="text-[10px] uppercase tracking-wide"
                                style={{
                                  background: branding.primaryColor,
                                  color: "#fff",
                                }}
                              >
                                Atual
                              </Badge>
                            )}
                            {m.tipo === "presencial" && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                                style={{
                                  background: `${branding.primaryColor}1A`,
                                  color: branding.primaryColor,
                                }}
                              >
                                Presencial em SP
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(m.data_inicio)}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 mt-2 shrink-0 group-hover:translate-x-1 transition-transform"
                          style={{ color: branding.primaryColor }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

const EscolaAlunoModulos = () => (
  <EscolaAlunoShell>{() => <Conteudo />}</EscolaAlunoShell>
);

export default EscolaAlunoModulos;
