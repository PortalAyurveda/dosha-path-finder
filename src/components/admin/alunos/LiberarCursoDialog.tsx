import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { amanhaAluno, dataAluno, erroAlunos, prazoAluno, rpcAlunos, type ConfigAlunos, type DadosFichaAluno } from "./AlunosTodos";
export type LiberacaoInicial = { email?: string; cursos?: string[] };
export default function LiberarCursoDialog({ open, onOpenChange, config, inicial, onSucesso }: { open: boolean; onOpenChange: (v: boolean) => void; config: ConfigAlunos | null; inicial: LiberacaoInicial; onSucesso: () => void }) {
  const [email, setEmail] = useState(""); const [ids, setIds] = useState<string[]>([]); const [prazoIdx, setPrazoIdx] = useState(0); const [tipo, setTipo] = useState(""); const [ate, setAte] = useState(""); const [obs, setObs] = useState(""); const [avisar, setAvisar] = useState(true); const [fora, setFora] = useState(false); const [ficha, setFicha] = useState<DadosFichaAluno | null>(null); const [consultando, setConsultando] = useState(false); const [saving, setSaving] = useState(false);
  const seq = useRef(0);
  useEffect(() => { if (!open) return; setEmail(inicial.email ?? ""); setIds(inicial.cursos ?? []); setPrazoIdx(Math.max(0, config?.prazos_liberar.findIndex((p) => p.padrao) ?? 0)); setTipo(config?.tipos[0]?.chave ?? ""); setAte(""); setObs(""); setAvisar(true); setFora(false); setFicha(null); }, [open, inicial, config]);
  const emailLimpo = email.trim().toLowerCase(); const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo);
  useEffect(() => {
    const n = ++seq.current; setFicha(null); setConsultando(false);
    if (!open || !valido) return;
    setConsultando(true);
    const timer = setTimeout(() => { rpcAlunos<DadosFichaAluno>("admin_aluno_ficha", { p_chave: emailLimpo }).then((r) => { if (n === seq.current) setFicha(r); }).catch((e) => { if (n === seq.current) erroAlunos(e); }).finally(() => { if (n === seq.current) setConsultando(false); }); }, 500);
    return () => { clearTimeout(timer); seq.current++; };
  }, [open, emailLimpo, valido]);
  const prazo = config?.prazos_liberar[prazoIdx]; const tipoRotulo = config?.tipos.find((t) => t.chave === tipo)?.rotulo.toLowerCase() ?? "";
  const selecionados = config?.cursos.filter((c) => ids.includes(c.id)) ?? [];
  let prazoTexto = "";
  if (prazo?.modo === "padrao") prazoTexto = ids.length === 1 ? `pelo prazo padrão (${selecionados[0]?.padrao_rotulo ?? ""})` : "pelo prazo padrão de cada curso";
  if (prazo?.modo === "meses") prazoTexto = `por ${prazo.rotulo}`;
  if (prazo?.modo === "vitalicio") prazoTexto = "com acesso vitalício";
  if (prazo?.modo === "data") prazoTexto = `até ${dataAluno(ate)}`;
  const semConta = ficha?.tem_conta === false;
  const resumo = `${semConta ? "Vai criar um convite com" : "Vai liberar"} ${ids.length} curso(s) para ${emailLimpo || "a pessoa"}, como ${tipoRotulo}, ${prazoTexto}${avisar ? ", e mandar 1 e-mail." : ", sem mandar e-mail."}`;
  const pronto = valido && ids.length > 0 && !!prazo && !!tipo && (prazo.modo !== "data" || ate >= amanhaAluno());
  async function liberar() {
    if (!prazo || !pronto || saving) return; setSaving(true);
    try { const r = await rpcAlunos<{ ok: boolean; tem_conta: boolean; email_enviado: boolean }>("admin_liberar_cursos", { p_email: emailLimpo, p_curso_ids: ids, p_prazo: prazoAluno(prazo, ate), p_tipo: tipo, p_enviar_email: avisar, p_obs: obs.trim() || null });
      if (!r.ok) throw new Error("Não foi possível liberar o curso.");
      toast.success(`${r.tem_conta ? "Liberado" : "Convite criado"}${r.email_enviado ? " e e-mail enviado" : ""}`); onOpenChange(false); onSucesso();
    } catch (e) { erroAlunos(e); } finally { setSaving(false); }
  }
  function cursos(lista: ConfigAlunos["cursos"]) { return lista.map((c) => { const tem = ficha?.cursos.find((x) => x.curso_id === c.id && x.situacao !== "cancelado" && x.status !== "cancelado"); return <label key={c.id} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${ids.includes(c.id) ? "border-primary bg-primary/5" : "border-border"}`}><Checkbox checked={ids.includes(c.id)} disabled={saving} onCheckedChange={(v) => setIds((old) => v ? [...old, c.id] : old.filter((id) => id !== c.id))} aria-label={c.titulo} /><span className="flex-1 min-w-0 text-sm"><span className="font-medium">{c.titulo}</span>{tem && <span className="block text-xs text-muted-foreground">{tem.vitalicio ? "já tem acesso vitalício" : `já tem até ${dataAluno(tem.expira_em)}`}</span>}</span><span className="text-xs text-muted-foreground text-right max-w-[40%]">padrão: {c.padrao_rotulo}</span></label>; }); }
  return <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto max-sm:inset-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:max-h-none max-sm:h-dvh max-sm:rounded-none max-sm:content-start" onEscapeKeyDown={(e) => { if (saving) e.preventDefault(); }} onPointerDownOutside={(e) => { if (saving) e.preventDefault(); }}><DialogHeader><DialogTitle>Liberar curso</DialogTitle><DialogDescription className="sr-only">Liberar cursos para uma conta ou enviar um convite por e-mail.</DialogDescription></DialogHeader>
    <div className="space-y-4"><div className="space-y-2"><Label htmlFor="liberar-email">E-mail da pessoa</Label><Input id="liberar-email" type="email" value={email} disabled={saving} onChange={(e) => setEmail(e.target.value)} />{consultando && <p className="text-xs text-muted-foreground">Consultando...</p>}{ficha && <div className="rounded-lg bg-muted p-3 text-sm break-words">{ficha.tem_conta ? <>Tem conta: {ficha.conta?.nome || ficha.email}{ficha.cursos.filter((c) => c.situacao !== "cancelado" && c.status !== "cancelado").length > 0 && <> · já tem: {ficha.cursos.filter((c) => c.situacao !== "cancelado" && c.status !== "cancelado").map((c) => `${c.titulo} (${c.vitalicio ? "vitalício" : `até ${dataAluno(c.expira_em)}`})`).join(", ")}</>}</> : "Ainda sem conta. Vai como convite: libera sozinho quando a pessoa se cadastrar com este e-mail."}</div>}</div>
    <section className="space-y-2"><Label>Cursos</Label>{cursos(config?.cursos.filter((c) => c.ativo) ?? [])}{(config?.cursos.filter((c) => !c.ativo).length ?? 0) > 0 && <><Button variant="link" size="sm" className="px-0" aria-expanded={fora} onClick={() => setFora(!fora)}>Cursos fora da vitrine ({config?.cursos.filter((c) => !c.ativo).length})</Button>{fora && cursos(config?.cursos.filter((c) => !c.ativo) ?? [])}</>}</section>
    <section className="space-y-2"><Label>Prazo</Label><div className="flex flex-wrap gap-2">{config?.prazos_liberar.map((p, i) => <Button key={i} size="sm" disabled={saving} variant={prazoIdx === i ? "default" : "outline"} aria-pressed={prazoIdx === i} onClick={() => setPrazoIdx(i)}>{p.rotulo}</Button>)}</div>{prazo?.modo === "data" && <Input aria-label="Data limite" type="date" min={amanhaAluno()} value={ate} disabled={saving} onChange={(e) => setAte(e.target.value)} />}</section>
    <div className="grid sm:grid-cols-2 gap-4"><section className="space-y-2"><Label>Tipo</Label><div className="flex flex-wrap gap-2">{config?.tipos.map((t) => <Button key={t.chave} size="sm" disabled={saving} variant={tipo === t.chave ? "default" : "outline"} aria-pressed={tipo === t.chave} onClick={() => setTipo(t.chave)}>{t.rotulo}</Button>)}</div></section><div className="space-y-2"><Label htmlFor="liberar-obs">Observação (só aparece aqui)</Label><Textarea id="liberar-obs" value={obs} disabled={saving} onChange={(e) => setObs(e.target.value)} /></div></div>
    <div className="flex items-center gap-3"><Switch id="liberar-avisar" checked={avisar} disabled={saving} onCheckedChange={setAvisar} /><Label htmlFor="liberar-avisar">Enviar e-mail avisando a pessoa</Label></div><div className="rounded-lg bg-muted p-3 text-sm" aria-live="polite">{resumo}</div>
    <div className="flex justify-end gap-2"><Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>Cancelar</Button><Button disabled={!pronto || saving} onClick={liberar}>{saving ? "Liberando..." : semConta ? "Enviar convite" : "Liberar"}</Button></div></div>
  </DialogContent></Dialog>;
}
