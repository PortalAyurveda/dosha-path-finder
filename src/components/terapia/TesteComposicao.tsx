import type { ResumoAreas, TesteCompleto, TestePaciente, SomaParte } from '@/lib/terapiaPaciente';
import { AGNIS_TESTE, DOSHAS_TESTE, linhasComposicao, mesmoRegistro, pontosOrigem, vencedorAgni } from '@/lib/terapiaTesteCompleto';
import TesteCompletoPainel from './TesteCompleto';
import './testeCompleto.css';

function AgniCelula({ soma }: { soma: SomaParte }) {
  const itens = AGNIS_TESTE.filter(([tipo]) => (soma[`agni_${tipo}`] ?? 0) > 0);
  return <>{itens.map(([tipo, dosha], i) => <span key={tipo}>{i > 0 && ' · '}<b className={`tc-${dosha}`}>{tipo} {soma[`agni_${tipo}`]}</b></span>)}</>;
}
export default function TesteComposicao({ resumo: r, completo, teste }: { resumo: ResumoAreas; completo?: TesteCompleto | null; teste?: TestePaciente | null }) {
  const detalhado = mesmoRegistro(completo, teste);
  const linhas = linhasComposicao(r, completo, teste);
  const agni = r.agni;
  const vencedor = vencedorAgni(agni);
  const totais = detalhado && completo ? { vata: completo.vata, pitta: completo.pitta, kapha: completo.kapha } : pontosOrigem(r.composicao, 'total');
  const maxima = Object.fromEntries(DOSHAS_TESTE.map(d => [d, Math.max(...linhas.map(l => l.soma[d]), 0)]));
  return <>
    <h3 className="ra-eti">De onde vêm os pontos</h3>
    <table className={`tc-tabela ${detalhado ? 'tc-detalhada' : ''}`}><thead><tr><th scope="col">{detalhado ? 'Parte do teste' : 'Origem'}</th>{DOSHAS_TESTE.map(d => <th key={d} scope="col">{d[0].toUpperCase()}{d.slice(1)}</th>)}{detalhado && <th scope="col">Agni</th>}</tr></thead><tbody>
      {linhas.map((l, i) => <tr key={i} className={l.separador ? 'tc-separador' : undefined}><td>{l.titulo}</td>{DOSHAS_TESTE.map(d => <td key={d}><span className={`tc-numero ${l.soma[d] === 0 ? 'tc-zero' : `tc-${d}${l.soma[d] === maxima[d] ? ' tc-max' : ''}`}`}>{l.soma[d]}</span></td>)}{detalhado && <td className="tc-agni-cel"><AgniCelula soma={l.soma} /></td>}</tr>)}
      <tr className="tc-total"><td>Total</td>{DOSHAS_TESTE.map(d => <td key={d} className={`tc-${d}`}>{totais[d]}</td>)}{detalhado && <td className="tc-agni-cel"><AgniCelula soma={{ ...totais, agni_irregular: agni.irregular, agni_forte: agni.forte, agni_fraco: agni.fraco }} /></td>}</tr>
    </tbody></table>
    {!detalhado && <p className="tc-nota">Este teste foi feito antes de o Portal guardar cada resposta. Os testes novos mostram parte por parte.</p>}
    <div className="tc-agni-box"><h3 className="ra-eti">Como o agni é calculado</h3><div className="tc-agni-somas">{AGNIS_TESTE.map(([tipo, dosha, label]) => <span key={tipo} className={`tc-selo tc-${dosha}${vencedor === tipo ? ' tc-ganha' : ''}`}>{label} · {dosha[0].toUpperCase()}{dosha.slice(1)} {agni[tipo]}</span>)}</div><p className="tc-atual">Agni atual: {teste?.agni || (detalhado ? completo?.agni.texto : null) || [agni.tipo, agni.texto || (agni.nivel != null ? `nível ${agni.nivel}` : '')].filter(Boolean).join(', ')}</p><p className="tc-nota">Vence a maior soma. Se forte ou fraco vencer com até 2 pontos a mais que o irregular, fica irregular. Nível pela soma de quem venceu: até 2, digestão boa; 3 a 6, nível 1; 7 a 10, nível 2; 11 ou mais, nível 3.</p></div>
    {completo && <TesteCompletoPainel completo={completo} teste={teste} />}
  </>;
}