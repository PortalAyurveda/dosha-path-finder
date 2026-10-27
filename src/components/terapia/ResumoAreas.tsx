import { diaBR } from '@/lib/terapia';
import { fraseResumoAreas, maiorDoshaComposicao } from '@/lib/terapiaPaciente';
import type { ResumoAreas, TestePaciente } from '@/lib/terapiaPaciente';
import { TituloPaciente } from './PacienteComuns';
import './marcadosDosha.css';
import './resumoAreas.css';

const DOSHAS = ['vata', 'pitta', 'kapha'] as const;
const ROTULO = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' } as const;

/** Cartão "Teste de dosha": frase de resumo, composição dos pontos e agni. */
export function CartaoTesteResumo({ resumo: r, data }: { resumo: ResumoAreas; data?: string }) {
  const maior = maiorDoshaComposicao(r.composicao);
  const maiorTotal = Math.max(...DOSHAS.map(d => r.composicao[d]?.total ?? 0), 1);
  const ex = r.composicao[maior];
  return <section className="portal-cartao resumo-areas">
    <TituloPaciente>Teste de dosha{data ? ` · ${diaBR(data)}` : ''}</TituloPaciente>
    <p className="ra-frase">{fraseResumoAreas(r)}</p>
    <h3 className="ra-eti">De onde vêm os pontos</h3>
    <div className="ra-barras">
      {DOSHAS.map(d => { const cp = r.composicao[d]; const total = cp?.total ?? 0; return <div key={d} className="ra-linha">
        <b className={`ra-dosha ra-${d}`}>{ROTULO[d]} {total}</b>
        <div className={`ra-barra ra-${d}`} style={{ width: `${(total / maiorTotal) * 100}%` }} role="img" aria-label={`${ROTULO[d]} ${total}: ${cp?.perguntas ?? 0} das perguntas, ${cp?.queixas ?? 0} das queixas, ${cp?.alimentacao ?? 0} da alimentação`}>
          {total > 0 && <><i className="q1" style={{ width: `${((cp?.perguntas ?? 0) / total) * 100}%` }} /><i className="q2" style={{ width: `${((cp?.queixas ?? 0) / total) * 100}%` }} /><i className="q3" style={{ width: `${((cp?.alimentacao ?? 0) / total) * 100}%` }} /></>}
        </div>
      </div>; })}
    </div>
    <div className="ra-legenda"><span><i className="l1" />Perguntas (corpo, mente, digestão, hábitos)</span><span><i className="l2" />Queixas</span><span><i className="l3" />Alimentação</span></div>
    <p className="ra-sub">{ROTULO[maior]} {ex?.total ?? 0} = {ex?.perguntas ?? 0} das perguntas + {ex?.queixas ?? 0} das queixas + {ex?.alimentacao ?? 0} da alimentação.</p>
    <h3 className="ra-eti">Agni</h3>
    <div className="ra-agni">
      {([['Irregular', r.agni.irregular, 'irregular'], ['Forte', r.agni.forte, 'forte'], ['Fraco', r.agni.fraco, 'fraco']] as const).map(([n, v, t]) => <span key={t} className={r.agni.tipo === t ? 'forte' : ''}>{n} {v}</span>)}
      {r.agni.nivel != null && <span>{r.agni.texto || `Nível ${r.agni.nivel}`}</span>}
    </div>
  </section>;
}

/** Cartão "Queixas por área": áreas em ordem, "Come muito" e o relato. */
export function CartaoQueixasArea({ resumo: r, teste }: { resumo: ResumoAreas; teste?: TestePaciente | null }) {
  return <section className="portal-cartao resumo-areas">
    <TituloPaciente>Queixas por área</TituloPaciente>
    {r.areas.map(a => <div key={a.area} className="ra-area">
      <h3>{a.area}<small>{a.qtd} de {a.de}</small></h3>
      <div className="terapia-marcados">{a.marcou.map(m => <span key={m.queixa} className={`terapia-queixa terapia-queixa-${m.dosha}`}>{m.queixa}</span>)}</div>
    </div>)}
    <h3 className="ra-eti">Come muito</h3>
    <div className="terapia-marcados">{DOSHAS.flatMap(d => (r.alimentacao[d] ?? []).map(a => <span key={`${d}-${a}`} className={`terapia-queixa terapia-queixa-${d}`}>{a}</span>))}</div>
    <p className="ra-sub">{DOSHAS.map(d => `${ROTULO[d]} ${(r.alimentacao[d] ?? []).length} de ${r.alimentacao.de_cada}`).join(' · ')}</p>
    <h3 className="ra-eti">O que escreveu</h3>
    <p className="ra-relato">{teste?.relato || ''}</p>
  </section>;
}

/** Cartão "Pontos de atenção": o que marcou, o que faltou e o que anda junto. */
export function CartaoPontosAtencao({ resumo: r }: { resumo: ResumoAreas }) {
  const doshaDe = (queixa: string) => { for (const a of r.areas) { const f = a.marcou.find(m => m.queixa === queixa); if (f) return f.dosha; } return null; };
  return <section className="portal-cartao resumo-areas">
    <TituloPaciente>Pontos de atenção</TituloPaciente>
    <p className="ra-sub ra-intro">As queixas que andam juntas e o que costuma vir com elas. Em roxo, o que a pessoa tem.</p>
    {r.ligacoes.map(p => <div key={p.slug} className={`ra-lig ${p.completo ? 'ok' : ''}`}>
      <h3>{p.nome}<span>marcou {p.marcou.length} de {p.total}</span></h3>
      <div className="terapia-marcados" style={{ marginTop: 6 }}>
        {p.marcou.map(m => { const q = typeof m === 'string' ? m : m.queixa; const d = typeof m === 'string' ? doshaDe(m) : m.dosha; return <span key={q} className={d ? `terapia-queixa terapia-queixa-${d}` : 'ra-falta'}>{q}</span>; })}
        {(p.faltam ?? []).map(f => <span key={f} className="ra-falta">{f}</span>)}
      </div>
      {(p.anda_junto_itens ?? []).length > 0 && <p className="ra-junto">Anda junto: {p.anda_junto_itens.map(j => <span key={j.item} className={`ra-j ${j.tem === true ? 'tem' : j.tem === false ? 'nao' : ''}`}>{j.item}</span>)}</p>}
    </div>)}
  </section>;
}
