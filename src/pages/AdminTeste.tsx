import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Save, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import AdminNav from "@/components/admin/AdminNav";
import QuestionCard from "@/components/admin/teste/QuestionCard";
import ScoreTagPicker from "@/components/admin/teste/ScoreTagPicker";
import {
  fetchDoshaTestRows, rowsToContent, STEP_CONFIG, summarizeScores,
  type DoshaTestRow, type Question, type ScoreValues,
} from "@/lib/doshaTest";

interface TagItem {
  label: string;
  scores: ScoreValues;
}

interface State {
  partQuestions: Record<string, Question[]>;
  agravamentos: Record<"vata" | "pitta" | "kapha", TagItem[]>;
  foods: Record<"vata" | "pitta" | "kapha", TagItem[]>;
}

const emptyState = (): State => ({
  partQuestions: { part1: [], part2: [], part3: [], part4: [], part5: [], part6: [], part7: [] },
  agravamentos: { vata: [], pitta: [], kapha: [] },
  foods: { vata: [], pitta: [], kapha: [] },
});

const stateFromRows = (rows: DoshaTestRow[]): State => {
  const s = emptyState();
  const sorted = [...rows].sort((a, b) => {
    if (a.part !== b.part) return a.part.localeCompare(b.part);
    if ((a.group ?? "") !== (b.group ?? "")) return (a.group ?? "").localeCompare(b.group ?? "");
    return a.sort_order - b.sort_order;
  });
  for (const r of sorted) {
    if (r.part.startsWith("part") && s.partQuestions[r.part]) {
      s.partQuestions[r.part].push({
        id: `${r.part}_${r.sort_order}`,
        text: r.text ?? "",
        options: r.options ?? [],
      });
    } else if (r.part === "agravamentos" && r.group && r.tag_label) {
      const grp = r.group as "vata" | "pitta" | "kapha";
      if (s.agravamentos[grp]) s.agravamentos[grp].push({
        label: r.tag_label,
        scores: (r.options?.[0]?.scores) ?? {},
      });
    } else if (r.part === "foods" && r.group && r.tag_label) {
      const grp = r.group as "vata" | "pitta" | "kapha";
      if (s.foods[grp]) s.foods[grp].push({
        label: r.tag_label,
        scores: (r.options?.[0]?.scores) ?? {},
      });
    }
  }
  return s;
};

const stateToInsertRows = (s: State) => {
  const rows: any[] = [];
  for (const part of ["part1","part2","part3","part4","part5","part6","part7"] as const) {
    s.partQuestions[part].forEach((q, i) => {
      rows.push({
        part, group: null, sort_order: i, text: q.text, options: q.options as any, tag_label: null,
      });
    });
  }
  for (const grp of ["vata","pitta","kapha"] as const) {
    s.agravamentos[grp].forEach((t, i) => {
      rows.push({
        part: "agravamentos", group: grp, sort_order: i, text: null,
        options: [{ label: t.label, scores: t.scores }] as any, tag_label: t.label,
      });
    });
    s.foods[grp].forEach((t, i) => {
      rows.push({
        part: "foods", group: grp, sort_order: i, text: null,
        options: [{ label: t.label, scores: t.scores }] as any, tag_label: t.label,
      });
    });
  }
  return rows;
};

const TagListEditor = ({
  title, items, onChange, defaultAxis,
}: {
  title: string;
  items: TagItem[];
  onChange: (next: TagItem[]) => void;
  defaultAxis: keyof ScoreValues;
}) => {
  return (
    <div className="border rounded-lg bg-card p-4 space-y-2">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="space-y-2">
        {items.map((t, idx) => (
          <div key={idx} className="border rounded-md p-2 bg-muted/30 space-y-2">
            <div className="flex gap-2">
              <Input
                value={t.label}
                onChange={e => onChange(items.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))}
                className="text-sm h-8"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <ScoreTagPicker value={t.scores} onChange={scores => onChange(items.map((x, i) => i === idx ? { ...x, scores } : x))} />
            {summarizeScores(t.scores) && (
              <p className="text-[11px] text-muted-foreground italic">Pontuação: {summarizeScores(t.scores)}</p>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { label: "Novo item", scores: { [defaultAxis]: 1 } }])}
        className="gap-1"
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar item
      </Button>
    </div>
  );
};

interface VersionRow {
  id: string;
  version_number: number;
  label: string | null;
  created_at: string;
}

const AdminTeste = () => {
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");

  const refetchAll = async () => {
    setLoading(true);
    try {
      const rows = await fetchDoshaTestRows();
      setState(stateFromRows(rows));
      const { data: vs } = await supabase
        .from("dosha_test_versions" as any)
        .select("id, version_number, label, created_at")
        .order("version_number", { ascending: false });
      const list = (vs ?? []) as unknown as VersionRow[];
      setVersions(list);
      if (list.length) setCurrentVersion(list[0].version_number);
    } catch (e: any) {
      console.error("[AdminTeste] load error:", e);
      toast.error("Erro ao carregar conteúdo do teste.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetchAll(); }, []);

  const saveAll = async () => {
    if (!state) return;
    setSaving(true);
    try {
      const newRows = stateToInsertRows(state);
      // Delete all + insert all (small dataset)
      const { error: delErr } = await supabase
        .from("dosha_test_questions" as any)
        .delete()
        .gte("sort_order", -999999);
      if (delErr) throw delErr;
      if (newRows.length) {
        const { error: insErr } = await supabase
          .from("dosha_test_questions" as any)
          .insert(newRows);
        if (insErr) throw insErr;
      }
      toast.success("Conteúdo salvo!");
      await refetchAll();
    } catch (e: any) {
      console.error("[AdminTeste] save error:", e);
      toast.error("Erro ao salvar: " + (e.message ?? "desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const saveAsNewVersion = async () => {
    try {
      // First save current edits
      await saveAll();
      // Then snapshot
      const { data: rows, error } = await supabase
        .from("dosha_test_questions" as any)
        .select("*");
      if (error) throw error;
      const { error: vErr } = await supabase
        .from("dosha_test_versions" as any)
        .insert({
          label: versionLabel || `Versão de ${new Date().toLocaleString("pt-BR")}`,
          snapshot: rows as any,
        });
      if (vErr) throw vErr;
      toast.success("Nova versão salva no histórico!");
      setVersionLabel("");
      await refetchAll();
    } catch (e: any) {
      console.error("[AdminTeste] version save error:", e);
      toast.error("Erro ao salvar versão: " + (e.message ?? "desconhecido"));
    }
  };

  const restoreVersion = async (versionNumber: number) => {
    if (!confirm(`Restaurar a versão ${versionNumber}? As edições atuais não salvas serão perdidas.`)) return;
    try {
      const { error } = await supabase.rpc("restore_dosha_test_version" as any, {
        _version_number: versionNumber,
      } as any);
      if (error) throw error;
      toast.success(`Versão ${versionNumber} restaurada!`);
      setHistoryOpen(false);
      await refetchAll();
    } catch (e: any) {
      console.error("[AdminTeste] restore error:", e);
      toast.error("Erro ao restaurar: " + (e.message ?? "desconhecido"));
    }
  };

  const updatePartQuestions = (part: string, qs: Question[]) => {
    setState(s => s ? { ...s, partQuestions: { ...s.partQuestions, [part]: qs } } : s);
  };

  const updateAgrav = (grp: "vata" | "pitta" | "kapha", items: TagItem[]) => {
    setState(s => s ? { ...s, agravamentos: { ...s.agravamentos, [grp]: items } } : s);
  };
  const updateFoods = (grp: "vata" | "pitta" | "kapha", items: TagItem[]) => {
    setState(s => s ? { ...s, foods: { ...s.foods, [grp]: items } } : s);
  };

  if (loading || !state) {
    return (
      <>
        <AdminNav />
        <div className="max-w-5xl mx-auto p-6 flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Admin — Teste de Dosha</title></Helmet>
      <AdminNav />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Version bar */}
        <div className="flex flex-wrap items-center gap-2 border rounded-lg p-3 bg-card">
          <span className="text-sm">
            Versão atual: <strong>v{currentVersion ?? "?"}</strong>
            {versions[0]?.label && <span className="text-muted-foreground"> — {versions[0].label}</span>}
          </span>
          <div className="ml-auto flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Rótulo da nova versão (opcional)"
              value={versionLabel}
              onChange={e => setVersionLabel(e.target.value)}
              className="h-9 w-64"
            />
            <Button onClick={saveAsNewVersion} disabled={saving} size="sm" className="gap-1">
              <Save className="w-4 h-4" /> Salvar nova versão
            </Button>
            <Button onClick={() => setHistoryOpen(true)} variant="outline" size="sm" className="gap-1">
              <HistoryIcon className="w-4 h-4" /> Histórico
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveAll} disabled={saving} variant="secondary" size="sm" className="gap-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar mudanças
          </Button>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {STEP_CONFIG.map((step, idx) => {
            const partKey = step.part;
            return (
              <AccordionItem key={partKey} value={partKey} className="border rounded-lg bg-card px-3">
                <AccordionTrigger className="text-left hover:no-underline">
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pt-2">
                  {partKey.startsWith("part") && state.partQuestions[partKey] && (
                    <>
                      {state.partQuestions[partKey].map((q, qIdx) => (
                        <QuestionCard
                          key={qIdx}
                          question={q}
                          onChange={next => updatePartQuestions(partKey, state.partQuestions[partKey].map((x, i) => i === qIdx ? next : x))}
                          onRemove={() => updatePartQuestions(partKey, state.partQuestions[partKey].filter((_, i) => i !== qIdx))}
                          onDuplicate={() => {
                            const arr = [...state.partQuestions[partKey]];
                            arr.splice(qIdx + 1, 0, { ...q, id: `${partKey}_dup_${Date.now()}` });
                            updatePartQuestions(partKey, arr);
                          }}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updatePartQuestions(partKey, [
                          ...state.partQuestions[partKey],
                          { id: `${partKey}_new_${Date.now()}`, text: "Nova pergunta", options: [{ label: "Opção", scores: {} }] },
                        ])}
                        className="gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Nova pergunta
                      </Button>
                    </>
                  )}
                  {partKey === "part8" && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-3">
                        <TagListEditor title="💨 Agrav. Vata" items={state.agravamentos.vata} onChange={items => updateAgrav("vata", items)} defaultAxis="v" />
                        <TagListEditor title="🔥 Agrav. Pitta" items={state.agravamentos.pitta} onChange={items => updateAgrav("pitta", items)} defaultAxis="p" />
                        <TagListEditor title="🪨 Agrav. Kapha" items={state.agravamentos.kapha} onChange={items => updateAgrav("kapha", items)} defaultAxis="k" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-2">Alimentos consumidos</h3>
                        <div className="grid md:grid-cols-3 gap-3">
                          <TagListEditor title="💨 Alim. Vata" items={state.foods.vata} onChange={items => updateFoods("vata", items)} defaultAxis="v" />
                          <TagListEditor title="🔥 Alim. Pitta" items={state.foods.pitta} onChange={items => updateFoods("pitta", items)} defaultAxis="p" />
                          <TagListEditor title="🪨 Alim. Kapha" items={state.foods.kapha} onChange={items => updateFoods("kapha", items)} defaultAxis="k" />
                        </div>
                      </div>
                    </div>
                  )}
                  {partKey === "interests" && (
                    <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                      Esta etapa é fixa no código (e-mail, altura, peso, localização, interesses, relato pessoal) e não é editável aqui.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="flex justify-end pt-4">
          <Button onClick={saveAll} disabled={saving} className="gap-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar mudanças
          </Button>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de versões</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {versions.map(v => (
              <div key={v.id} className="flex items-center gap-3 border rounded-md p-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">v{v.version_number} {v.label && `— ${v.label}`}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => restoreVersion(v.version_number)}>
                  Restaurar
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminTeste;
