import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSaveIngrediente } from "@/hooks/useSamkhyaEstoque";
import type { SkEstoqueRow } from "@/integrations/supabase/samkhya-client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingrediente?: SkEstoqueRow | null; // null/undefined = criação
}

export default function IngredienteFormDialog({ open, onOpenChange, ingrediente }: Props) {
  const isEdit = !!ingrediente?.id;
  const save = useSaveIngrediente();
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    qnt_estoque_g: "0",
    preco_kg: "",
    notas: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        nome: ingrediente?.nome ?? "",
        categoria: ingrediente?.categoria ?? "",
        qnt_estoque_g: String(ingrediente?.qnt_estoque_g ?? 0),
        preco_kg: ingrediente?.preco_kg != null ? String(ingrediente.preco_kg) : "",
        notas: ingrediente?.notas ?? "",
      });
    }
  }, [open, ingrediente]);

  const submit = async () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do ingrediente");
      return;
    }
    try {
      await save.mutateAsync({
        ...(isEdit ? { id: ingrediente!.id } : {}),
        ...(isEdit ? {} : { nome: form.nome.trim() }),
        categoria: form.categoria.trim() || null,
        qnt_estoque_g: Number(form.qnt_estoque_g) || 0,
        preco_kg: form.preco_kg === "" ? null : Number(form.preco_kg),
        notas: form.notas.trim() || null,
      });
      toast.success(isEdit ? "Ingrediente atualizado" : "Ingrediente criado");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar ingrediente" : "Novo ingrediente"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {!isEdit && (
            <div className="grid gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Input id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="qnt">Estoque (g)</Label>
              <Input
                id="qnt"
                type="number"
                step="0.01"
                value={form.qnt_estoque_g}
                onChange={(e) => setForm({ ...form, qnt_estoque_g: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="preco">Preço por kg (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                value={form.preco_kg}
                onChange={(e) => setForm({ ...form, preco_kg: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" rows={3} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
