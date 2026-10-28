import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Leaf } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Nugget } from "@/components/rotina/NuggetDetalhe";
import NuggetIscaDialog from "@/components/rotina/NuggetIscaDialog";
import FitaCuidados from "@/components/terapia/meu/FitaCuidados";
import { diaSP, meu, progressoSecao, rotuloDiaMarcando } from "@/lib/terapiaMeu";
import { dataCuidados, dowISO, marcado, partesCuidado, refCuidado, semanaISO, tresDiasAtras, type PontoCuidado, type TipoCuidado } from "@/lib/rotinaCuidados";
import "./cuidadosDoDia.css";

export interface PraticaDoDia { slot: string; label: string; nugget?: Nugget; nuggetId?: string | null }

/** Parte 30: cartão "Seus cuidados de hoje" com a fita, ritual/bônus, 3 hábitos e "Hoje eu evitei". */
export default function CuidadosDoDia({ userId, habitos, alertas, praticas, frase }: {
  userId: string;
  habitos: { habito: string; periodo?: string }[];
  alertas: string[];
  /** Ritual da manhã e bônus do dia de uma data (dow 1–7, semana 1–5). Ausente = sem ritual/bônus. */
  praticas?: (dow: number, semana: number) => PraticaDoDia[];
  frase?: string;
}) {
  const qc = useQueryClient();
  const fitaQ = useQuery({ queryKey: ["cuidados-fita"], queryFn: meu.fita, retry: false });
  const fita = fitaQ.data;
  const hoje = fita?.hoje ?? diaSP(new Date());
  const [diaSel, setDiaSel] = useState<string | null>(null);
  const dia = diaSel ?? hoje;
  const dow = dowISO(dia);
  const desde = tresDiasAtras(hoje);
  const chave = ["rotina-cuidados", userId, desde] as const;
  const pontosQ = useQuery({
    queryKey: chave,
    queryFn: async () => {
      const { data, error } = await (supabase.from("rotina_pontos") as any)
        .select("data, tipo, referencia").eq("user_id", userId).gte("data", desde);
      if (error) throw error;
      return (data ?? []) as PontoCuidado[];
    },
  });
  const pontos = pontosQ.data ?? [];
  const [aberto, setAberto] = useState<Nugget | null>(null);

  const alternar = async (tipo: TipoCuidado, chaveItem: string, nuggetId: string | null = null) => {
    const ref = refCuidado(dow, chaveItem);
    const ja = marcado(pontos, dia, tipo, ref);
    qc.setQueryData<PontoCuidado[]>(chave as any, prev => ja
      ? (prev ?? []).filter(p => !(p.data === dia && p.tipo === tipo && p.referencia === ref))
      : [...(prev ?? []), { data: dia, tipo, referencia: ref }]);
    const tabela = supabase.from("rotina_pontos") as any;
    const { error } = ja
      ? await tabela.delete().eq("user_id", userId).eq("data", dia).eq("tipo", tipo).eq("referencia", ref)
      : await tabela.insert({ user_id: userId, data: dia, tipo, pontos: 1, referencia: ref, nugget_id: nuggetId });
    if (error && (error as any).code !== "23505") {
      toast({ title: "Não consegui salvar", description: error.message, variant: "destructive" });
    }
    void qc.invalidateQueries({ queryKey: chave as any });
    void qc.invalidateQueries({ queryKey: ["cuidados-fita"] });
    void qc.invalidateQueries({ queryKey: ["rotina-pontos-hoje"] });
  };

  const lista = praticas ? praticas(dow, semanaISO(dia)) : [];
  const feitosPraticas = lista.filter(p => marcado(pontos, dia, "acerto_rotina", refCuidado(dow, p.slot))).length;
  const feitosHabitos = habitos.filter(h => marcado(pontos, dia, "acerto_habito", refCuidado(dow, h.habito))).length;
  const total = lista.length + habitos.length;
  const evitados = alertas.filter(a => marcado(pontos, dia, "evitei", refCuidado(dow, a))).length;

  const Linha = ({ feito, titulo, sub, onToggle, ver }: { feito: boolean; titulo: string; sub?: string; onToggle: () => void; ver?: () => void }) => (
    <li className={feito ? "feito" : ""}>
      <Checkbox className="sd-ck" checked={feito} onCheckedChange={onToggle} aria-label={`Feito: ${titulo}`} />
      <div className="min-w-0">
        <b>{titulo}</b>
        {(sub || ver) && <small>{sub}{sub && ver ? " · " : ""}{ver && <button type="button" className="rc-ver" onClick={ver}>ver como fazer</button>}</small>}
      </div>
    </li>
  );

  return (
    <section className="rc-cartao" aria-labelledby="rc-titulo">
      <header className="rc-cab"><h2 id="rc-titulo">Seus cuidados de hoje</h2><small>{dataCuidados(dia)}</small></header>
      {fita && <FitaCuidados fita={fita} dia={dia} onDia={setDiaSel} dica={false} />}
      {frase && <p className="rc-frase">{frase}</p>}
      {dia !== hoje && <div className="sd-faixa" role="status"><span>{rotuloDiaMarcando(dia, hoje)}</span><button type="button" onClick={() => setDiaSel(null)}>Voltar para hoje</button></div>}
      {total > 0 && <>
        <p className="rc-conta">{progressoSecao(feitosPraticas + feitosHabitos, total).replace("feito hoje", dia === hoje ? "feito hoje" : "feito")}</p>
        <ul className="rc-lista">
          {lista.map(p => <Linha key={p.slot} feito={marcado(pontos, dia, "acerto_rotina", refCuidado(dow, p.slot))}
            titulo={p.nugget?.titulo ?? p.label} sub={p.label} onToggle={() => void alternar("acerto_rotina", p.slot, p.nuggetId ?? null)}
            ver={p.nugget ? () => setAberto(p.nugget!) : undefined} />)}
          {habitos.map(h => { const t = partesCuidado(h.habito, h.periodo); return <Linha key={h.habito} feito={marcado(pontos, dia, "acerto_habito", refCuidado(dow, h.habito))} titulo={t.titulo} sub={t.sub} onToggle={() => void alternar("acerto_habito", h.habito)} />; })}
        </ul>
      </>}
      {alertas.length > 0 && <>
        <h3 className="rc-evitei"><span><Leaf className="h-4 w-4" aria-hidden="true" /> Hoje eu evitei</span><small>{evitados} de {alertas.length}</small></h3>
        <ul className="rc-lista">
          {alertas.map(a => { const t = partesCuidado(a); return <Linha key={a} feito={marcado(pontos, dia, "evitei", refCuidado(dow, a))} titulo={t.titulo} sub={t.sub} onToggle={() => void alternar("evitei", a)} />; })}
        </ul>
      </>}
      {aberto && <NuggetIscaDialog nugget={aberto} open={!!aberto} onOpenChange={o => { if (!o) setAberto(null); }} />}
    </section>
  );
}
