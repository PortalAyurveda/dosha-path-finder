import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Pencil,
  Trash2,
  Files,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";

import AdminNav from "@/components/admin/AdminNav";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// =========================================================================
// Vocabulário fechado de tags
// =========================================================================
type TagGroup = {
  titulo: string;
  opcoes: { value: string; label: string; desc: string }[];
};

const TAG_GROUPS: TagGroup[] = [
  {
    titulo: "Acesso",
    opcoes: [
      { value: "todos", label: "todos", desc: "Sempre mostra (ignora demais filtros de acesso)." },
      { value: "sem_rotina", label: "sem_rotina", desc: "Usuário NÃO assina a Rotina." },
      { value: "tem_rotina", label: "tem_rotina", desc: "Usuário JÁ assina a Rotina." },
      { value: "nao_premium", label: "nao_premium", desc: "Usuário NÃO é premium." },
    ],
  },
  {
    titulo: "Vínculo",
    opcoes: [
      { value: "tem_conta", label: "tem_conta", desc: "Usuário logado." },
      { value: "sem_conta", label: "sem_conta", desc: "Visitante deslogado." },
    ],
  },
  {
    titulo: "Dosha",
    opcoes: [
      { value: "vata", label: "vata", desc: "Dosha principal Vata." },
      { value: "pitta", label: "pitta", desc: "Dosha principal Pitta." },
      { value: "kapha", label: "kapha", desc: "Dosha principal Kapha." },
      { value: "vata-pitta", label: "vata-pitta", desc: "Bidóshico Vata-Pitta." },
      { value: "vata-kapha", label: "vata-kapha", desc: "Bidóshico Vata-Kapha." },
      { value: "pitta-kapha", label: "pitta-kapha", desc: "Bidóshico Pitta-Kapha." },
    ],
  },
  {
    titulo: "Agni",
    opcoes: [
      { value: "agni_irregular", label: "agni_irregular", desc: "Agni irregular (Vata)." },
      { value: "agni_forte", label: "agni_forte", desc: "Agni forte (Pitta)." },
      { value: "agni_fraco", label: "agni_fraco", desc: "Agni fraco (Kapha)." },
      { value: "agni_bom", label: "agni_bom", desc: "Agni equilibrado." },
    ],
  },
];

const ALL_TAGS = TAG_GROUPS.flatMap((g) => g.opcoes.map((o) => o.value));

// Largura de moldura por slot (simula o tamanho real)
const SLOT_FRAME_WIDTH: Record<string, number> = {
  loggedhero: 360,
};
const FRAME_DEFAULT = 360;

// =========================================================================
// Tipos
// =========================================================================
type Banner = {
  id: string;
  slot: string;
  campanha: string | null;
  titulo_admin: string | null;
  html: string;
  tags: string[] | null;
  ativo: boolean;
  ordem: number | null;
  criado_em: string;
  atualizado_em: string;
};

type Molde = {
  slot: string;
  descricao: string | null;
  contrato: string | null;
  exemplo_html: string | null;
};

type FormState = {
  id?: string;
  slot: string;
  campanha: string;
  titulo_admin: string;
  html: string;
  tags: string[];
  ordem: number;
  ativo: boolean;
};

const emptyForm = (slot = "loggedhero"): FormState => ({
  slot,
  campanha: "rotina",
  titulo_admin: "",
  html: "",
  tags: [],
  ordem: 0,
  ativo: true,
});

// =========================================================================
// Preview seguro
// =========================================================================
const SafePreview = ({ html, width }: { html: string; width: number }) => {
  const clean = useMemo(() => DOMPurify.sanitize(html || "", { ADD_ATTR: ["target"] }), [html]);
  return (
    <div
      className="border border-dashed border-border rounded-md overflow-hidden bg-background"
      style={{ width }}
    >
      <div dangerouslySetInnerHTML={{ __html: clean }} />
    </div>
  );
};

// =========================================================================
// Página
// =========================================================================
const AdminBanners = () => {
  const qc = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [contratoSlot, setContratoSlot] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<Banner | null>(null);
  const [scaledSlots, setScaledSlots] = useState<Record<string, boolean>>({});

  // ---------- fetch ----------
  const moldesQ = useQuery({
    queryKey: ["admin", "banners_molde"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners_molde")
        .select("*")
        .order("slot");
      if (error) throw error;
      return (data ?? []) as Molde[];
    },
  });

  const bannersQ = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("slot")
        .order("ordem", { ascending: true, nullsFirst: false })
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Banner[];
    },
  });

  const moldes = moldesQ.data ?? [];
  const banners = bannersQ.data ?? [];

  const slots = useMemo(() => {
    const s = new Set<string>(moldes.map((m) => m.slot));
    banners.forEach((b) => s.add(b.slot));
    return Array.from(s).sort();
  }, [moldes, banners]);

  const moldeBySlot = useMemo(() => {
    const m: Record<string, Molde> = {};
    moldes.forEach((x) => (m[x.slot] = x));
    return m;
  }, [moldes]);

  const bannersBySlot = useMemo(() => {
    const m: Record<string, Banner[]> = {};
    banners.forEach((b) => {
      (m[b.slot] ||= []).push(b);
    });
    return m;
  }, [banners]);

  // ---------- mutations ----------
  const upsertMut = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        slot: f.slot,
        campanha: f.campanha || null,
        titulo_admin: f.titulo_admin || null,
        html: f.html,
        tags: f.tags,
        ordem: f.ordem ?? 0,
        ativo: f.ativo,
      };
      if (f.id) {
        const { error } = await supabase.from("banners").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Banner salvo.");
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      setFormOpen(false);
    },
    onError: (e: any) => toast.error("Erro ao salvar: " + (e?.message ?? "desconhecido")),
  });

  const toggleAtivoMut = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("banners").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "banners"] }),
    onError: (e: any) => toast.error("Erro: " + (e?.message ?? "")),
  });

  const duplicateMut = useMutation({
    mutationFn: async (b: Banner) => {
      const { error } = await supabase.from("banners").insert({
        slot: b.slot,
        campanha: b.campanha,
        titulo_admin: (b.titulo_admin ?? "") + " (cópia)",
        html: b.html,
        tags: b.tags ?? [],
        ordem: (b.ordem ?? 0) + 1,
        ativo: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner duplicado.");
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
    },
    onError: (e: any) => toast.error("Erro: " + (e?.message ?? "")),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Banner removido.");
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      setConfirmDel(null);
    },
    onError: (e: any) => toast.error("Erro ao remover: " + (e?.message ?? "")),
  });

  // ---------- handlers ----------
  const openNew = () => {
    setForm(emptyForm(slots[0] ?? "loggedhero"));
    setFormOpen(true);
  };
  const openEdit = (b: Banner) => {
    setForm({
      id: b.id,
      slot: b.slot,
      campanha: b.campanha ?? "",
      titulo_admin: b.titulo_admin ?? "",
      html: b.html ?? "",
      tags: (b.tags ?? []).filter((t) => ALL_TAGS.includes(t)),
      ordem: b.ordem ?? 0,
      ativo: b.ativo,
    });
    setFormOpen(true);
  };

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const copyContrato = (slot: string) => {
    const m = moldeBySlot[slot];
    const txt = [m?.descricao, m?.contrato].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(txt);
    toast.success("Contrato copiado.");
  };

  // =========================================================================
  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Banners · Admin · Portal Ayurveda</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <AdminNav />

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <header className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
              >
                Banners
              </h1>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Gestão dos banners exibidos nos slots do app.
              </p>
            </div>
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> Novo banner
            </Button>
          </header>

          {(bannersQ.isLoading || moldesQ.isLoading) && (
            <div className="space-y-3">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          )}

          {slots.map((slot) => {
            const list = bannersBySlot[slot] ?? [];
            const frameW = SLOT_FRAME_WIDTH[slot] ?? FRAME_DEFAULT;
            const scaled = !!scaledSlots[slot];
            return (
              <section key={slot} className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-lg font-bold"
                      style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
                    >
                      Slot · {slot}
                    </h2>
                    <Badge variant="outline">{list.length} banner(s)</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {scaled ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>70%</span>
                      <Switch
                        checked={scaled}
                        onCheckedChange={(v) =>
                          setScaledSlots((s) => ({ ...s, [slot]: !!v }))
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setContratoSlot(slot)}
                    >
                      <FileText className="w-4 h-4" /> Ver contrato do slot
                    </Button>
                  </div>
                </div>

                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum banner cadastrado neste slot.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((b) => (
                      <div
                        key={b.id}
                        className="border border-border rounded-xl p-3 space-y-3 bg-background/60"
                      >
                        <div
                          className="flex justify-center overflow-hidden"
                          style={{ minHeight: scaled ? 80 : 120 }}
                        >
                          <div
                            style={{
                              transform: scaled ? "scale(0.7)" : "none",
                              transformOrigin: "top center",
                            }}
                          >
                            <SafePreview html={b.html} width={frameW} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-sm truncate" title={b.titulo_admin ?? ""}>
                              {b.titulo_admin || <span className="italic text-muted-foreground">(sem título)</span>}
                            </div>
                            <Switch
                              checked={b.ativo}
                              onCheckedChange={(v) =>
                                toggleAtivoMut.mutate({ id: b.id, ativo: !!v })
                              }
                            />
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {b.campanha && (
                              <Badge variant="secondary" className="text-[10px]">
                                {b.campanha}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              ordem {b.ordem ?? 0}
                            </Badge>
                            {(b.tags ?? []).map((t) => (
                              <Badge key={t} className="text-[10px]" variant="outline">
                                {t}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openEdit(b)}>
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5"
                              onClick={() => duplicateMut.mutate(b)}
                            >
                              <Files className="w-3.5 h-3.5" /> Duplicar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => setConfirmDel(b)}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Deletar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* ===================== Dialog: contrato do slot ===================== */}
        <Dialog open={!!contratoSlot} onOpenChange={(o) => !o && setContratoSlot(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Contrato do slot · {contratoSlot}</DialogTitle>
              <DialogDescription>
                Use este texto como briefing para gerar um novo banner com IA.
              </DialogDescription>
            </DialogHeader>
            {contratoSlot && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {moldeBySlot[contratoSlot]?.descricao && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Descrição
                    </Label>
                    <p className="text-sm mt-1">{moldeBySlot[contratoSlot]?.descricao}</p>
                  </div>
                )}
                {moldeBySlot[contratoSlot]?.contrato && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Contrato
                    </Label>
                    <pre className="mt-1 p-3 rounded-md bg-muted text-xs font-mono whitespace-pre-wrap break-words">
                      {moldeBySlot[contratoSlot]?.contrato}
                    </pre>
                  </div>
                )}
                {!moldeBySlot[contratoSlot] && (
                  <p className="text-sm text-muted-foreground italic">
                    Nenhum molde cadastrado para este slot.
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => contratoSlot && copyContrato(contratoSlot)}
              >
                <Copy className="w-4 h-4" /> Copiar contrato
              </Button>
              <Button onClick={() => setContratoSlot(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== Dialog: criar/editar ===================== */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{form.id ? "Editar banner" : "Novo banner"}</DialogTitle>
              <DialogDescription>
                O banner aparece para quem bate com <strong>TODAS</strong> as tags marcadas (E lógico).
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Coluna esquerda — campos */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Slot</Label>
                    <Select
                      value={form.slot}
                      onValueChange={(v) => setForm((f) => ({ ...f, slot: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(slots.length ? slots : ["loggedhero"]).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={form.ordem}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, ordem: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Campanha</Label>
                    <Input
                      value={form.campanha}
                      onChange={(e) => setForm((f) => ({ ...f, campanha: e.target.value }))}
                      placeholder="rotina"
                    />
                  </div>
                  <div>
                    <Label>Título interno</Label>
                    <Input
                      value={form.titulo_admin}
                      onChange={(e) => setForm((f) => ({ ...f, titulo_admin: e.target.value }))}
                      placeholder="Nome para o admin"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>Tags (E lógico)</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs h-7"
                      onClick={() => setContratoSlot(form.slot)}
                    >
                      <FileText className="w-3.5 h-3.5" /> Ver contrato deste slot
                    </Button>
                  </div>
                  <div className="space-y-3 border border-border rounded-md p-3 bg-muted/30">
                    {TAG_GROUPS.map((g) => (
                      <div key={g.titulo}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {g.titulo}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {g.opcoes.map((opt) => {
                            const selected = form.tags.includes(opt.value);
                            return (
                              <Tooltip key={opt.value}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => toggleTag(opt.value)}
                                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                      selected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-border hover:bg-muted"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">{opt.desc}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>HTML</Label>
                  <Textarea
                    value={form.html}
                    onChange={(e) => setForm((f) => ({ ...f, html: e.target.value }))}
                    rows={16}
                    className="font-mono text-xs"
                    placeholder="<div class='...'>...</div>"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: !!v }))}
                  />
                  <Label className="cursor-pointer">Banner ativo</Label>
                </div>
              </div>

              {/* Coluna direita — preview ao vivo */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Preview ao vivo · {SLOT_FRAME_WIDTH[form.slot] ?? FRAME_DEFAULT}px
                </Label>
                <div className="flex justify-center p-4 rounded-md bg-muted/30 border border-border min-h-[200px]">
                  <SafePreview
                    html={form.html}
                    width={SLOT_FRAME_WIDTH[form.slot] ?? FRAME_DEFAULT}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => upsertMut.mutate(form)}
                disabled={upsertMut.isPending || !form.slot || !form.html.trim()}
              >
                {upsertMut.isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== Confirmar deleção ===================== */}
        <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar banner?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita.
                {confirmDel?.titulo_admin && (
                  <div className="mt-2 font-medium">"{confirmDel.titulo_admin}"</div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDel && deleteMut.mutate(confirmDel.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminBanners;
