import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, StickyNote, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { escolaBranding as branding } from "@/pages/escola/EscolaAlunoShell";
import type { AlunoRow } from "@/hooks/useEscolaAluno";

type Postit = {
  id: string;
  aluno_id: string | null;
  conteudo: string;
  created_at: string | null;
  parent_id: string | null;
  autor?: { nome_completo: string | null; foto_url: string | null } | null;
};

const formatRelative = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const MuralTurma = ({ aluno }: { aluno: AlunoRow }) => {
  const turmaId = aluno.turma_id;
  const [postits, setPostits] = useState<Postit[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState("");
  const [respostaPara, setRespostaPara] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!turmaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("escola_postits")
      .select("id,aluno_id,conteudo,created_at,parent_id")
      .eq("turma_id", turmaId)
      .order("created_at", { ascending: true });
    const rows = (data ?? []) as Postit[];

    const ids = Array.from(new Set(rows.map((r) => r.aluno_id).filter((v): v is string => !!v)));
    const colegasMap: Record<string, { nome_completo: string | null; foto_url: string | null }> = {};
    if (ids.length > 0) {
      const { data: colegas } = await supabase
        .from("escola_colegas" as any)
        .select("id,nome_completo,foto_url")
        .in("id", ids);
      (colegas ?? []).forEach((c: any) => {
        colegasMap[c.id] = { nome_completo: c.nome_completo, foto_url: c.foto_url };
      });
    }
    rows.forEach((r) => {
      r.autor = r.aluno_id ? colegasMap[r.aluno_id] ?? null : null;
    });
    setPostits(rows);
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    load();
  }, [load]);

  const colar = async () => {
    if (!novo.trim() || !turmaId) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({ turma_id: turmaId, aluno_id: aluno.id, conteudo: novo.trim() });
    setPosting(false);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      setNovo("");
      load();
    }
  };

  const responder = async (parentId: string) => {
    if (!respostaTexto.trim() || !turmaId) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({
        turma_id: turmaId,
        aluno_id: aluno.id,
        conteudo: respostaTexto.trim(),
        parent_id: parentId,
      });
    setPosting(false);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      setRespostaTexto("");
      setRespostaPara(null);
      load();
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Apagar este post-it?")) return;
    const { error } = await supabase.from("escola_postits").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else load();
  };

  if (!turmaId) return null;

  const principais = postits.filter((p) => !p.parent_id);
  const respostasDe = (parentId: string) => postits.filter((p) => p.parent_id === parentId);
  const authorName = (p: Postit) => p.autor?.nome_completo?.split(" ")[0] ?? "Aluno";

  return (
    <section className="space-y-4">
      <div className="pl-3 border-l-4 flex items-center gap-2" style={{ borderColor: branding.primaryColor }}>
        <StickyNote className="w-5 h-5" style={{ color: branding.primaryColor }} />
        <div>
          <h2 className="font-serif text-xl font-bold italic" style={{ color: branding.darkColor }}>
            Mural da turma
          </h2>
          <p className="text-sm text-muted-foreground">Post-its visíveis para todos da turma — leve e livre.</p>
        </div>
      </div>

      <div
        className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-2"
        style={{ borderColor: `${branding.primaryColor}33` }}
      >
        <Textarea
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          rows={2}
          placeholder="Cole um post-it para a turma…"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={colar}
            disabled={posting || !novo.trim()}
            className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
            style={{ background: branding.primaryColor, color: "#fff" }}
          >
            <Send className="w-4 h-4" /> Colar
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : principais.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Seja o primeiro a colar um post-it.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {principais.map((p) => {
            const respostas = respostasDe(p.id);
            const own = p.aluno_id === aluno.id;
            return (
              <div key={p.id} className="space-y-2">
                <div
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-4 shadow-sm"
                  style={{ background: `${branding.primaryColor}10` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-muted-foreground">
                    <span className="font-medium" style={{ color: branding.darkColor }}>{authorName(p)}</span>
                    <span>{formatRelative(p.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap font-serif italic" style={{ color: branding.darkColor }}>
                    {p.conteudo}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRespostaPara(respostaPara === p.id ? null : p.id);
                        setRespostaTexto("");
                      }}
                      className="text-[11px] inline-flex items-center gap-1"
                      style={{ color: branding.primaryColor }}
                    >
                      <MessageCircle className="w-3 h-3" /> responder
                    </button>
                    {own && (
                      <button
                        type="button"
                        onClick={() => remover(p.id)}
                        className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" /> apagar
                      </button>
                    )}
                  </div>
                </div>

                {respostas.length > 0 && (
                  <div className="pl-6 space-y-2">
                    {respostas.map((r) => {
                      const ownR = r.aluno_id === aluno.id;
                      return (
                        <div
                          key={r.id}
                          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border bg-white p-3"
                          style={{ borderColor: `${branding.primaryColor}22` }}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
                            <span className="font-medium" style={{ color: branding.darkColor }}>{authorName(r)}</span>
                            <span>{formatRelative(r.created_at)}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-foreground/85">{r.conteudo}</p>
                          {ownR && (
                            <button
                              type="button"
                              onClick={() => remover(r.id)}
                              className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-destructive mt-1"
                            >
                              <Trash2 className="w-3 h-3" /> apagar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {respostaPara === p.id && (
                  <div className="pl-6">
                    <div
                      className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border bg-white p-3 space-y-2"
                      style={{ borderColor: `${branding.primaryColor}33` }}
                    >
                      <Input
                        value={respostaTexto}
                        onChange={(e) => setRespostaTexto(e.target.value)}
                        placeholder="Sua resposta…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") responder(p.id);
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setRespostaPara(null)}>cancelar</Button>
                        <Button
                          size="sm"
                          onClick={() => responder(p.id)}
                          disabled={posting || !respostaTexto.trim()}
                          style={{ background: branding.primaryColor, color: "#fff" }}
                        >
                          enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MuralTurma;
