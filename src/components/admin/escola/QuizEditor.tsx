import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Alternativa = {
  id: string;
  pergunta_id: string;
  texto: string;
  correta: boolean;
  explicacao: string | null;
  ordem: number | null;
};

type Pergunta = {
  id: string;
  modulo_id: string;
  pergunta: string;
  explicacao_geral: string | null;
  ordem: number | null;
  tipo: string;
};

interface Props {
  moduloId: string;
  onChange?: () => void;
}

const QuizEditor = ({ moduloId, onChange }: Props) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [alternativas, setAlternativas] = useState<Record<string, Alternativa[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase
      .from("escola_avaliacao_perguntas")
      .select("id,modulo_id,pergunta,explicacao_geral,ordem,tipo")
      .eq("modulo_id", moduloId)
      .order("ordem", { ascending: true });
    const perg = (pData ?? []) as Pergunta[];
    setPerguntas(perg);

    if (perg.length > 0) {
      const { data: aData } = await supabase
        .from("escola_avaliacao_alternativas")
        .select("id,pergunta_id,texto,correta,explicacao,ordem")
        .in("pergunta_id", perg.map((p) => p.id))
        .order("ordem", { ascending: true });
      const map: Record<string, Alternativa[]> = {};
      perg.forEach((p) => (map[p.id] = []));
      ((aData ?? []) as Alternativa[]).forEach((a) => {
        (map[a.pergunta_id] ??= []).push(a);
      });
      setAlternativas(map);
    } else {
      setAlternativas({});
    }
    setLoading(false);
  }, [moduloId]);

  useEffect(() => {
    load();
  }, [load]);

  // Perguntas
  const addPergunta = async () => {
    const { data, error } = await supabase
      .from("escola_avaliacao_perguntas")
      .insert({
        modulo_id: moduloId,
        pergunta: "Nova pergunta",
        ordem: perguntas.length,
        tipo: "multipla_escolha",
      })
      .select("id")
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Erro", description: error?.message });
      return;
    }
    // Seed 2 alternativas
    await supabase.from("escola_avaliacao_alternativas").insert([
      { pergunta_id: data.id, texto: "Alternativa 1", correta: true, ordem: 0 },
      { pergunta_id: data.id, texto: "Alternativa 2", correta: false, ordem: 1 },
    ]);
    setExpanded((s) => ({ ...s, [data.id]: true }));
    onChange?.();
    load();
  };

  const updatePerguntaLocal = (id: string, patch: Partial<Pergunta>) =>
    setPerguntas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const persistPergunta = async (p: Pergunta) => {
    const { error } = await supabase
      .from("escola_avaliacao_perguntas")
      .update({ pergunta: p.pergunta, explicacao_geral: p.explicacao_geral })
      .eq("id", p.id);
    if (error) toast({ title: "Erro", description: error.message });
    else onChange?.();
  };

  const removePergunta = async (id: string) => {
    if (!confirm("Remover esta questão e todas as suas alternativas?")) return;
    await supabase.from("escola_avaliacao_alternativas").delete().eq("pergunta_id", id);
    const { error } = await supabase.from("escola_avaliacao_perguntas").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      onChange?.();
      load();
    }
  };

  // Alternativas
  const addAlternativa = async (perguntaId: string) => {
    const atuais = alternativas[perguntaId] ?? [];
    if (atuais.length >= 5) return;
    const { error } = await supabase.from("escola_avaliacao_alternativas").insert({
      pergunta_id: perguntaId,
      texto: "Nova alternativa",
      correta: false,
      ordem: atuais.length,
    });
    if (error) toast({ title: "Erro", description: error.message });
    else load();
  };

  const updateAltLocal = (id: string, perguntaId: string, patch: Partial<Alternativa>) =>
    setAlternativas((prev) => ({
      ...prev,
      [perguntaId]: (prev[perguntaId] ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));

  const persistAlt = async (a: Alternativa) => {
    const { error } = await supabase
      .from("escola_avaliacao_alternativas")
      .update({ texto: a.texto, explicacao: a.explicacao })
      .eq("id", a.id);
    if (error) toast({ title: "Erro", description: error.message });
  };

  const marcarCorreta = async (perguntaId: string, altId: string) => {
    const atuais = alternativas[perguntaId] ?? [];
    setAlternativas((prev) => ({
      ...prev,
      [perguntaId]: atuais.map((a) => ({ ...a, correta: a.id === altId })),
    }));
    // Zera todas e marca a escolhida
    await supabase
      .from("escola_avaliacao_alternativas")
      .update({ correta: false })
      .eq("pergunta_id", perguntaId);
    const { error } = await supabase
      .from("escola_avaliacao_alternativas")
      .update({ correta: true })
      .eq("id", altId);
    if (error) toast({ title: "Erro", description: error.message });
  };

  const removerAlt = async (id: string, perguntaId: string) => {
    const atuais = alternativas[perguntaId] ?? [];
    if (atuais.length <= 2) {
      toast({ title: "A questão precisa de pelo menos 2 alternativas." });
      return;
    }
    const { error } = await supabase.from("escola_avaliacao_alternativas").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else load();
  };

  const isCompleta = (perguntaId: string) => {
    const arr = alternativas[perguntaId] ?? [];
    return arr.length >= 2 && arr.filter((a) => a.correta).length === 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading italic flex items-center gap-2">
          <FileText className="w-4 h-4" /> Autoavaliação (quiz)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Múltipla escolha com gabarito e explicação. O aluno vê o resultado ao terminar e você pode acompanhar as respostas da turma abaixo.
        </p>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : perguntas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma questão cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {perguntas.map((p, idx) => {
              const alts = alternativas[p.id] ?? [];
              const completa = isCompleta(p.id);
              const isOpen = expanded[p.id] ?? false;
              return (
                <div key={p.id} className="rounded-lg border border-border bg-card">
                  <div className="p-3 flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setExpanded((s) => ({ ...s, [p.id]: !isOpen }))}
                      className="mt-1 text-muted-foreground hover:text-foreground"
                      aria-label={isOpen ? "Recolher" : "Expandir"}
                    >
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="text-sm text-muted-foreground mt-1 tabular-nums">{idx + 1}.</span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium truncate">{p.pergunta || "Sem enunciado"}</p>
                      <div className="flex items-center gap-2 text-xs">
                        {completa ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <CheckCircle2 className="w-3 h-3" /> completa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-3 h-3" /> incompleta (2+ alternativas e 1 correta)
                          </span>
                        )}
                        <span className="text-muted-foreground">· {alts.length} alt.</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removePergunta(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="border-t border-border p-3 space-y-3 bg-muted/20">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Enunciado</label>
                        <Textarea
                          value={p.pergunta}
                          onChange={(e) => updatePerguntaLocal(p.id, { pergunta: e.target.value })}
                          onBlur={() => persistPergunta(p)}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Alternativas</label>
                        {alts.map((a, i) => (
                          <div
                            key={a.id}
                            className="rounded-md border border-border bg-background p-2 space-y-2"
                          >
                            <div className="flex items-start gap-2">
                              <button
                                type="button"
                                onClick={() => marcarCorreta(p.id, a.id)}
                                className="mt-2 shrink-0"
                                title={a.correta ? "Correta" : "Marcar como correta"}
                              >
                                {a.correta ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0 space-y-2">
                                <Input
                                  value={a.texto}
                                  onChange={(e) =>
                                    updateAltLocal(a.id, p.id, { texto: e.target.value })
                                  }
                                  onBlur={() => persistAlt(a)}
                                  placeholder={`Alternativa ${i + 1}`}
                                />
                                <Textarea
                                  value={a.explicacao ?? ""}
                                  onChange={(e) =>
                                    updateAltLocal(a.id, p.id, { explicacao: e.target.value })
                                  }
                                  onBlur={() => persistAlt(a)}
                                  placeholder="Por quê? (explicação mostrada no resultado)"
                                  rows={2}
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removerAlt(a.id, p.id)}
                                title="Remover alternativa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {alts.length < 5 && (
                          <Button size="sm" variant="outline" onClick={() => addAlternativa(p.id)}>
                            <Plus className="w-4 h-4" /> adicionar alternativa
                          </Button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Comentário geral (opcional)
                        </label>
                        <Textarea
                          value={p.explicacao_geral ?? ""}
                          onChange={(e) =>
                            updatePerguntaLocal(p.id, { explicacao_geral: e.target.value })
                          }
                          onBlur={() => persistPergunta(p)}
                          placeholder="Um comentário do professor sobre a questão (aparece no resultado)."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div>
          <Button size="sm" variant="outline" onClick={addPergunta}>
            <Plus className="w-4 h-4" /> adicionar questão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizEditor;
