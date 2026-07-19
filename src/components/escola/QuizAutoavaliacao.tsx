import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Theme = {
  primaryColor: string;
  darkColor: string;
  lightColor: string;
  accentColor: string;
  warmBg: string;
  logo: string;
};

type Pergunta = {
  id: string;
  pergunta: string;
  explicacao_geral: string | null;
  ordem: number | null;
};
type Alt = {
  id: string;
  pergunta_id: string;
  texto: string;
  correta: boolean;
  explicacao: string | null;
  ordem: number | null;
};
type Resp = {
  id: string;
  pergunta_id: string;
  alternativa_id: string | null;
};

interface Props {
  moduloId: string;
  alunoId: string;
  theme: Theme;
}

const QuizAutoavaliacao = ({ moduloId, alunoId, theme }: Props) => {
  const [loading, setLoading] = useState(true);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [altsMap, setAltsMap] = useState<Record<string, Alt[]>>({});
  const [respostas, setRespostas] = useState<Record<string, Resp>>({});
  // seleção local do aluno enquanto responde
  const [selecao, setSelecao] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase
      .from("escola_avaliacao_perguntas")
      .select("id,pergunta,explicacao_geral,ordem")
      .eq("modulo_id", moduloId)
      .order("ordem", { ascending: true });
    const perg = (pData ?? []) as Pergunta[];
    setPerguntas(perg);

    if (perg.length === 0) {
      setLoading(false);
      return;
    }

    const pIds = perg.map((p) => p.id);
    const [{ data: aData }, { data: rData }] = await Promise.all([
      supabase
        .from("escola_avaliacao_alternativas")
        .select("id,pergunta_id,texto,correta,explicacao,ordem")
        .in("pergunta_id", pIds)
        .order("ordem", { ascending: true }),
      supabase
        .from("escola_avaliacao_respostas")
        .select("id,pergunta_id,alternativa_id")
        .eq("aluno_id", alunoId)
        .in("pergunta_id", pIds),
    ]);

    const map: Record<string, Alt[]> = {};
    perg.forEach((p) => (map[p.id] = []));
    ((aData ?? []) as Alt[]).forEach((a) => {
      (map[a.pergunta_id] ??= []).push(a);
    });
    setAltsMap(map);

    const rMap: Record<string, Resp> = {};
    const sel: Record<string, string> = {};
    ((rData ?? []) as Resp[]).forEach((r) => {
      rMap[r.pergunta_id] = r;
      if (r.alternativa_id) sel[r.pergunta_id] = r.alternativa_id;
    });
    setRespostas(rMap);
    setSelecao(sel);

    // Se todas já respondidas anteriormente, mostrar resultado
    const respondidasTodas =
      perg.length > 0 && perg.every((p) => rMap[p.id]?.alternativa_id);
    setMostrarResultado(respondidasTodas);

    setLoading(false);
  }, [moduloId, alunoId]);

  useEffect(() => {
    load();
  }, [load]);

  const perguntasValidas = useMemo(
    () => perguntas.filter((p) => (altsMap[p.id] ?? []).length >= 2),
    [perguntas, altsMap],
  );

  const total = perguntasValidas.length;
  const todasRespondidas =
    total > 0 && perguntasValidas.every((p) => !!selecao[p.id]);

  const acertos = useMemo(() => {
    let a = 0;
    for (const p of perguntasValidas) {
      const escolhida = selecao[p.id];
      const alt = (altsMap[p.id] ?? []).find((x) => x.id === escolhida);
      if (alt?.correta) a++;
    }
    return a;
  }, [perguntasValidas, selecao, altsMap]);

  const enviar = async () => {
    setEnviando(true);
    try {
      for (const p of perguntasValidas) {
        const altId = selecao[p.id];
        if (!altId) continue;
        const existente = respostas[p.id];
        if (existente) {
          await supabase
            .from("escola_avaliacao_respostas")
            .update({ alternativa_id: altId })
            .eq("id", existente.id);
        } else {
          const { data } = await supabase
            .from("escola_avaliacao_respostas")
            .insert({
              aluno_id: alunoId,
              pergunta_id: p.id,
              alternativa_id: altId,
            })
            .select("id,pergunta_id,alternativa_id")
            .maybeSingle();
          if (data) {
            setRespostas((m) => ({ ...m, [p.id]: data as Resp }));
          }
        }
      }
      setMostrarResultado(true);
      toast({ title: "Respostas enviadas" });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: window.scrollY - 40, behavior: "smooth" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e?.message });
    } finally {
      setEnviando(false);
    }
  };

  const refazer = () => {
    setMostrarResultado(false);
  };

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (perguntasValidas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Ainda não há questões de autoavaliação para este módulo.
      </p>
    );
  }

  const abertura = (
    <p className="text-xs text-muted-foreground italic">
      Esta é uma ferramenta de autodiagnóstico: sirva-se dela para perceber o que já domina e o que merece revisão. Não é prova nem avaliação — o gabarito aparece ao final.
    </p>
  );

  if (mostrarResultado) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-4 flex items-center gap-3"
          style={{ background: `${theme.primaryColor}12`, border: `1px solid ${theme.primaryColor}33` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: theme.primaryColor }} />
          <div className="flex-1">
            <p className="font-serif font-bold text-sm" style={{ color: theme.darkColor }}>
              Você acertou {acertos} de {total}
            </p>
            <p className="text-xs text-muted-foreground">
              Reveja os comentários abaixo — o valor está em perceber, não em pontuar.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refazer}
            className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
          >
            <RotateCcw className="w-4 h-4" /> Refazer
          </Button>
        </div>

        {perguntasValidas.map((p, idx) => {
          const alts = altsMap[p.id] ?? [];
          const escolhida = selecao[p.id];
          const marcada = alts.find((a) => a.id === escolhida);
          const correta = alts.find((a) => a.correta);
          const acertou = marcada?.correta;
          return (
            <div
              key={p.id}
              className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-3"
              style={{ borderColor: `${theme.primaryColor}22` }}
            >
              <div className="flex items-start gap-2">
                {marcada &&
                  (acertou ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: theme.primaryColor }} />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0 text-destructive" />
                  ))}
                <p className="font-serif font-bold text-sm flex-1" style={{ color: theme.darkColor }}>
                  {idx + 1}. {p.pergunta}
                </p>
              </div>
              <ul className="space-y-1.5">
                {alts.map((a) => {
                  const isMarcada = a.id === escolhida;
                  const isCorreta = a.correta;
                  const bg = isCorreta
                    ? `${theme.primaryColor}10`
                    : isMarcada
                      ? "hsl(var(--destructive) / 0.06)"
                      : "transparent";
                  const borderCol = isCorreta
                    ? `${theme.primaryColor}55`
                    : isMarcada
                      ? "hsl(var(--destructive) / 0.4)"
                      : "hsl(var(--border))";
                  return (
                    <li
                      key={a.id}
                      className="rounded-md border p-2 text-sm"
                      style={{ background: bg, borderColor: borderCol }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">
                          {isCorreta ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: theme.primaryColor }} />
                          ) : isMarcada ? (
                            <XCircle className="w-4 h-4 text-destructive" />
                          ) : (
                            <span className="inline-block w-4 h-4 rounded-full border border-border" />
                          )}
                        </span>
                        <div className="flex-1">
                          <p>
                            {a.texto}
                            {isMarcada && (
                              <span className="ml-2 text-[11px] text-muted-foreground">
                                (sua escolha)
                              </span>
                            )}
                          </p>
                          {a.explicacao && (isMarcada || isCorreta) && (
                            <p className="mt-1 text-xs text-muted-foreground italic">
                              {a.explicacao}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {p.explicacao_geral && (
                <div
                  className="text-xs italic p-2 rounded-md"
                  style={{ background: theme.warmBg, color: theme.darkColor }}
                >
                  {p.explicacao_geral}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fluxo de resposta
  return (
    <div className="space-y-4">
      {abertura}
      {perguntasValidas.map((p, idx) => {
        const alts = altsMap[p.id] ?? [];
        const escolhida = selecao[p.id];
        return (
          <div
            key={p.id}
            className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-3"
            style={{ borderColor: `${theme.primaryColor}22` }}
          >
            <p className="font-serif font-bold text-sm" style={{ color: theme.darkColor }}>
              {idx + 1}. {p.pergunta}
            </p>
            <ul className="space-y-1.5">
              {alts.map((a) => {
                const checked = escolhida === a.id;
                return (
                  <li key={a.id}>
                    <label
                      className="flex items-start gap-2 p-2 rounded-md border cursor-pointer text-sm hover:bg-muted/40 transition"
                      style={{
                        borderColor: checked ? theme.primaryColor : "hsl(var(--border))",
                        background: checked ? `${theme.primaryColor}10` : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${p.id}`}
                        className="mt-1"
                        checked={checked}
                        onChange={() => setSelecao((s) => ({ ...s, [p.id]: a.id }))}
                        style={{ accentColor: theme.primaryColor }}
                      />
                      <span className="flex-1">{a.texto}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <div className="flex justify-end">
        <Button
          onClick={enviar}
          disabled={!todasRespondidas || enviando}
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
          style={{ background: theme.primaryColor, color: "#fff" }}
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Ver meu resultado
        </Button>
      </div>
      {!todasRespondidas && (
        <p className="text-xs text-muted-foreground text-right">
          Responda todas as questões para ver o resultado.
        </p>
      )}
    </div>
  );
};

export default QuizAutoavaliacao;
