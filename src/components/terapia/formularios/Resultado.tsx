import type { ResultadoFormulario, SomaFormulario } from '@/lib/terapiaFormularios';
const valor = (s: SomaFormulario, c: 'v' | 'p' | 'k') => s[c] ?? s[c === 'v' ? 'vata' : c === 'p' ? 'pitta' : 'kapha'] ?? 0;
function Linha({ soma }: { soma: SomaFormulario }) { return <><td className="text-vata">{valor(soma, 'v')}</td><td className="text-pitta">{valor(soma, 'p')}</td><td className="text-kapha">{valor(soma, 'k')}</td><td><span className="text-vata">irregular {soma.agni_irregular ?? 0}</span> · <span className="text-pitta">forte {soma.agni_forte ?? 0}</span> · <span className="text-kapha">fraco {soma.agni_fraco ?? 0}</span></td></>; }
export default function Resultado({ resultado, pessoa = false }: { resultado?: ResultadoFormulario | null; pessoa?: boolean }) {
  if (!resultado) return null;
  const total = resultado.total ?? resultado;
  if (pessoa) return <div className="flex flex-wrap gap-5"><strong className="text-vata">Vata {valor(total, 'v')}</strong><strong className="text-pitta">Pitta {valor(total, 'p')}</strong><strong className="text-kapha">Kapha {valor(total, 'k')}</strong></div>;
  return <div className="tf-tabela-wrap"><table className="tf-tabela"><thead><tr><th>Seção</th><th className="text-vata">Vata</th><th className="text-pitta">Pitta</th><th className="text-kapha">Kapha</th><th>Agni</th></tr></thead><tbody>{resultado.secoes?.map((s, i) => <tr key={s.id ?? i}><td>{s.titulo ?? s.secao}</td><Linha soma={s.soma ?? s.pontos ?? s} /></tr>)}</tbody><tfoot><tr><td>Total</td><Linha soma={total} /></tr></tfoot></table></div>;
}