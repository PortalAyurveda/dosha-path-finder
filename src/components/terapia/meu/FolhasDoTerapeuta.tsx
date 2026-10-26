import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { diaBR } from "@/lib/terapia";
import { meu, type MinhaFolha } from "@/lib/terapiaMeu";
import DoSeuTerapeuta from "./DoSeuTerapeuta";

/** Mostra uma folha (já carregada ou por id) com o botão "Folhas anteriores". */
export default function FolhasDoTerapeuta({ inicial, inicialId, rodape }: { inicial?: MinhaFolha; inicialId?: string; rodape?: string }) {
  const [id, setId] = useState(inicialId ?? inicial?.id ?? "");
  const [lista, setLista] = useState(false);
  const folha = useQuery({ queryKey: ["minha-folha", id], queryFn: () => meu.folha(id), enabled: !!id && !(inicial && id === inicial.id), retry: false });
  const ligacoes = useQuery({ queryKey: ["meu-terapeuta"], queryFn: meu.terapeuta, enabled: lista });
  const atual = inicial && id === inicial.id ? inicial : folha.data;
  const folhas = (ligacoes.data ?? []).flatMap(l => l.folhas.map(f => ({ ...f, terapeuta: l.terapeuta.primeiro_nome })));
  return (
    <div className="space-y-3">
      {atual ? <DoSeuTerapeuta folha={atual} rodape={rodape} /> : folha.error ? <p role="alert" className="text-sm text-destructive">{folha.error.message}</p> : <p role="status" className="text-sm text-muted-foreground">Carregando folha…</p>}
      <Button variant="ghost" size="sm" aria-expanded={lista} onClick={() => setLista(v => !v)}>{lista ? "Fechar folhas anteriores" : "Folhas anteriores"}</Button>
      {lista && (ligacoes.isLoading ? <p role="status" className="text-sm text-muted-foreground">Carregando…</p>
        : ligacoes.error ? <p role="alert" className="text-sm text-destructive">{ligacoes.error.message}</p>
        : !folhas.length ? <p className="text-sm text-muted-foreground">Nenhuma folha ainda.</p>
        : <ul className="divide-y divide-border rounded-xl border border-border">{folhas.map(f => <li key={f.id} className="flex items-center justify-between gap-3 p-3 text-sm"><span>{diaBR(f.enviada_em)} · {f.terapeuta}{f.diagnostico ? ` · ${f.diagnostico.slice(0, 60)}` : ""}</span><Button size="sm" variant={f.id === id ? "secondary" : "outline"} onClick={() => { setId(f.id); setLista(false); }}>{f.id === id ? "Aberta" : "Abrir"}</Button></li>)}</ul>)}
    </div>
  );
}
