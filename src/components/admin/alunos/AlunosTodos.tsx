import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Prazo = { rotulo: string; modo: "padrao" | "meses" | "vitalicio" | "data"; meses?: number; padrao?: boolean };
export type ConfigAlunos = { prazos_liberar: Prazo[]; prazos_estender: Prazo[]; tipos: { chave: string; rotulo: string }[]; cursos: { id: string; slug: string; titulo: string; ativo: boolean; padrao_rotulo: string }[] };
export type CursoAluno = { matricula_id: string; curso_id: string; slug: string; titulo: string; status?: string; situacao: string; origem?: string; origem_rotulo?: string; desde?: string | null; expira_em: string | null; vitalicio?: boolean; pct: number | null; aulas_total?: number; aulas_concluidas?: number; ultima_conclusao_em?: string | null; ultima_aula?: { titulo: string; segundos: number; duracao_segundos: number; atualizado_em: string } | null; certificado_em?: string | null; perguntas_tutor?: number; liberacao_id?: string; lote_id?: string };
export type ItemAluno = { chave: string; user_id: string | null; email: string; nome: string | null; ultimo_acesso: string | null; formacao_status: string | null; pendente: boolean; progresso: number | null; cursos: CursoAluno[] };
export type ConviteAluno = { liberacao_id: string; lote_id: string; curso_id: string; titulo: string; tipo: string; expira_em: string | null; vitalicio: boolean; criado_em: string };
export type HistoricoAluno = { id: string; lote_id: string; acao: string; tipo: string; curso: string; status: string; expira_antes: string | null; expira_em: string | null; vitalicio: boolean; email_enviado: boolean; obs: string | null; criado_por: string; criado_em: string };
export type DadosFichaAluno = { tem_conta: boolean; email: string; conta: { user_id: string; email: string; nome: string; conta_criada_em: string | null; ultimo_login: string | null; ultima_atividade: string | null; premium: boolean; premium_ate: string | null; receitas_favoritas: number } | null; formacao: { aluno_id: string; status: string; matricula: string | null; aprovado_em: string | null } | null; cursos: CursoAluno[]; convites: ConviteAluno[]; historico: HistoricoAluno[] };
export async function rpcAlunos<T>(nome: string, params?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(nome as any, params as any);
  if (error) throw new Error(error.message);
  return data as T;
}
export function erroAlunos(error: unknown) { toast.error(error instanceof Error ? error.message : String(error)); }
export function dataAluno(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}
export function acessoAluno(iso?: string | null, agora = new Date()) {
  if (!iso) return "nunca entrou";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "nunca entrou";
  const inicio = (v: Date) => Date.UTC(v.getFullYear(), v.getMonth(), v.getDate());
  const dias = Math.floor((inicio(agora) - inicio(d)) / 86400000);
  if (dias <= 0) return `hoje, ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  if (dias === 1) return "ontem";
  if (dias <= 7) return `há ${dias} dias`;
  return dataAluno(iso);
}
export function tempoAluno(segundos = 0) {
  const n = Math.max(0, Math.floor(segundos));
  const s = String(n % 60).padStart(2, "0");
  const m = Math.floor(n / 60) % 60;
  return n >= 3600 ? `${Math.floor(n / 3600)}:${String(m).padStart(2, "0")}:${s}` : `${String(m).padStart(2, "0")}:${s}`;
}
export function prazoAluno(prazo: Prazo, ate: string) {
  return prazo.modo === "data" ? { modo: "data", ate } : prazo.modo === "meses" ? { modo: "meses", meses: prazo.meses } : { modo: prazo.modo };
}
export function vencimentoAluno(curso: CursoAluno, prazo: Prazo, ate: string, agora = new Date()) {
  if (prazo.modo === "vitalicio") return null;
  if (prazo.modo === "data") return ate || null;
  const atual = curso.expira_em ? new Date(curso.expira_em.length === 10 ? `${curso.expira_em}T12:00:00` : curso.expira_em) : agora;
  const base = atual > agora ? atual : agora;
  const nova = new Date(base);
  const dia = nova.getDate();
  nova.setDate(1);
  nova.setMonth(nova.getMonth() + (prazo.meses ?? 0));
  const ultimo = new Date(nova.getFullYear(), nova.getMonth() + 1, 0).getDate();
  nova.setDate(Math.min(dia, ultimo));
  return `${nova.getFullYear()}-${String(nova.getMonth() + 1).padStart(2, "0")}-${String(nova.getDate()).padStart(2, "0")}`;
}
export function amanhaAluno() { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export const badgeAluno = (situacao: string) => ({
  ativo: "bg-[hsl(var(--therapist-green-soft))] text-[hsl(var(--therapist-green-ink))] border-[hsl(var(--therapist-green))]",
  vence_breve: "bg-[hsl(var(--therapist-yellow-soft))] text-[hsl(var(--therapist-yellow-ink))] border-[hsl(var(--therapist-yellow))]",
  vencido: "bg-destructive/10 text-destructive border-destructive/20",
  cancelado: "bg-muted text-muted-foreground border-border",
  esperando_cadastro: "bg-primary/10 text-primary border-primary/20",
}[situacao] || "bg-muted text-muted-foreground");
export function situacaoAluno(c: CursoAluno, completa = false) {
  if (c.situacao === "cancelado") return "cancelado";
  if (c.situacao === "esperando_cadastro") return "esperando cadastro";
  if (c.vitalicio && completa) return "vitalício";
  const data = dataAluno(c.expira_em);
  const curta = data === "—" ? "" : data.slice(0, 5);
  if (c.situacao === "vence_breve") return completa ? `vence em ${data}` : `vence ${curta}`;
  if (c.situacao === "vencido") return completa ? `venceu em ${data}` : `venceu ${curta}`;
  return completa ? (c.expira_em ? `ativo até ${data}` : "ativo") : c.pct != null ? `${c.pct}%` : "";
}
const filtros = [{ chave: "todos", rotulo: "Todos" }, { chave: "ativo", rotulo: "Ativos" }, { chave: "vence_breve", rotulo: "Vence em 30 dias" }, { chave: "vencido", rotulo: "Vencidos" }, { chave: "esperando_cadastro", rotulo: "Esperando cadastro" }, { chave: "formacao", rotulo: "Formação" }];
function Cursos({ cursos }: { cursos: CursoAluno[] }) {
  return <div className="flex flex-wrap gap-1.5">{cursos.map((c, i) => <Badge key={c.matricula_id || c.liberacao_id || `${c.curso_id}-${i}`} variant="outline" className={`whitespace-normal text-left ${badgeAluno(c.situacao)}`}>{c.titulo}{situacaoAluno(c) && ` · ${situacaoAluno(c)}`}</Badge>)}</div>;
}
function Nome({ aluno }: { aluno: ItemAluno }) {
  return <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={aluno.pendente ? "text-muted-foreground" : "font-semibold"}>{aluno.pendente ? "ainda sem conta" : aluno.nome || aluno.email}</span>{aluno.formacao_status === "aprovado" && <Badge>Formação</Badge>}</div><p className="text-xs text-muted-foreground break-all mt-1">{aluno.email}</p></div>;
}
export default function AlunosTodos({ config, revisao, onAbrir }: { config: ConfigAlunos | null; revisao: number; onAbrir: (chave: string) => void }) {
  const [busca, setBusca] = useState(""); const [debounced, setDebounced] = useState("");
  const [curso, setCurso] = useState("todos"); const [situacao, setSituacao] = useState("todos");
  const [itens, setItens] = useState<ItemAluno[]>([]); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [mais, setMais] = useState(false);
  const geracao = useRef(0); const emCarga = useRef(false);
  useEffect(() => { const timer = setTimeout(() => setDebounced(busca.trim()), 300); return () => clearTimeout(timer); }, [busca]);
  useEffect(() => {
    const seq = ++geracao.current; setLoading(true); setMais(false); emCarga.current = false; setItens([]); setTotal(0);
    rpcAlunos<{ total: number; itens: ItemAluno[] }>("admin_alunos_lista", { p_busca: debounced || null, p_curso_id: curso === "todos" ? null : curso, p_situacao: situacao, p_limite: 50, p_offset: 0 })
      .then((r) => { if (seq === geracao.current) { setItens(r.itens ?? []); setTotal(r.total); } })
      .catch((e) => { if (seq === geracao.current) erroAlunos(e); }).finally(() => { if (seq === geracao.current) setLoading(false); });
    return () => { geracao.current++; };
  }, [debounced, curso, situacao, revisao]);
  async function carregarMais() {
    if (emCarga.current) return;
    emCarga.current = true; setMais(true); const seq = geracao.current;
    try { const r = await rpcAlunos<{ total: number; itens: ItemAluno[] }>("admin_alunos_lista", { p_busca: debounced || null, p_curso_id: curso === "todos" ? null : curso, p_situacao: situacao, p_limite: 50, p_offset: itens.length });
      if (seq === geracao.current) { setItens((old) => [...old, ...(r.itens ?? [])]); setTotal(r.total); }
    } catch (e) { if (seq === geracao.current) erroAlunos(e); } finally { if (seq === geracao.current) { setMais(false); emCarga.current = false; } }
  }
  return <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar por nome ou e-mail" placeholder="Buscar por nome ou e-mail" value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" /></div><Select value={curso} onValueChange={setCurso}><SelectTrigger aria-label="Curso" className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os cursos</SelectItem>{config?.cursos.map((c) => <SelectItem key={c.id} value={c.id}>{c.titulo}</SelectItem>)}</SelectContent></Select></div>
    <div className="flex flex-wrap items-center gap-2">{filtros.map((f) => <Button key={f.chave} size="sm" className="rounded-full" variant={situacao === f.chave ? "default" : "outline"} aria-pressed={situacao === f.chave} onClick={() => setSituacao(f.chave)}>{f.rotulo}</Button>)}<span className="w-full sm:w-auto sm:ml-auto text-sm text-muted-foreground">{total} alunos</span></div>
    {loading ? <div className="space-y-2 p-4 border rounded-xl"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : itens.length === 0 ? <div className="p-8 border rounded-xl bg-card text-center text-sm text-muted-foreground">Nenhum aluno encontrado com esses filtros.</div> : <>
      <div className="hidden sm:block border border-border rounded-xl bg-card overflow-hidden"><Table className="table-fixed"><TableHeader><TableRow><TableHead className="w-[26%]">Aluno</TableHead><TableHead>Cursos</TableHead><TableHead className="w-[13%]">Último acesso</TableHead><TableHead className="w-[15%]">Progresso</TableHead></TableRow></TableHeader><TableBody>{itens.map((a) => <TableRow key={a.chave} tabIndex={0} className="cursor-pointer" onClick={() => onAbrir(a.chave)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(a.chave); } }}><TableCell><Nome aluno={a} /></TableCell><TableCell><Cursos cursos={a.cursos} /></TableCell><TableCell className="text-xs text-muted-foreground">{acessoAluno(a.ultimo_acesso)}</TableCell><TableCell>{a.progresso == null ? "—" : <div className="flex items-center gap-2"><Progress value={a.progresso} aria-label={`Progresso de ${a.nome || a.email}`} className="h-1.5 flex-1" /><span className="text-xs">{a.progresso}%</span></div>}</TableCell></TableRow>)}</TableBody></Table></div>
      <div className="sm:hidden space-y-3">{itens.map((a) => <div key={a.chave} role="button" tabIndex={0} aria-label={`Abrir ficha de ${a.nome || a.email}`} className="rounded-xl border border-border bg-card p-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onAbrir(a.chave)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAbrir(a.chave); } }}><div className="flex items-start justify-between gap-3 mb-3"><Nome aluno={a} /><span className="text-xs text-muted-foreground shrink-0 text-right">{acessoAluno(a.ultimo_acesso)}</span></div><Cursos cursos={a.cursos} /></div>)}</div>
    </>}
    {!loading && <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground"><span>Mostrando {itens.length ? 1 : 0} a {itens.length} de {total}</span>{itens.length < total && <Button variant="outline" disabled={mais} onClick={carregarMais}>{mais ? "Carregando..." : "Carregar mais"}</Button>}</div>}
  </div>;
}
