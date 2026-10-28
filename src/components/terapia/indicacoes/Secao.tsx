import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { linkIndicacao } from '@/lib/terapiaIndicacoes';
import type { ItemIndicacao, SecaoIndicacoes } from '@/lib/terapiaIndicacoes';
import DiasPilula from './DiasPilula';

function Item({ item, secao, nota, tirar, dias, piscando }: { item: ItemIndicacao; secao: string; nota: (id: string, v: string) => void; tirar: (id: string) => void; dias: (id: string, dias: number[]) => void; piscando: boolean }) {
  const drag = useSortable({ id: item.id, data: { secao } });
  const campo = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => { const el = campo.current; if (!el) return; el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }, [item.nota]);
  const link = linkIndicacao(item);
  return <article id={`ind-item-${item.id}`} ref={drag.setNodeRef} style={{ transform: CSS.Transform.toString(drag.transform), transition: drag.transition }} className={`fe-linha ${drag.isDragging ? 'arrastando' : ''} ${piscando ? 'novo' : ''}`}>
    <button type="button" ref={drag.setActivatorNodeRef} {...drag.attributes} {...drag.listeners} className="fe-alca" title="Arrastar" aria-label={`Mover ${item.titulo}`}><GripVertical size={14} /></button>
    <div className="min-w-0">
      <div className="fe-linha-topo">
        <b>{link ? <a href={link} target="_blank" rel="noreferrer">{item.titulo}</a> : item.titulo}</b>
        <DiasPilula item={item} umaVez={secao === 'ler'} mudar={d => dias(item.id, d)} />
      </div>
      <textarea ref={campo} rows={1} aria-label={`Como: ${item.titulo}`} placeholder="como, quanto, quando" value={item.nota} onChange={e => nota(item.id, e.target.value)} />
    </div>
    <button type="button" className="fe-x" title="Tirar" aria-label={`Tirar ${item.titulo}`} onClick={() => tirar(item.id)}><X size={14} /></button>
  </article>;
}

export default function Secao({ secao, itens, nota, tirar, dias, livre, aberta, abrir, piscando, buscar, rotuloBuscar }: { rotuloBuscar?: string; secao: SecaoIndicacoes; itens: ItemIndicacao[]; nota: (id: string, v: string) => void; tirar: (id: string) => void; dias: (id: string, dias: number[]) => void; livre: (s: string, t: string) => void; aberta: boolean; abrir: () => void; piscando: string | null; buscar: () => void }) {
  const drop = useDroppable({ id: `secao:${secao.chave}`, data: { secao: secao.chave } });
  const [texto, setTexto] = useState('');
  const vazio = !itens.length && !aberta;
  // Arrastar uma caixa por cima de um momento vazio abre ele depois de meio segundo.
  useEffect(() => { if (drop.isOver && vazio) { const t = setTimeout(abrir, 500); return () => clearTimeout(t); } }, [drop.isOver, vazio, abrir]);
  if (vazio) return <button type="button" ref={drop.setNodeRef} className={`fe-vazio ${drop.isOver ? 'sobre' : ''}`} onClick={abrir} aria-label={`Abrir ${secao.titulo}`}><span>+ {secao.titulo}</span><small>vazio</small></button>;
  return <section ref={drop.setNodeRef} className={`fe-momento ${drop.isOver ? 'sobre' : ''}`} aria-label={secao.titulo}>
    <h4><span>{secao.titulo}</span><small>{itens.length || ''}</small></h4>
    <SortableContext items={itens.map(i => i.id)} strategy={verticalListSortingStrategy}>{itens.map(item => <Item key={item.id} item={item} secao={secao.chave} nota={nota} tirar={tirar} dias={dias} piscando={piscando === item.id} />)}</SortableContext>
    <form className="fe-add" onSubmit={e => { e.preventDefault(); if (texto.trim()) { livre(secao.chave, texto.trim()); setTexto(''); } }}>
      <input aria-label={`Escrever em ${secao.titulo}`} placeholder="+ escrever aqui…" value={texto} onChange={e => setTexto(e.target.value)} />
      <button type="button" className="fe-buscar-link" onClick={buscar}>{rotuloBuscar ?? '(ou Buscar)'}</button>
    </form>
  </section>;
}
