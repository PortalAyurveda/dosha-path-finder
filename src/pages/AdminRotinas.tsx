import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DoshaVal = -1 | 0 | 1;

interface Ingrediente {
  qtd: string;
  item: string;
}

interface NuggetJson {
  resumo?: string;
  ingredientes?: Ingrediente[];
  modo_preparo?: string[];
  efeito_esperado?: string;
  dicas?: string;
  [k: string]: any;
}

interface Rotina {
  id: string;
  titulo: string | null;
  categoria: string | null;
  subcategoria: string | null;
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
  score: number | null;
  icone_lucide: string | null;
  revisado: boolean | null;
  nugget_json: NuggetJson | null;
}

const CATEGORIAS = ["Alimentação", "Dravyaguna", "Rotinas Diárias"] as const;

const SUBCATEGORIAS: Record<string, string[]> = {
  "Alimentação": ["desjejum", "bebida funcional", "lanche leve", "prato completo", "sopa e caldo"],
  "Dravyaguna": ["chá", "elixir", "madhu", "fermentado"],
  "Rotinas Diárias": ["manhã", "abhyanga", "pranayama", "meditação", "yoga", "noite", "tarde"],
};

const PAGE_SIZE = 30;

const doshaFilterOpts = [
  { v: "any", label: "qualquer" },
  { v: "-1", label: "acalma (-1)" },
  { v: "0", label: "neutro (0)" },
  { v: "1", label: "agrava (+1)" },
];

const doshaColor = (d: "vata" | "pitta" | "kapha") =>
  d === "vata"
    ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200"
    : d === "pitta"
    ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200"
    : "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200";

function LucideIcon({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return <span className="text-xs text-muted-foreground">{name}</span>;
  return <Cmp className={className} />;
}

const AdminRotinas = () => {
  const [rows, setRows] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [subs, setSubs] = useState<string[]>([]);
  const [vFilter, setVFilter] = useState("any");
  const [pFilter, setPFilter] = useState("any");
  const [kFilter, setKFilter] = useState("any");
  const [minScore, setMinScore] = useState(0);
  const [revFilter, setRevFilter] = useState<"all" | "yes" | "no">("all");

  // sort + page
  const [sortKey, setSortKey] = useState<"titulo" | "score" | "categoria" | "subcategoria">("titulo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  // drawer
  const [editing, setEditing] = useState<Rotina | null>(null);
  const [saving, setSaving] = useState(false);

  // delete confirm + fade
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [fadingOut, setFadingOut] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rotina_nuggets" as any)
      .select("id, titulo, categoria, subcategoria, vata, pitta, kapha, score, icone_lucide, revisado, nugget_json")
      .limit(2000);
    if (error) toast.error(error.message);
    setRows(((data as any) ?? []) as Rotina[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const availableSubs = useMemo(() => {
    const active = cats.length ? cats : CATEGORIAS;
    return Array.from(new Set(active.flatMap((c) => SUBCATEGORIAS[c] ?? [])));
  }, [cats]);

  const filtered = useMemo(() => {
    let r = rows.filter((x) => {
      if (q && !(x.titulo ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      if (cats.length && !cats.includes(x.categoria ?? "")) return false;
      if (subs.length && !subs.includes(x.subcategoria ?? "")) return false;
      if (vFilter !== "any" && String(x.vata ?? 0) !== vFilter) return false;
      if (pFilter !== "any" && String(x.pitta ?? 0) !== pFilter) return false;
      if (kFilter !== "any" && String(x.kapha ?? 0) !== kFilter) return false;
      if ((x.score ?? 0) < minScore) return false;
      if (revFilter === "yes" && !x.revisado) return false;
      if (revFilter === "no" && x.revisado) return false;
      return true;
    });
    r.sort((a, b) => {
      const av = (a[sortKey] ?? "") as any;
      const bv = (b[sortKey] ?? "") as any;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, q, cats, subs, vFilter, pFilter, kFilter, minScore, revFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const toggleArr = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const clearFilters = () => {
    setQ(""); setCats([]); setSubs([]);
    setVFilter("any"); setPFilter("any"); setKFilter("any");
    setMinScore(0); setRevFilter("all");
  };

  const sortBtn = (k: typeof sortKey, label: string) => (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={() => {
        if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(k); setSortDir("asc"); }
      }}
    >
      {label}
      <ArrowUpDown className="w-3 h-3 opacity-60" />
    </button>
  );

  const toggleRevisado = async (row: Rotina, value: boolean) => {
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, revisado: value } : x)));
    const { error } = await supabase
      .from("rotina_nuggets" as any)
      .update({ revisado: value } as any)
      .eq("id", row.id);
    if (error) {
      toast.error("Falha ao atualizar");
      setRows((r) => r.map((x) => (x.id === row.id ? { ...x, revisado: !value } : x)));
    }
  };

  const handleDelete = async (id: string) => {
    setFadingOut(id);
    setTimeout(async () => {
      const { error } = await supabase.from("rotina_nuggets" as any).delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        setFadingOut(null);
        return;
      }
      setRows((r) => r.filter((x) => x.id !== id));
      setFadingOut(null);
      setConfirmDel(null);
      toast.success("Excluído");
    }, 280);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      titulo: editing.titulo,
      categoria: editing.categoria,
      subcategoria: editing.subcategoria,
      vata: editing.vata,
      pitta: editing.pitta,
      kapha: editing.kapha,
      score: editing.score,
      revisado: editing.revisado,
      nugget_json: editing.nugget_json,
    };
    const { error } = await supabase
      .from("rotina_nuggets" as any)
      .update(payload as any)
      .eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.map((x) => (x.id === editing.id ? { ...x, ...editing } : x)));
    setEditing(null);
    toast.success("Salvo");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Admin · Rotinas</title></Helmet>
      <AdminNav />

      <div className="flex gap-4 p-4 max-w-[1600px] mx-auto">
        {/* Filters */}
        <aside className="w-[240px] shrink-0 sticky top-20 self-start space-y-5 border border-border rounded-lg p-4 bg-card max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Busca</label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título..." className="mt-1" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
            <div className="mt-2 space-y-1.5">
              {CATEGORIAS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={cats.includes(c)} onCheckedChange={() => toggleArr(cats, setCats, c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Subcategoria</label>
            <div className="mt-2 flex flex-wrap gap-1">
              {availableSubs.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleArr(subs, setSubs, s)}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs border transition",
                    subs.includes(s) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {([["vata", vFilter, setVFilter], ["pitta", pFilter, setPFilter], ["kapha", kFilter, setKFilter]] as const).map(([d, val, set]) => (
            <div key={d}>
              <label className="text-xs font-semibold text-muted-foreground capitalize">{d}</label>
              <Select value={val} onValueChange={set as any}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {doshaFilterOpts.map((o) => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Score mínimo: {minScore}</label>
            <Slider value={[minScore]} min={0} max={100} step={1} onValueChange={(v) => setMinScore(v[0])} className="mt-2" />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Revisado</label>
            <Select value={revFilter} onValueChange={(v: any) => setRevFilter(v)}>
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Revisado</SelectItem>
                <SelectItem value="no">Não revisado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>Limpar filtros</Button>

          <p className="text-xs text-muted-foreground text-center">
            {filtered.length} {filtered.length === 1 ? "receita encontrada" : "receitas encontradas"}
          </p>
        </aside>

        {/* Table */}
        <section className="flex-1 min-w-0 border border-border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3 w-10"></th>
                  <th className="p-3 text-left">{sortBtn("titulo", "Título")}</th>
                  <th className="p-3 text-left">{sortBtn("categoria", "Categoria")}</th>
                  <th className="p-3 text-center">V/P/K</th>
                  <th className="p-3 text-left w-44">{sortBtn("score", "Score")}</th>
                  <th className="p-3 text-center">Revisado</th>
                  <th className="p-3 text-right w-48">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                )}
                {!loading && pageRows.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum resultado</td></tr>
                )}
                {pageRows.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-t border-border transition-opacity duration-300",
                      fadingOut === r.id && "opacity-0"
                    )}
                  >
                    <td className="p-3"><LucideIcon name={r.icone_lucide} className="w-5 h-5 text-primary" /></td>
                    <td className="p-3 font-medium">{r.titulo}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="w-fit text-xs">{r.categoria}</Badge>
                        <span className="text-xs text-muted-foreground">{r.subcategoria}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        {(["vata", "pitta", "kapha"] as const).map((d) => {
                          const val = r[d] ?? 0;
                          const sign = val > 0 ? `+${val}` : String(val);
                          return (
                            <span key={d} className={cn("px-1.5 py-0.5 rounded text-xs border font-mono", doshaColor(d))}>
                              {d[0].toUpperCase()} {sign}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs w-8">{r.score ?? 0}</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${r.score ?? 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={!!r.revisado} onCheckedChange={(v) => toggleRevisado(r, v)} />
                    </td>
                    <td className="p-3">
                      {confirmDel === r.id ? (
                        <div className="flex justify-end gap-1 items-center text-xs">
                          <span className="text-muted-foreground mr-1">Tem certeza?</span>
                          <Button size="sm" variant="destructive" className="h-7" onClick={() => handleDelete(r.id)}>Sim, deletar</Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setConfirmDel(null)}>Cancelar</Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(structuredClone(r))}>
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive" onClick={() => setConfirmDel(r.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Página {page} de {totalPages}</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Edit Drawer */}
      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {editing && <EditForm editing={editing} setEditing={setEditing} />}
          <SheetFooter className="mt-6 sticky bottom-0 bg-background pt-3 border-t">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const DoshaToggle = ({ value, onChange }: { value: number; onChange: (v: DoshaVal) => void }) => (
  <div className="inline-flex rounded-md border border-border overflow-hidden">
    {([-1, 0, 1] as DoshaVal[]).map((v) => (
      <button
        key={v}
        type="button"
        onClick={() => onChange(v)}
        className={cn(
          "px-3 py-1 text-xs font-mono transition",
          value === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
        )}
      >
        {v > 0 ? `+${v}` : v}
      </button>
    ))}
  </div>
);

function EditForm({ editing, setEditing }: { editing: Rotina; setEditing: (r: Rotina | null) => void }) {
  const upd = (patch: Partial<Rotina>) => setEditing({ ...editing, ...patch });
  const updJson = (patch: Partial<NuggetJson>) =>
    setEditing({ ...editing, nugget_json: { ...(editing.nugget_json ?? {}), ...patch } });

  const json = editing.nugget_json ?? {};
  const ingredientes = json.ingredientes ?? [];
  const passos = json.modo_preparo ?? [];

  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    const arr = [...passos];
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    updJson({ modo_preparo: arr });
  };

  const subs = SUBCATEGORIAS[editing.categoria ?? ""] ?? [];

  return (
    <>
      <SheetHeader>
        <SheetTitle>Editar rotina</SheetTitle>
      </SheetHeader>

      <div className="space-y-5 mt-5">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Título</label>
          <Input value={editing.titulo ?? ""} onChange={(e) => upd({ titulo: e.target.value })} className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
            <Select value={editing.categoria ?? ""} onValueChange={(v) => upd({ categoria: v, subcategoria: "" })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Subcategoria</label>
            <Select value={editing.subcategoria ?? ""} onValueChange={(v) => upd({ subcategoria: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {subs.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["vata", "pitta", "kapha"] as const).map((d) => (
            <div key={d}>
              <label className="text-xs font-semibold text-muted-foreground capitalize">{d}</label>
              <div className="mt-1"><DoshaToggle value={(editing[d] as number) ?? 0} onChange={(v) => upd({ [d]: v } as any)} /></div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Score: {editing.score ?? 0}</label>
          <Slider value={[editing.score ?? 0]} min={0} max={100} step={1} onValueChange={(v) => upd({ score: v[0] })} className="mt-2" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Switch checked={!!editing.revisado} onCheckedChange={(v) => upd({ revisado: v })} />
          Revisado
        </label>

        <div className="pt-3 border-t">
          <label className="text-xs font-semibold text-muted-foreground">Resumo</label>
          <Textarea value={json.resumo ?? ""} onChange={(e) => updJson({ resumo: e.target.value })} className="mt-1" rows={3} />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground">Ingredientes</label>
            <Button size="sm" variant="outline" className="h-7" onClick={() => updJson({ ingredientes: [...ingredientes, { qtd: "", item: "" }] })}>
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {ingredientes.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <Input className="w-1/3" placeholder="qtd" value={ing.qtd} onChange={(e) => {
                  const arr = [...ingredientes]; arr[i] = { ...arr[i], qtd: e.target.value }; updJson({ ingredientes: arr });
                }} />
                <Input className="flex-1" placeholder="item" value={ing.item} onChange={(e) => {
                  const arr = [...ingredientes]; arr[i] = { ...arr[i], item: e.target.value }; updJson({ ingredientes: arr });
                }} />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => updJson({ ingredientes: ingredientes.filter((_, j) => j !== i) })}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground">Modo de preparo</label>
            <Button size="sm" variant="outline" className="h-7" onClick={() => updJson({ modo_preparo: [...passos, ""] })}>
              <Plus className="w-3 h-3 mr-1" /> Passo
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {passos.map((p, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIdx !== null && dragIdx !== i) reorder(dragIdx, i); setDragIdx(null); }}
                className="flex gap-2 items-start"
              >
                <GripVertical className="w-4 h-4 mt-3 text-muted-foreground cursor-grab" />
                <span className="mt-2 text-xs text-muted-foreground w-4">{i + 1}.</span>
                <Textarea
                  rows={2}
                  value={p}
                  onChange={(e) => { const arr = [...passos]; arr[i] = e.target.value; updJson({ modo_preparo: arr }); }}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => updJson({ modo_preparo: passos.filter((_, j) => j !== i) })}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Efeito esperado</label>
          <Textarea value={json.efeito_esperado ?? ""} onChange={(e) => updJson({ efeito_esperado: e.target.value })} className="mt-1" rows={3} />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">Dicas</label>
          <Textarea value={json.dicas ?? ""} onChange={(e) => updJson({ dicas: e.target.value })} className="mt-1" rows={3} />
        </div>
      </div>
    </>
  );
}

export default AdminRotinas;
