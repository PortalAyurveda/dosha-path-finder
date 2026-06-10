import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useSemaforoPotes,
  useSemaforoEtiquetas,
  useUpdatePoteEstoque,
  useUpdateEtiquetaEstoque,
} from "@/hooks/useSamkhyaEstoque";
import SemaforoBadge from "../SemaforoBadge";

function Linha({
  nome,
  estoqueAtual,
  meta,
  dias,
  semaforo,
  onSave,
}: {
  nome: string;
  estoqueAtual: number;
  meta: number;
  dias: number | null;
  semaforo: string;
  onSave: (n: number) => Promise<void> | void;
}) {
  const [val, setVal] = useState(String(estoqueAtual));
  useEffect(() => setVal(String(estoqueAtual)), [estoqueAtual]);

  return (
    <TableRow>
      <TableCell className="font-medium">{nome}</TableCell>
      <TableCell className="w-[140px]">
        <Input
          type="number"
          min={0}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={async () => {
            const n = Number(val);
            if (n !== estoqueAtual) await onSave(n);
          }}
          className="h-8"
        />
      </TableCell>
      <TableCell className="text-right">{Math.round(Number(meta ?? 0))}</TableCell>
      <TableCell className="text-right">{dias != null ? Math.round(Number(dias)) : "—"}</TableCell>
      <TableCell><SemaforoBadge semaforo={semaforo} /></TableCell>
    </TableRow>
  );
}

export default function TabEstoqueEtiquetas() {
  const potesQ = useSemaforoPotes();
  const etiqQ = useSemaforoEtiquetas();
  const upPote = useUpdatePoteEstoque();
  const upEtiq = useUpdateEtiquetaEstoque();

  return (
    <div className="space-y-6">
      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Potes</header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Meta 60d</TableHead>
              <TableHead className="text-right">Dias rest.</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {potesQ.isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Carregando…</TableCell></TableRow>}
            {(potesQ.data ?? []).map((p) => (
              <Linha
                key={p.tipo}
                nome={p.label}
                estoqueAtual={Number(p.qnt_estoque ?? 0)}
                meta={Number(p.meta_60_dias ?? 0)}
                dias={p.dias_estoque}
                semaforo={p.semaforo}
                onSave={async (n) => {
                  try {
                    await upPote.mutateAsync({ tipo: p.tipo, qnt: n });
                    toast.success("Estoque atualizado");
                  } catch (e: any) { toast.error(e?.message ?? "Erro"); }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="rounded border bg-card">
        <header className="p-3 border-b font-medium">Etiquetas</header>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Meta 60d</TableHead>
              <TableHead className="text-right">Dias rest.</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {etiqQ.isLoading && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Carregando…</TableCell></TableRow>}
            {(etiqQ.data ?? []).map((e) => (
              <Linha
                key={e.produto_nome}
                nome={e.produto_nome}
                estoqueAtual={Number(e.qnt_estoque ?? 0)}
                meta={Number(e.meta_60_dias ?? 0)}
                dias={e.dias_estoque}
                semaforo={e.semaforo}
                onSave={async (n) => {
                  try {
                    await upEtiq.mutateAsync({ produto_nome: e.produto_nome, qnt: n });
                    toast.success("Estoque atualizado");
                  } catch (err: any) { toast.error(err?.message ?? "Erro"); }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
