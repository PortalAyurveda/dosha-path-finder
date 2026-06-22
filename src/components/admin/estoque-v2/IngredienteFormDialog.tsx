import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { samkhyaSupabase } from "@/integrations/supabase/samkhya-client";

interface FormState {
  nome: string;
  categoria: string;
  qnt_estoque_g: string;
  preco_kg: string;
  notas: string;
}

const EMPTY: FormState = { nome: "", categoria: "", qnt_estoque_g: "0", preco_kg: "0", notas: "" };

export default function IngredienteFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: Partial<FormState> & { id?: number };
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        nome: initial?.nome ?? "",
        categoria: initial?.categoria ?? "",
        qnt_estoque_g: initial?.qnt_estoque_g ?? "0",
        preco_kg: initial?.preco_kg ?? "0",
        notas: initial?.notas ?? "",
      });
    }
  }, [open, initial]);

  const isEdit = !!initial?.id;

  const onSave = async () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        categoria: form.categoria.trim() || null,
        qnt_estoque_g: Number(form.qnt_estoque_g) || 0,
        preco_kg: Number(form.preco_kg) || 0,
        notas: form.notas.trim() || null,
      };
      if (isEdit && initial?.id) {
        const { error } = await samkhyaSupabase
          .from("ingredientes")
          .update(payload)
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Ingrediente atualizado");
      } else {
        const { error } = await samkhyaSupabase.from("ingredientes").insert(payload);
        if (error) throw error;
        toast.success("Ingrediente criado");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar ingrediente" : "Novo ingrediente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
              disabled={isEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <Input
                value={form.categoria}
                onChange={(e) => setForm((s) => ({ ...s, categoria: e.target.value }))}
              />
            </div>
            <div>
              <Label>Preço /kg (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.preco_kg}
                onChange={(e) => setForm((s) => ({ ...s, preco_kg: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Estoque (g)</Label>
            <Input
              type="number"
              value={form.qnt_estoque_g}
              onChange={(e) => setForm((s) => ({ ...s, qnt_estoque_g: e.target.value }))}
            />
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea
              value={form.notas}
              onChange={(e) => setForm((s) => ({ ...s, notas: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
