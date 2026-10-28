import { Check } from "lucide-react";
import { DIAS_CURTOS } from "@/lib/terapiaIndicacoes";
import { diasDeCuidado, type CuidadosFita } from "@/lib/terapiaMeu";
import "./doSeuTerapeuta.css";

/** Fita dos últimos 7 dias (cuidados_fita), usada no Seu dia e na Minha Rotina — uma por página. */
export default function FitaCuidados({ fita, dia, onDia, primeiroDia = false, dica = true }: { fita: CuidadosFita; dia: string; onDia: (dia: string | null) => void; primeiroDia?: boolean; dica?: boolean }) {
  const hoje = fita.hoje;
  return <div className="sd-fita no-print">
    <div className="sd-fita-dias" role="group" aria-label="Últimos 7 dias">
      {fita.dias.map(d => {
        const ehHoje = d.dia === hoje;
        const sel = d.dia === dia;
        const curto = DIAS_CURTOS[d.dow - 1];
        return (
          <button key={d.dia} type="button" disabled={!d.pode_marcar && !ehHoje} aria-pressed={sel} aria-label={ehHoje ? "Hoje" : `${curto} ${Number(d.dia.slice(8))}`}
            className={`sd-fita-dia ${ehHoje ? "hoje" : ""} ${sel && !ehHoje ? "sel" : ""} ${d.pode_marcar || ehHoje ? "" : "travado"}`}
            onClick={() => onDia(ehHoje ? null : d.dia)}>
            <span className="sd-fita-dow">{ehHoje ? "Hoje" : curto[0].toUpperCase() + curto.slice(1)}</span>
            <span className="sd-fita-num">{Number(d.dia.slice(8))}</span>
            <span className={`sd-fita-bola ${d.cuidou ? "cuidou" : ""}`}>{d.cuidou && <Check size={12} strokeWidth={3} aria-hidden="true" />}</span>
          </button>
        );
      })}
    </div>
    <p className="sd-fita-resumo">
      {primeiroDia ? <b>1º dia da sua folha</b> : <><b>{diasDeCuidado(fita.mes.dias_com_cuidado)}</b> em {fita.mes.nome}</>}
      {dica && <span className="sd-fita-dica"> · toque em ontem ou anteontem para marcar o que ficou</span>}
    </p>
  </div>;
}
