import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Copy, ExternalLink, Plus, Printer, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { getIconeLucide, iconesLucide } from "@/lib/iconesLucide";
import AtividadeRelatorio from "@/components/atividades/AtividadeRelatorio";
import { ddmm, mensagemMotivo, rpc, type Atividade, type Pergunta } from "@/components/atividades/base";

const db = supabase as any;
const TEMA = { primaryColor: "#352F54", darkColor: "#352F54", lightColor: "#FFF8EE" };

type Lugar = { tipo: "formacao" | "cursos"; id: string | null };
type Aba = { id: string; escola_modulo_id: string | null; curso_id: string | null; titulo: string; icone: string | null; ordem: number; ativa: boolean };
type AtivRow = Atividade & { aba_id: string | null; ordem: number };
type PergRow = Pergunta & { atividade_id: string; ativa: boolean };

const TIPOS: [string, string][] = [
  ["informativo", "Texto"],
  ["teste_dosha", "Teste de dosha"],
  ["texto_curto", "Resposta curta"],
  ["texto_longo", "Resposta longa"],
  ["numero", "Número"],
  ["escolha_unica", "Uma escolha"],
  ["multipla", "Várias escolhas"],
  ["matriz", "Quadro"],
  ["foto", "Foto"],
  ["arquivo", "Arquivo"],
];
const EXEMPLOS: Record<string, unknown> = {
  matriz: {
    linhas: [{ valor: "rasa", rotulo: "Rasa" }, { valor: "rakta", rotulo: "Rakta" }],
    colunas: [{ valor: "vata", rotulo: "Vata", dosha: "vata" }, { valor: "pitta", rotulo: "Pitta", dosha: "pitta" }, { valor: "kapha", rotulo: "Kapha", dosha: "kapha" }, { valor: "saudavel", rotulo: "Saudáveis", exclusiva: true }],
    varias_por_linha: true,
  },
  numero: { unidade: "kg", rotulo_relatorio: "IMC", faixas: [{ menor_que: 18.5, rotulo: "Baixo", dosha: "vata" }, { menor_que: 25, rotulo: "Normal" }, { rotulo: "Alto", dosha: "kapha" }] },
  foto: { fotos: [{ valor: "frente", rotulo: "De frente" }, { valor: "lado", rotulo: "De lado" }] },
  multipla: { grupos: [{ titulo: "Brimhana", subtitulo: "Nutrir", valores: ["abhyanga", "padabhyanga"] }, { titulo: "Shodhana", subtitulo: "Limpar", valores: ["basti", "nasya"] }] },
  arquivo: { aceita: "audio/*,application/pdf", quantidade: 2 },
};
const AJUDA_ORDEM =
  "Formação: 10 Aulas, 20 Material prévio, 30 Rotina, 40 Avaliação, 50 Trocas. Cursos: 10 Aulas, 20 Material, 30 Língua, 40 Tutor, 50 Certificado. Ex.: 45 fica entre a 4ª e a 5ª; 60 fica no fim.";

const parseJson = (t: string): { ok: true; v: any } | { ok: false } => {
  if (!t.trim()) return { ok: true, v: {} };
  try {
    return { ok: true, v: JSON.parse(t) };
  } catch {
    return { ok: false };
  }
};
const erroToast = (e: any) => toast({ title: "Não foi possível salvar", description: e?.message ?? String(e), variant: "destructive" });

const CampoJson = ({ valor, onChange, exemplo }: { valor: string; onChange: (t: string) => void; exemplo?: unknown }) => {
  const ok = parseJson(valor).ok;
  return (
    <div className="space-y-1">
      <Textarea rows={5} value={valor} onChange={(e) => onChange(e.target.value)} className={`font-mono text-xs ${ok ? "" : "border-destructive"}`} />
      <div className="flex items-center gap-2 text-xs">
        {!ok && <span className="font-semibold text-destructive">JSON inválido</span>}
        {exemplo !== undefined && (
          <button type="button" className="underline" onClick={() => onChange(JSON.stringify(exemplo, null, 2))}>
            Usar exemplo
          </button>
        )}
      </div>
    </div>
  );
};

// ============ ABAS ============
const AbasSecao = ({ lugar, abas, recarregar, slugLugar }: { lugar: Lugar; abas: Aba[]; recarregar: () => void; slugLugar: string | null }) => {
  const [editando, setEditando] = useState<Record<string, Aba>>({});
  const nova = async () => {
    const { error } = await db.from("atividade_abas").insert({
      titulo: "Nova aba",
      icone: "ClipboardList",
      ordem: 60,
      ativa: false,
      escola_modulo_id: lugar.tipo === "formacao" ? lugar.id : null,
      curso_id: lugar.tipo === "cursos" ? lugar.id : null,
    });
    if (error) return erroToast(error);
    recarregar();
  };
  const salvar = async (a: Aba) => {
    const { error } = await db.from("atividade_abas").update({ titulo: a.titulo, icone: a.icone, ordem: Number(a.ordem) || 0, ativa: a.ativa }).eq("id", a.id);
    if (error) return erroToast(error);
    toast({ title: "Aba salva" });
    setEditando((e) => {
      const n = { ...e };
      delete n[a.id];
      return n;
    });
    recarregar();
  };
  const apagar = async (a: Aba) => {
    if (!confirm(`Apagar a aba "${a.titulo}"? As atividades dela ficam sem aba.`)) return;
    await db.from("atividades").update({ aba_id: null }).eq("aba_id", a.id);
    const { error } = await db.from("atividade_abas").delete().eq("id", a.id);
    if (error) return erroToast(error);
    recarregar();
  };
  const linkAluno = (a: Aba) =>
    lugar.tipo === "formacao" ? `/escola/aluno/modulo/${slugLugar}?tab=aba-${a.id}` : `/cursos/${slugLugar}/estudar?tab=aba-${a.id}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Abas extras do lugar escolhido</CardTitle>
        <Button size="sm" onClick={nova} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nova aba
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {!abas.length && <p className="text-sm text-muted-foreground">Nenhuma aba extra aqui ainda.</p>}
        {abas.map((orig) => {
          const a = editando[orig.id] ?? orig;
          const Ic = getIconeLucide(a.icone);
          const set = (p: Partial<Aba>) => setEditando((e) => ({ ...e, [orig.id]: { ...a, ...p } }));
          const aberto = Boolean(editando[orig.id]);
          return (
            <div key={orig.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Ic className="h-5 w-5" />
                <span className="font-semibold">{orig.titulo}</span>
                <Badge variant="outline">posição {orig.ordem}</Badge>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={orig.ativa}
                    onCheckedChange={async (v) => {
                      const { error } = await db.from("atividade_abas").update({ ativa: v }).eq("id", orig.id);
                      if (error) return erroToast(error);
                      recarregar();
                    }}
                  />
                  {orig.ativa ? "Ligada" : "Desligada"}
                </label>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => (aberto ? setEditando((e) => { const n = { ...e }; delete n[orig.id]; return n; }) : set({}))}>
                    {aberto ? "Fechar" : "Editar"}
                  </Button>
                  {slugLugar && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to={linkAluno(orig)} target="_blank" className="gap-1.5">
                        <ExternalLink className="h-4 w-4" /> Abrir como aluno
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => apagar(orig)}>
                    <Trash2 className="h-4 w-4" /> Apagar
                  </Button>
                </div>
              </div>
              {aberto && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <div>
                      <label className="text-xs font-semibold">Título</label>
                      <Input value={a.titulo} onChange={(e) => set({ titulo: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Posição</label>
                      <Input type="number" value={a.ordem} onChange={(e) => set({ ordem: Number(e.target.value) })} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{AJUDA_ORDEM}</p>
                  <div>
                    <label className="text-xs font-semibold">Ícone</label>
                    <div className="mt-1 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                      {Object.entries(iconesLucide).map(([nome, I]) => (
                        <button
                          key={nome}
                          type="button"
                          onClick={() => set({ icone: nome })}
                          className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] ${a.icone === nome ? "border-primary bg-primary/10" : ""}`}
                        >
                          <I className="h-5 w-5" />
                          {nome}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={a.ativa} onCheckedChange={(v) => set({ ativa: v })} /> Ligada
                  </label>
                  <Button size="sm" onClick={() => salvar(a)} className="gap-1.5">
                    <Save className="h-4 w-4" /> Salvar aba
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ============ ENTREGAS ============
const Entregas = ({ atividade, perguntas }: { atividade: AtivRow; perguntas: PergRow[] }) => {
  const [dados, setDados] = useState<any[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberta, setAberta] = useState<any | null>(null);
  useEffect(() => {
    void rpc("atividade_entregas", { p_atividade_id: atividade.id }).then((d) => {
      if (!d?.ok) return setErro(mensagemMotivo(d?.motivo));
      setDados(d.entregas ?? []);
    });
  }, [atividade.id]);
  if (erro) return <p className="text-sm font-semibold text-destructive">{erro}</p>;
  if (!dados) return <Skeleton className="h-32 w-full" />;
  const n = (s: string) => dados.filter((x) => (x.status ?? "nao_iniciada") === s).length;
  const situacao = (s: string) => (s === "entregue" ? "Entregue" : s === "rascunho" ? "Rascunho" : "Não começou");
  const ativas = perguntas.filter((p) => p.ativa !== false);
  if (aberta)
    return (
      <div className="space-y-3">
        <Button size="sm" variant="outline" onClick={() => setAberta(null)}>
          ← Voltar para as entregas
        </Button>
        <p className="font-semibold">{aberta.nome || aberta.email}</p>
        <AtividadeRelatorio
          atividade={atividade}
          perguntas={ativas}
          respostas={aberta.respostas ?? {}}
          entregueEm={aberta.entregue_em}
          tema={TEMA}
          imprimirHref={`/atividade/${atividade.id}/imprimir?pessoa=${aberta.user_id}`}
        />
      </div>
    );
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">
        {n("entregue")} entregaram · {n("rascunho")} em rascunho · {dados.length - n("entregue") - n("rascunho")} não começaram
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Nome</th>
              <th className="p-2">Email</th>
              <th className="p-2">Situação</th>
              <th className="p-2">Data</th>
              {atividade.tipo === "quiz" && <th className="p-2">Acertos</th>}
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {dados.map((x) => (
              <tr key={x.user_id} className="cursor-pointer border-b hover:bg-muted/50" onClick={() => x.respostas && setAberta(x)}>
                <td className="p-2 font-medium">{x.nome || "—"}</td>
                <td className="p-2">{x.email}</td>
                <td className="p-2">{situacao(x.status)}</td>
                <td className="p-2">{ddmm(x.entregue_em ?? x.atualizada_em)}</td>
                {atividade.tipo === "quiz" && <td className="p-2">{x.resultado ? `${x.resultado.acertos} de ${x.resultado.total}` : "—"}</td>}
                <td className="p-2">
                  {x.respostas && (
                    <Link to={`/atividade/${atividade.id}/imprimir?pessoa=${x.user_id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 underline">
                      <Printer className="h-3.5 w-3.5" /> Imprimir
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============ EDITOR DE PERGUNTA ============
const EditorPergunta = ({
  p,
  quiz,
  onSalvo,
  onSubir,
  onDescer,
  onDuplicar,
  onApagar,
}: {
  p: PergRow;
  quiz: boolean;
  onSalvo: () => void;
  onSubir?: () => void;
  onDescer?: () => void;
  onDuplicar: () => void;
  onApagar: () => void;
}) => {
  const [f, setF] = useState<PergRow>(p);
  const [cfg, setCfg] = useState(JSON.stringify(p.config ?? {}, null, 2));
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    setF(p);
    setCfg(JSON.stringify(p.config ?? {}, null, 2));
  }, [p]);
  const ops = f.opcoes ?? [];
  const setOp = (i: number, patch: any) => setF({ ...f, opcoes: ops.map((o, j) => (j === i ? { ...o, ...patch } : o)) });
  const salvar = async () => {
    const c = parseJson(cfg);
    if (!c.ok) return toast({ title: "Configuração com JSON inválido", variant: "destructive" });
    const { error } = await db
      .from("atividade_perguntas")
      .update({ tipo: f.tipo, codigo: f.codigo, secao: f.secao || null, enunciado: f.enunciado, ajuda: f.ajuda || null, obrigatoria: f.obrigatoria, ativa: f.ativa, opcoes: ops, config: c.v })
      .eq("id", p.id);
    if (error) return erroToast(error);
    toast({ title: "Pergunta salva" });
    onSalvo();
  };
  const nomeTipo = TIPOS.find((t) => t[0] === p.tipo)?.[1] ?? p.tipo;
  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-2 p-2">
        <div className="flex flex-col">
          <button type="button" disabled={!onSubir} onClick={onSubir} className="disabled:opacity-30" aria-label="Subir">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={!onDescer} onClick={onDescer} className="disabled:opacity-30" aria-label="Descer">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setAberto((v) => !v)}>
          <span className="text-xs text-muted-foreground">
            {nomeTipo} · {p.codigo} {p.secao ? `· ${p.secao}` : ""} {!p.ativa && "· desativada"}
          </span>
          <span className="block truncate text-sm font-semibold">{p.enunciado || "(sem enunciado)"}</span>
        </button>
        <Button size="sm" variant="ghost" onClick={onDuplicar} aria-label="Duplicar">
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onApagar} aria-label="Apagar">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {aberto && (
        <div className="space-y-3 border-t p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-semibold">Tipo</label>
              <select className="h-10 w-full rounded-md border px-2" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
                {TIPOS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Código</label>
              <Input value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold">Seção</label>
              <Input value={f.secao ?? ""} onChange={(e) => setF({ ...f, secao: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Enunciado</label>
            <Textarea rows={2} value={f.enunciado ?? ""} onChange={(e) => setF({ ...f, enunciado: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold">Ajuda {f.tipo === "informativo" && "(HTML)"}</label>
            <Textarea rows={f.tipo === "informativo" ? 5 : 2} value={f.ajuda ?? ""} onChange={(e) => setF({ ...f, ajuda: e.target.value })} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.obrigatoria} onCheckedChange={(v) => setF({ ...f, obrigatoria: v })} /> Obrigatória
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.ativa} onCheckedChange={(v) => setF({ ...f, ativa: v })} /> Ativa
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Opções</label>
            {ops.map((o, i) => (
              <div key={i} className="grid gap-2 rounded-md border p-2 sm:grid-cols-[120px_1fr_110px_auto]">
                <Input placeholder="valor" value={o.valor} onChange={(e) => setOp(i, { valor: e.target.value })} />
                <Input placeholder="rótulo" value={o.rotulo} onChange={(e) => setOp(i, { rotulo: e.target.value })} />
                <select className="h-10 rounded-md border px-2" value={o.dosha ?? ""} onChange={(e) => setOp(i, { dosha: e.target.value || null })}>
                  <option value="">Nenhum</option>
                  <option value="vata">Vata</option>
                  <option value="pitta">Pitta</option>
                  <option value="kapha">Kapha</option>
                </select>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setF({ ...f, opcoes: ops.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                {quiz && (
                  <>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={!!o.correta} onCheckedChange={(v) => setOp(i, { correta: v })} /> Correta
                    </label>
                    <Input className="sm:col-span-3" placeholder="explicação" value={o.explicacao ?? ""} onChange={(e) => setOp(i, { explicacao: e.target.value })} />
                  </>
                )}
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setF({ ...f, opcoes: [...ops, { valor: `op${ops.length + 1}`, rotulo: "" }] })}>
              <Plus className="h-4 w-4" /> Opção
            </Button>
          </div>
          <div>
            <label className="text-xs font-semibold">Configuração</label>
            <CampoJson valor={cfg} onChange={setCfg} exemplo={EXEMPLOS[f.tipo]} />
          </div>
          <Button size="sm" onClick={salvar} className="gap-1.5">
            <Save className="h-4 w-4" /> Salvar pergunta
          </Button>
        </div>
      )}
    </div>
  );
};

// ============ EDITOR DE ATIVIDADE ============
const EditorAtividade = ({ a, abas, onMudou, onFechar }: { a: AtivRow; abas: Aba[]; onMudou: () => void; onFechar: () => void }) => {
  const [aba, setAba] = useState<"editar" | "entregas">("editar");
  const [f, setF] = useState<AtivRow>(a);
  const [cfg, setCfg] = useState(JSON.stringify(a.config ?? {}, null, 2));
  const [perguntas, setPerguntas] = useState<PergRow[] | null>(null);
  useEffect(() => {
    setF(a);
    setCfg(JSON.stringify(a.config ?? {}, null, 2));
  }, [a]);
  const carregarPerg = useCallback(async () => {
    const { data } = await db.from("atividade_perguntas").select("*").eq("atividade_id", a.id).order("ordem");
    setPerguntas(data ?? []);
  }, [a.id]);
  useEffect(() => {
    void carregarPerg();
  }, [carregarPerg]);

  const salvar = async () => {
    const c = parseJson(cfg);
    if (!c.ok) return toast({ title: "Configuração com JSON inválido", variant: "destructive" });
    const { error } = await db
      .from("atividades")
      .update({
        titulo: f.titulo,
        subtitulo: f.subtitulo || null,
        slug: f.slug,
        aba_id: f.aba_id || null,
        tipo: f.tipo,
        prazo: f.prazo || null,
        ordem: Number(f.ordem) || 0,
        ativa: f.ativa,
        intro_html: f.intro_html || null,
        mensagem_final: f.mensagem_final || null,
        config: c.v,
      })
      .eq("id", a.id);
    if (error) return erroToast(error);
    toast({ title: "Atividade salva" });
    onMudou();
  };

  const lista = perguntas ?? [];
  const trocar = async (i: number, j: number) => {
    const x = lista[i];
    const y = lista[j];
    const ox = x.ordem ?? i;
    const oy = y.ordem ?? j;
    await db.from("atividade_perguntas").update({ ordem: ox === oy ? j : oy }).eq("id", x.id);
    await db.from("atividade_perguntas").update({ ordem: ox === oy ? i : ox }).eq("id", y.id);
    void carregarPerg();
  };
  const novaPergunta = async () => {
    const ordem = (lista[lista.length - 1]?.ordem ?? 0) + 10;
    const { error } = await db.from("atividade_perguntas").insert({
      atividade_id: a.id,
      codigo: `p${Date.now().toString(36)}`,
      secao: lista[lista.length - 1]?.secao ?? null,
      ordem,
      tipo: "texto_curto",
      enunciado: "Nova pergunta",
      opcoes: [],
      config: {},
      obrigatoria: false,
      ativa: true,
    });
    if (error) return erroToast(error);
    void carregarPerg();
  };
  const duplicarPergunta = async (p: PergRow) => {
    const { id, ...resto } = p as any;
    delete resto.created_at;
    delete resto.updated_at;
    const { error } = await db.from("atividade_perguntas").insert({ ...resto, codigo: `${p.codigo}_copia`, ordem: (p.ordem ?? 0) + 1 });
    if (error) return erroToast(error);
    void carregarPerg();
  };
  const apagarPergunta = async (p: PergRow) => {
    if (!confirm(`Apagar a pergunta "${p.enunciado || p.codigo}"?`)) return;
    const { error } = await db.from("atividade_perguntas").delete().eq("id", p.id);
    if (error) return erroToast(error);
    void carregarPerg();
  };

  return (
    <Card className="border-primary/40">
      <CardHeader className="flex flex-row flex-wrap items-center gap-2 space-y-0">
        <CardTitle className="mr-auto text-lg">{a.titulo}</CardTitle>
        <Button size="sm" variant={aba === "editar" ? "default" : "outline"} onClick={() => setAba("editar")}>
          Editar
        </Button>
        <Button size="sm" variant={aba === "entregas" ? "default" : "outline"} onClick={() => setAba("entregas")}>
          Entregas
        </Button>
        <Button size="sm" variant="ghost" onClick={onFechar}>
          Fechar
        </Button>
      </CardHeader>
      <CardContent>
        {aba === "entregas" ? (
          perguntas ? <Entregas atividade={a} perguntas={perguntas} /> : <Skeleton className="h-24" />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold">Título</label>
                <Input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold">Subtítulo</label>
                <Input value={f.subtitulo ?? ""} onChange={(e) => setF({ ...f, subtitulo: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold">Slug</label>
                <Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold">Aba</label>
                <select className="h-10 w-full rounded-md border px-2" value={f.aba_id ?? ""} onChange={(e) => setF({ ...f, aba_id: e.target.value || null })}>
                  <option value="">Sem aba</option>
                  {abas.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold">Tipo</label>
                <select className="h-10 w-full rounded-md border px-2" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as "ficha" | "quiz" })}>
                  <option value="ficha">Ficha</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold">Prazo</label>
                  <Input type="date" value={f.prazo ?? ""} onChange={(e) => setF({ ...f, prazo: e.target.value || null })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Ordem</label>
                  <Input type="number" value={f.ordem ?? 0} onChange={(e) => setF({ ...f, ordem: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={f.ativa} onCheckedChange={(v) => setF({ ...f, ativa: v })} /> Ligada
            </label>
            <div>
              <label className="text-xs font-semibold">Introdução (HTML)</label>
              <Textarea rows={4} value={f.intro_html ?? ""} onChange={(e) => setF({ ...f, intro_html: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold">Mensagem final</label>
              <Textarea rows={3} value={f.mensagem_final ?? ""} onChange={(e) => setF({ ...f, mensagem_final: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold">Configuração</label>
              <CampoJson
                valor={cfg}
                onChange={setCfg}
                exemplo={{ paginacao: "secao", texto_entregar: "Entregar a ficha", relatorio: { titulo: "Meu relatório", cabecalho: [], destaques: [] } }}
              />
            </div>
            <Button onClick={salvar} className="gap-1.5">
              <Save className="h-4 w-4" /> Salvar atividade
            </Button>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Perguntas ({lista.length})</p>
                <Button size="sm" onClick={novaPergunta} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Nova pergunta
                </Button>
              </div>
              {!perguntas && <Skeleton className="h-20" />}
              {lista.map((p, i) => (
                <EditorPergunta
                  key={p.id}
                  p={p}
                  quiz={f.tipo === "quiz"}
                  onSalvo={carregarPerg}
                  onSubir={i > 0 ? () => trocar(i, i - 1) : undefined}
                  onDescer={i < lista.length - 1 ? () => trocar(i, i + 1) : undefined}
                  onDuplicar={() => duplicarPergunta(p)}
                  onApagar={() => apagarPergunta(p)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ PÁGINA ============
const AdminAtividades = () => {
  const [sp, setSp] = useSearchParams();
  const lugar: Lugar = sp.get("curso_id")
    ? { tipo: "cursos", id: sp.get("curso_id") }
    : { tipo: sp.get("tipo") === "cursos" ? "cursos" : "formacao", id: sp.get("escola_modulo_id") };
  const [modulos, setModulos] = useState<{ id: string; numero: number; titulo: string; slug: string | null }[]>([]);
  const [cursos, setCursos] = useState<{ id: string; slug: string; titulo: string }[]>([]);
  const [abas, setAbas] = useState<Aba[]>([]);
  const [ativs, setAtivs] = useState<AtivRow[] | null>(null);
  const [contagem, setContagem] = useState<Record<string, number>>({});
  const [aberta, setAberta] = useState<string | null>(null);

  useEffect(() => {
    void db.from("escola_modulos").select("id,numero,titulo,slug").order("numero").then(({ data }: any) => setModulos(data ?? []));
    void db.from("cursos").select("id,slug,titulo").order("titulo").then(({ data }: any) => setCursos(data ?? []));
  }, []);

  const coluna = lugar.tipo === "formacao" ? "escola_modulo_id" : "curso_id";
  const carregar = useCallback(async () => {
    if (!lugar.id) {
      setAbas([]);
      setAtivs([]);
      return;
    }
    const [{ data: a }, { data: t }] = await Promise.all([
      db.from("atividade_abas").select("*").eq(coluna, lugar.id).order("ordem"),
      db.from("atividades").select("*").eq(coluna, lugar.id).order("ordem"),
    ]);
    setAbas(a ?? []);
    setAtivs(t ?? []);
    const ids = (t ?? []).map((x: any) => x.id);
    if (ids.length) {
      const { data: ps } = await db.from("atividade_perguntas").select("atividade_id").in("atividade_id", ids);
      const c: Record<string, number> = {};
      for (const p of ps ?? []) c[p.atividade_id] = (c[p.atividade_id] ?? 0) + 1;
      setContagem(c);
    } else setContagem({});
  }, [coluna, lugar.id]);
  useEffect(() => {
    void carregar();
  }, [carregar]);

  const escolher = (tipo: Lugar["tipo"], id: string | null) => {
    const n = new URLSearchParams();
    if (tipo === "cursos") {
      n.set("tipo", "cursos");
      if (id) n.set("curso_id", id);
    } else if (id) n.set("escola_modulo_id", id);
    setSp(n, { replace: true });
    setAberta(null);
  };

  const slugLugar = useMemo(
    () => (lugar.tipo === "formacao" ? modulos.find((m) => m.id === lugar.id)?.slug ?? null : cursos.find((c) => c.id === lugar.id)?.slug ?? null),
    [lugar.tipo, lugar.id, modulos, cursos],
  );

  const novaAtividade = async () => {
    const { data, error } = await db
      .from("atividades")
      .insert({
        titulo: "Nova atividade",
        slug: `atividade-${Date.now().toString(36)}`,
        tipo: "ficha",
        ativa: false,
        ordem: ((ativs ?? []).length + 1) * 10,
        config: { paginacao: "secao" },
        [coluna]: lugar.id,
        aba_id: abas[0]?.id ?? null,
      })
      .select("id")
      .single();
    if (error) return erroToast(error);
    await carregar();
    setAberta(data.id);
  };

  const duplicar = async (a: AtivRow) => {
    const agora = new Date();
    const carimbo = agora.toISOString().slice(0, 16).replace(/[-:T]/g, "");
    const { id, ...resto } = a as any;
    delete resto.created_at;
    delete resto.updated_at;
    const { data: nova, error } = await db
      .from("atividades")
      .insert({ ...resto, ativa: false, slug: `${a.slug}-copia-${carimbo}`, titulo: `${a.titulo} (cópia)` })
      .select("id")
      .single();
    if (error) return erroToast(error);
    const { data: ps } = await db.from("atividade_perguntas").select("*").eq("atividade_id", id);
    if (ps?.length) {
      const linhas = ps.map((p: any) => {
        const { id: _i, created_at: _c, updated_at: _u, ...r } = p;
        return { ...r, atividade_id: nova.id };
      });
      const { error: e2 } = await db.from("atividade_perguntas").insert(linhas);
      if (e2) erroToast(e2);
    }
    toast({ title: "Atividade duplicada (desligada)" });
    void carregar();
  };

  const atividadeAberta = (ativs ?? []).find((a) => a.id === aberta);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <h1 className="font-serif text-2xl font-bold">Atividades</h1>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex gap-2">
              <Button size="sm" variant={lugar.tipo === "formacao" ? "default" : "outline"} onClick={() => escolher("formacao", null)}>
                Formação
              </Button>
              <Button size="sm" variant={lugar.tipo === "cursos" ? "default" : "outline"} onClick={() => escolher("cursos", null)}>
                Cursos
              </Button>
            </div>
            <select className="h-10 w-full rounded-md border px-2" value={lugar.id ?? ""} onChange={(e) => escolher(lugar.tipo, e.target.value || null)}>
              <option value="">{lugar.tipo === "formacao" ? "Escolha o módulo" : "Escolha o curso"}</option>
              {lugar.tipo === "formacao"
                ? modulos.map((m) => (
                    <option key={m.id} value={m.id}>
                      Módulo {m.numero}: {m.titulo}
                    </option>
                  ))
                : cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  ))}
            </select>
            <p className="text-sm text-muted-foreground">A turma vê quando a aba e a atividade estão ligadas.</p>
          </CardContent>
        </Card>

        {lugar.id && (
          <>
            <AbasSecao lugar={lugar} abas={abas} recarregar={carregar} slugLugar={slugLugar} />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Atividades do lugar escolhido</CardTitle>
                <Button size="sm" onClick={novaAtividade} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Nova atividade
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {!ativs && <Skeleton className="h-20" />}
                {ativs && !ativs.length && <p className="text-sm text-muted-foreground">Nenhuma atividade aqui ainda.</p>}
                {(ativs ?? []).map((a) => (
                  <div key={a.id} className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${aberta === a.id ? "border-primary" : ""}`}>
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setAberta(a.id)}>
                      <span className="block font-semibold">{a.titulo}</span>
                      <span className="text-xs text-muted-foreground">
                        {abas.find((x) => x.id === a.aba_id)?.titulo ?? "Sem aba"} · {a.tipo === "quiz" ? "Quiz" : "Ficha"}
                        {a.prazo ? ` · até ${ddmm(a.prazo)}` : ""} · {contagem[a.id] ?? 0} perguntas
                      </span>
                    </button>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={a.ativa}
                        onCheckedChange={async (v) => {
                          const { error } = await db.from("atividades").update({ ativa: v }).eq("id", a.id);
                          if (error) return erroToast(error);
                          void carregar();
                        }}
                      />
                      {a.ativa ? "Ligada" : "Desligada"}
                    </label>
                    <Button size="sm" variant="outline" onClick={() => duplicar(a)} className="gap-1.5">
                      <Copy className="h-4 w-4" /> Duplicar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {atividadeAberta && <EditorAtividade key={atividadeAberta.id} a={atividadeAberta} abas={abas} onMudou={carregar} onFechar={() => setAberta(null)} />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAtividades;
