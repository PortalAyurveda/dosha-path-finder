import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DIAS_LETRAS, DIAS_NOMES, diasDoItem, resumoDias, type ItemIndicacao } from '@/lib/terapiaIndicacoes';

/**
 * Pílula discreta à direita de cada item da folha: "Todo dia ▾" ou os dias ("Qua, sex e dom ▾").
 * Abre os 7 bloquinhos S T Q Q S S D (segunda a domingo); em "Para ler e assistir" mostra "uma vez" e não abre.
 */
export default function DiasPilula({ item, umaVez = false, mudar }: { item: ItemIndicacao; umaVez?: boolean; mudar?: (dias: number[]) => void }) {
  const [aberta, setAberta] = useState(false);
  const caixa = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!aberta) return;
    const fora = (e: PointerEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberta(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberta(false); };
    document.addEventListener('pointerdown', fora);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', fora); document.removeEventListener('keydown', esc); };
  }, [aberta]);

  if (umaVez) return <span className="fe-dias fixa">uma vez</span>;

  const dias = diasDoItem(item);
  const parcial = dias.length < 7;
  const resumo = resumoDias(item);
  const ligar = (d: number) => {
    const nova = dias.includes(d) ? dias.filter(x => x !== d) : [...dias, d].sort((a, b) => a - b);
    mudar?.(nova.length ? nova : [d]);
  };
  return (
    <span className="fe-dias-wrap" ref={caixa}>
      <button type="button" className={`fe-dias ${parcial ? 'parcial' : ''}`} aria-expanded={aberta} aria-label={`Dias da semana: ${item.titulo}`} onClick={() => setAberta(v => !v)}>
        {parcial ? `${resumo[0].toUpperCase()}${resumo.slice(1)}` : 'Todo dia'} <ChevronDown size={12} aria-hidden="true" />
      </button>
      {aberta && (
        <span className="fe-dias-caixa" role="group" aria-label="Dias da semana">
          <span className="fe-dias-letras">
            {DIAS_LETRAS.map((l, i) => {
              const d = i + 1;
              const ligado = dias.includes(d);
              return <button key={d} type="button" title={DIAS_NOMES[i]} aria-pressed={ligado} aria-label={DIAS_NOMES[i]} className={ligado ? 'ligado' : ''} onClick={() => ligar(d)}>{l}</button>;
            })}
          </span>
          <span className="fe-dias-rodape">Toque para ligar ou desligar · <button type="button" onClick={() => mudar?.([1, 2, 3, 4, 5, 6, 7])}>Todo dia</button></span>
        </span>
      )}
    </span>
  );
}
