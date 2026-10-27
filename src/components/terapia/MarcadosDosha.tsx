import { marcadosPorDosha } from '@/lib/terapiaPaciente';
import type { TestePaciente } from '@/lib/terapiaPaciente';
import './marcadosDosha.css';
export default function MarcadosDosha({ grupos }: { grupos?: TestePaciente['queixas'] }) {
 return <div className="terapia-marcados">{marcadosPorDosha(grupos).map(({ dosha, texto }) => <span key={`${dosha}-${texto}`} className={`terapia-queixa terapia-queixa-${dosha}`}>{texto}</span>)}</div>;
}
