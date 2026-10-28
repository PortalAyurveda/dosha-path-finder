import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { DIAS_LETRAS } from "@/lib/terapiaIndicacoes";
import { constanciaPaciente, contagemItem, dataCurta, linhaCurta, linhaFolha, pctItem, subItem, vaziosAntes, type ConstanciaPaciente } from "@/lib/terapiaConstancia";
import "./constancia.css";

const useConstancia = (paciente: string) => useQuery({ queryKey: ["terapia-constancia", paciente], queryFn: () => constanciaPaciente(paciente), retry: false, staleTime: 60_000 });

function Mapa({ c }: { c: ConstanciaPaciente }) {
  const hoje = c.mapa[c.mapa.length - 1]?.dia;
  return <div className="ct-mapa" role="img" aria-label={`${c.dias_com_cuidado} de ${c.dias_total} dias com cuidado`}>
    {DIAS_LETRAS.map((l, i) => <span key={`l${i}`} className="ct-letra">{l}</span>)}
    {Array.from({ length: vaziosAntes(c) }, (_, i) => <span key={`v${i}`} />)}
    {c.mapa.map(d => <span key={d.dia} className={`ct-q ${d.cuidou ? "cuidou" : ""} ${d.dia === hoje ? "hoje" : ""}`}>{Number(d.dia.slice(8))}</span>)}
  </div>;
}

/** Parte 29: primeiro cartão da Ficha — como a pessoa tem feito a folha. */
export default function ConstanciaFolha({ paciente }: { paciente: string }) {
  const q = useConstancia(paciente);
  const [mes, setMes] = useState(false);
  const c = q.data;
  if (!c?.folha) return null;
  const nota = c.inclui_rotina ? "O mapa conta o dia em que ela marcou qualquer cuidado (da sua folha ou da Minha Rotina). A lista conta só os dias em que o item valia." : "O mapa conta só os cuidados da sua folha.";
  const ultimos = c.mapa.slice(-10);
  return <section className="ct-cartao" aria-labelledby="ct-titulo">
    <header className="ct-cab"><h2 id="ct-titulo">Como ela tem feito a folha</h2><small>{linhaFolha(c.folha)}</small></header>
    <div className="ct-grade">
      <div className="ct-esq">
        <p className="ct-eti ct-pc">Últimos 30 dias</p>
        <div className="ct-pc"><Mapa c={c} /></div>
        <p className="ct-total"><b>{c.dias_com_cuidado} de {c.dias_total} dias</b> com algum cuidado<span className="ct-pc"> marcado</span></p>
        <div className="ct-cel">
          <div className="ct-bolas" aria-label="Últimos 10 dias">{ultimos.map(d => <span key={d.dia} title={dataCurta(d.dia)} className={`ct-bola ${d.cuidou ? "cuidou" : ""}`}>{d.cuidou && <Check size={11} strokeWidth={3} aria-hidden="true" />}</span>)}</div>
          <button type="button" className="ct-link" aria-expanded={mes} onClick={() => setMes(v => !v)}>{mes ? "fechar o mês" : "ver o mês"}</button>
          {mes && <Mapa c={c} />}
        </div>
      </div>
      <div className="ct-dir">
        <p className="ct-eti">Cada item da folha atual</p>
        <ul>{c.itens.map(i => <li key={i.item_id}>
          <div className="min-w-0"><b>{i.titulo}</b><small>{subItem(i)}</small></div>
          {i.secao === "ler"
            ? <span className={i.visto_em ? "ct-viu" : "ct-nviu"}>{i.visto_em ? `viu em ${dataCurta(i.visto_em)}` : "ainda não viu"}</span>
            : <><span className="ct-barra" aria-hidden="true"><span style={{ width: `${pctItem(i)}%` }} /></span><span className="ct-n"><span className="ct-pc">{contagemItem(i)}</span><span className="ct-cel">{contagemItem(i, true)}</span></span></>}
        </li>)}</ul>
      </div>
    </div>
    <p className="ct-nota">{nota}</p>
  </section>;
}

/** Linha na coluna da ficha (avaliação e folha da consulta). */
export function LinhaConstancia({ paciente }: { paciente: string }) {
  const q = useConstancia(paciente);
  if (!q.data?.folha) return null;
  return <p className="ct-linha">Como fez a folha anterior: <b>{linhaCurta(q.data)}</b> · <Link to={`/painel-terapeuta/paciente/${paciente}?aba=ficha`}>ver na Ficha</Link></p>;
}
