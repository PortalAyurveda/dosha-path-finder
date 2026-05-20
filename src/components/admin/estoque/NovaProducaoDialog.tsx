import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNovaProducao, useProdutos } from "@/hooks/useSamkhyaEstoque";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NovaProducaoDialog({ open, onOpenChange }: Props) {
  const { data: produtos } = useProdutos();
  const create = useNovaProducao();
  const [produtoId, setProdutoId] = useState<string>("");
  const [unidades, setUnidades] = useState("1");

  useEffect(() => {
    if (open) {
      setProdutoId("");
      setUnidades("1");
    }
  }, [open]);

  const ativos = (produtos ?? []).filter((p) => p.ativo !== false);

  const submit = async () => {
    if (!produtoId) {
      toast.error("Escolha um produto");
      return;
    }
    const n = Number(unidades);
    if (!n || n <= 0) {
      toast.error("Quantidade inválida");
      return;
    }
    try {
      await create.mutateAsync({ produto_id: Number(produtoId), unidades_desejadas: n });
      toast.success("Produção planejada criada");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar produção");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova produção</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Produto</Label>
            <Select value={produtoId} onValueChange={setProdutoId}>
              <SelectTrigger><SelectValue placeholder="Escolha um produto" /></SelectTrigger>
              <SelectContent>
                {ativos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Unidades desejadas</Label>
            <Input type="number" min={1} value={unidades} onChange={(e) => setUnidades(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? "Criando..." : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
