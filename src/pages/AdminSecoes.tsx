import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminNav from "@/components/admin/AdminNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Secao = {
  slug: string; titulo_admin: string; titulo: string | null; icone: string | null; tipo: string; funcao: string | null;
  html: string | null; textos: Record<string, string> | null; nivel: string; pilha_cadeado: string | null;
  pilha_link_texto: string | null; pilha_link: string | null; lancado_em: string | null; ativo: boolean;
};
type Lugar = { id: string; slot: string; secao_slug: string; ordem: number; ativo: boolean; publico: string | null };

const db = supabase as any;
const PUBLICOS = [
  { v: "", r: "Todos" }, { v: "admin", r: "Só admin" }, { v: "detox", r: "Alunos do Detox" },
  { v: "premium", r: "Só Premium" }, { v: "rotina", r: "Rotina e Premium" }, { v: "gratis", r: "Só grátis" },
];
const NIVEIS = [{ v: "conta", r: "Todos com conta" }, { v: "rotina", r: "Rotina e Premium" }, { v: "premium", r: "Só Premium" }];
const SELECT = "h-10 rounded-md border border-input bg-background px-3 text-sm";

const useRecarregar = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["admin-secoes"] });
    qc.invalidateQueries({ queryKey: ["admin-secoes-lugares"] });
    qc.invalidateQueries({ queryKey: ["secoes-html"] });
    qc.invalidateQueries({ queryKey: ["secoes-lugares-ativos"] });
  };
};

const LinhaLugar = ({ lugar, nome }: { lugar: Lugar; nome: string }) => {
  const recarregar = useRecarregar();
  const [ordem, setOrdem] = useState(String(lugar.ordem));
  const [ativo, setAtivo] = useState(lugar.ativo);
  const [publico, setPublico] = useState(lugar.publico ?? "");
  const salvar = async () => {
    const { error } = await db.from("secoes_lugares").update({ ordem: Number(ordem) || 0, ativo, publico: publico || null }).eq("id", lugar.id);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Lugar salvo.");
    recarregar();
  };
  const remover = async () => {
    if (!window.confirm(`Tirar "${nome}" de ${lugar.slot}?`)) return;
    const { error } = await db.from("secoes_lugares").delete().eq("id", lugar.id);
    if (error) return toast.error("Erro: " + error.message);
    recarregar();
  };
  return (
    <div className="flex flex-wrap items-center gap-3 py-2 border-b border-border">
      <Input className="w-20" type="number" value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordem" />
      <span className="flex-1 min-w-[200px] font-medium">{nome} <span className="text-xs text-muted-foreground">({lugar.secao_slug})</span></span>
      <select className={SELECT} value={publico} onChange={(e) => setPublico(e.target.value)} aria-label="Público">
        {PUBLICOS.map((p) => <option key={p.v} value={p.v}>{p.r}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm"><Switch checked={ativo} onCheckedChange={setAtivo} />Ligada</label>
      <Button size="sm" onClick={salvar}>Salvar</Button>
      <Button size="sm" variant="outline" onClick={remover}>Tirar</Button>
    </div>
  );
};

const CartaoSecao = ({ secao }: { secao: Secao }) => {
  const recarregar = useRecarregar();
  const [f, setF] = useState<Secao>({ ...secao, textos: { ...(secao.textos ?? {}) } });
  const campo = (k: keyof Secao, v: any) => setF((x) => ({ ...x, [k]: v }));
  const salvar = async () => {
    const { error } = await db.from("secoes").update({
      titulo_admin: f.titulo_admin, titulo: f.titulo || null, icone: f.icone || null, html: f.html, textos: f.textos ?? {},
      nivel: f.nivel, pilha_cadeado: f.pilha_cadeado || null, pilha_link_texto: f.pilha_link_texto || null,
      pilha_link: f.pilha_link || null, lancado_em: f.lancado_em || null, ativo: f.ativo,
    }).eq("slug", secao.slug);
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Seção salva.");
    recarregar();
  };
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer font-semibold text-lg">
        {f.titulo_admin} <span className="text-xs text-muted-foreground">({secao.slug}{f.ativo ? "" : ", desligada"})</span>
      </summary>
      <div className="grid gap-3 mt-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Nome no admin</Label><Input value={f.titulo_admin} onChange={(e) => campo("titulo_admin", e.target.value)} /></div>
          <div><Label>Título na tela</Label><Input value={f.titulo ?? ""} onChange={(e) => campo("titulo", e.target.value)} /></div>
          <div><Label>Ícone</Label><Input value={f.icone ?? ""} onChange={(e) => campo("icone", e.target.value)} /></div>
          <div><Label>Quem tem aberto</Label>
            <select className={SELECT + " w-full"} value={f.nivel} onChange={(e) => campo("nivel", e.target.value)}>
              {NIVEIS.map((n) => <option key={n.v} value={n.v}>{n.r}</option>)}
            </select>
          </div>
          <div><Label>Selo Novo a partir de</Label><Input type="date" value={f.lancado_em ?? ""} onChange={(e) => campo("lancado_em", e.target.value)} /></div>
          <label className="flex items-center gap-2 mt-6"><Switch checked={f.ativo} onCheckedChange={(v) => campo("ativo", v)} />Seção ligada</label>
          <div><Label>Cadeado (quem não tem)</Label><Input value={f.pilha_cadeado ?? ""} onChange={(e) => campo("pilha_cadeado", e.target.value)} /></div>
          <div><Label>Texto do link (quem não tem)</Label><Input value={f.pilha_link_texto ?? ""} onChange={(e) => campo("pilha_link_texto", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Link (quem não tem)</Label><Input value={f.pilha_link ?? ""} onChange={(e) => campo("pilha_link", e.target.value)} /></div>
        </div>
        {f.tipo === "html" && (
          <div><Label>HTML</Label><Textarea rows={6} className="font-mono text-xs" value={f.html ?? ""} onChange={(e) => campo("html", e.target.value)} /></div>
        )}
        {Object.keys(f.textos ?? {}).length > 0 && (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">Textos. Palavras entre chaves, como {"{dosha}"} e {"{data}"}, são trocadas pelo dado de cada pessoa.</p>
            {Object.entries(f.textos ?? {}).map(([k, v]) => (
              <div key={k}>
                <Label className="font-mono text-xs">{k}</Label>
                <Textarea rows={2} value={v} onChange={(e) => setF((x) => ({ ...x, textos: { ...(x.textos ?? {}), [k]: e.target.value } }))} />
              </div>
            ))}
          </div>
        )}
        <div><Button onClick={salvar}>Salvar seção</Button></div>
      </div>
    </details>
  );
};

const AdminSecoes = () => {
  const recarregar = useRecarregar();
  const { data: secoes = [] } = useQuery({
    queryKey: ["admin-secoes"],
    queryFn: async () => {
      const { data, error } = await db.from("secoes").select("*").order("slug");
      if (error) throw error;
      return (data ?? []) as Secao[];
    },
  });
  const { data: lugares = [] } = useQuery({
    queryKey: ["admin-secoes-lugares"],
    queryFn: async () => {
      const { data, error } = await db.from("secoes_lugares").select("*").order("slot").order("ordem");
      if (error) throw error;
      return (data ?? []) as Lugar[];
    },
  });
  const nomes = useMemo(() => Object.fromEntries(secoes.map((s) => [s.slug, s.titulo_admin])), [secoes]);
  const porSlot = useMemo(() => {
    const m: Record<string, Lugar[]> = {};
    lugares.forEach((l) => {
      if (!m[l.slot]) m[l.slot] = [];
      m[l.slot].push(l);
    });
    return m;
  }, [lugares]);
  const [novo, setNovo] = useState({ slot: "", secao_slug: "", ordem: "100" });
  const adicionar = async () => {
    if (!novo.slot || !novo.secao_slug) return toast.error("Escolha o lugar e a seção.");
    const { error } = await db.from("secoes_lugares").insert({ slot: novo.slot.trim(), secao_slug: novo.secao_slug, ordem: Number(novo.ordem) || 100 });
    if (error) return toast.error("Erro: " + error.message);
    toast.success("Seção colocada no lugar.");
    setNovo({ slot: "", secao_slug: "", ordem: "100" });
    recarregar();
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Seções · Admin · Portal Ayurveda</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold font-serif text-primary">Seções</h1>
            <p className="text-sm text-muted-foreground">As partes da página Meu Dosha e de outros lugares do site.</p>
          </div>
          <Button asChild variant="outline"><Link to="/meu-dosha">Abrir Meu Dosha</Link></Button>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Lugares</h2>
          {Object.entries(porSlot).map(([slot, ls]) => (
            <div key={slot} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-mono font-semibold mb-2">{slot}</h3>
              {ls.map((l) => <LinhaLugar key={l.id} lugar={l} nome={nomes[l.secao_slug] ?? l.secao_slug} />)}
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-border p-4 flex flex-wrap items-end gap-3">
            <div><Label>Lugar (slot)</Label><Input value={novo.slot} onChange={(e) => setNovo({ ...novo, slot: e.target.value })} placeholder="ex.: meu_dosha ou home_meio" /></div>
            <div><Label>Seção</Label>
              <select className={SELECT} value={novo.secao_slug} onChange={(e) => setNovo({ ...novo, secao_slug: e.target.value })}>
                <option value="">Escolha</option>
                {secoes.map((s) => <option key={s.slug} value={s.slug}>{s.titulo_admin}</option>)}
              </select>
            </div>
            <div><Label>Ordem</Label><Input className="w-24" type="number" value={novo.ordem} onChange={(e) => setNovo({ ...novo, ordem: e.target.value })} /></div>
            <Button onClick={adicionar}>Colocar</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Seções</h2>
          {secoes.map((s) => <CartaoSecao key={s.slug} secao={s} />)}
        </section>
      </div>
    </div>
  );
};

export default AdminSecoes;