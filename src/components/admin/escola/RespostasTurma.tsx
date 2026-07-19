import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, XCircle } from "lucide-react";

type Pergunta = { id: string; pergunta: string; ordem: number | null };
type Alt = { id: string; pergunta_id: string; texto: string; correta: boolean; ordem: number | null };
type Resp = { aluno_id: string; pergunta_id: string; alternativa_id: string | null };
type Aluno = { id: string; nome_completo: string; email: string };

interface Props {
  moduloId: string;
  turmaId: string | null;
}

const RespostasTurma = ({ moduloId, turmaId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [altsMap, setAltsMap] = useState<Record<string, Alt[]>>({});
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [respostas, setRespostas] = useState<Resp[]>([]);
  const [aberto, setAberto] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase
      .from("escola_avaliacao_perguntas")
      .select("id,pergunta,ordem")
      .eq("modulo_id", moduloId)
      .order("ordem", { ascending: true });
    const perg = (pData ?? []) as Pergunta[];
    setPerguntas(perg);

    if (perg.length === 0) {
      setAltsMap({});
      setAlunos([]);
      setRespostas([]);
      setLoading(false);
      return;
    }

    const pIds = perg.map((p) => p.id);
    const [{ data: aData }, alunosQ, { data: rData }] = await Promise.all([
      supabase
        .from("escola_avaliacao_alternativas")
        .select("id,pergunta_id,texto,correta,ordem")
        .in("pergunta_id", pIds)
        .order("ordem", { ascending: true }),
      turmaId
        ? supabase
            .from("escola_alunos")
            .select("id,nome_completo,email")
            .eq("turma_id", turmaId)
            .eq("status", "aprovado")
            .order("nome_completo", { ascending: true })
        : Promise.resolve({ data: [] as any[] }),
      supabase
        .from("escola_avaliacao_respostas")
        .select("aluno_id,pergunta_id,alternativa_id")
        .in("pergunta_id", pIds),
    ]);

    const map: Record<string, Alt[]> = {};
    ((aData ?? []) as Alt[]).forEach((a) => {
      (map[a.pergunta_id] ??= []).push(a);
    });
    setAltsMap(map);
    setAlunos(((alunosQ as any).data ?? []) as Aluno[]);
    setRespostas((rData ?? []) as Resp[]);
    setLoading(false);
  }, [moduloId, turmaId]);

  useEffect(() => {
    load();
  }, [load]);

  const acertosDoAluno = (alunoId: string) => {
    let acertos = 0;
    for (const p of perguntas) {
      const r = respostas.find((x) => x.aluno_id === alunoId && x.pergunta_id === p.id);
      if (!r?.alternativa_id) continue;
      const alt = (altsMap[p.id] ?? []).find((a) => a.id === r.alternativa_id);
      if (alt?.correta) acertos++;
    }
    return acertos;
  };

  const respondidas = (alunoId: string) =>
    respostas.filter((r) => r.aluno_id === alunoId && r.alternativa_id).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading italic flex items-center gap-2">
          <Users className="w-4 h-4" /> Respostas da turma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : perguntas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cadastre questões acima para ver as respostas.
          </p>
        ) : alunos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum aluno aprovado na turma deste módulo.
          </p>
        ) : (
          <div className="space-y-2">
            {alunos.map((a) => {
              const total = perguntas.length;
              const feitas = respondidas(a.id);
              const acertos = acertosDoAluno(a.id);
              const isOpen = aberto[a.id] ?? false;
              return (
                <div key={a.id} className="rounded-lg border border-border bg-card">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/40"
                    onClick={() => setAberto((s) => ({ ...s, [a.id]: !isOpen }))}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.nome_completo || a.email}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {feitas === 0 ? (
                        <Badge variant="outline" className="text-xs">
                          Não respondeu
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {acertos}/{total} acertos
                        </Badge>
                      )}
                    </div>
                  </button>
                  {isOpen && feitas > 0 && (
                    <div className="border-t border-border p-3 space-y-2">
                      {perguntas.map((p, i) => {
                        const alts = altsMap[p.id] ?? [];
                        const r = respostas.find(
                          (x) => x.aluno_id === a.id && x.pergunta_id === p.id,
                        );
                        const marcada = alts.find((x) => x.id === r?.alternativa_id);
                        const correta = alts.find((x) => x.correta);
                        const acertou = marcada && marcada.correta;
                        return (
                          <div key={p.id} className="rounded-md border border-border p-2">
                            <p className="text-xs font-medium">
                              {i + 1}. {p.pergunta}
                            </p>
                            <div className="mt-1 text-xs flex items-start gap-2">
                              {marcada ? (
                                acertou ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                              <span className="text-muted-foreground">
                                Marcou:{" "}
                                <span className="text-foreground">
                                  {marcada?.texto ?? "não respondeu"}
                                </span>
                                {marcada && !acertou && correta && (
                                  <>
                                    {" "}
                                    · Correta:{" "}
                                    <span className="text-foreground">{correta.texto}</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RespostasTurma;
