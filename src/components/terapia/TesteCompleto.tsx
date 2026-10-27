import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { PontosResposta, SomaParte, TesteCompleto, TestePaciente } from '@/lib/terapiaPaciente';
import { AGNIS_TESTE, DOSHAS_TESTE, dataCurtaTeste, mesmoRegistro, pontosOrigem } from '@/lib/terapiaTesteCompleto';
import MarcadosDosha from './MarcadosDosha';
import './testeCompleto.css';

export function SelosPontos({ pontos }: { pontos: PontosResposta }) {
  const selos = [
    ...([['v', 'vata', 'V'], ['p', 'pitta', 'P'], ['k', 'kapha', 'K']] as const).flatMap(([chave, dosha, label]) => pontos[chave] ? [{ dosha, texto: `${label}+${pontos[chave]}` }] : []),
    ...AGNIS_TESTE.flatMap(([tipo, dosha]) => { const n = pontos[`agni_${tipo}`]; return n ? [{ dosha, texto: `Agni ${tipo} (${dosha[0].toUpperCase()}${dosha.slice(1)}) +${n}` }] : []; }),
  ];
  return <div className="tc-selos">{selos.length ? selos.map(s => <span key={s.texto} className={`tc-selo tc-${s.dosha}`}>{s.texto}</span>) : <span className="tc-nota">sem pontos</span>}</div>;
}
function Somas({ soma }: { soma: SomaParte }) { return <span className="tc-somas">{DOSHAS_TESTE.map(d => <span key={d} className={`tc-${d}`}>{d[0].toUpperCase()} {soma[d] ?? 0}</span>)}</span>; }
function Parte({ titulo, soma, primeira = false, children }: { titulo: string; soma: SomaParte; primeira?: boolean; children: ReactNode }) {
  return <details className="tc-parte" open={primeira || undefined}><summary><ChevronRight className="tc-seta" /><span className="tc-parte-titulo">{titulo}</span><Somas soma={soma} /></summary><div className="tc-perguntas">{children}</div></details>;
}
function Resposta({ texto, pontos }: { texto: string; pontos: PontosResposta }) { return <div className="tc-resposta"><span className="tc-label">{texto}</span><SelosPontos pontos={pontos} /></div>; }
export default function TesteCompletoPainel({ completo: c, teste }: { completo: TesteCompleto; teste?: TestePaciente | null }) {
  const mesmo = mesmoRegistro(c, teste);
  const idade = pontosOrigem(c.composicao, 'idade'), imc = pontosOrigem(c.composicao, 'imc');
  const queixas = c.queixas ?? (mesmo ? teste?.queixas : undefined);
  const alimentos = c.alimentos ?? (mesmo ? teste?.alimentos : undefined);
  return <Sheet><SheetTrigger asChild><Button variant="default" size="sm">{mesmo ? 'Ver o teste completo' : `Ver o teste completo de ${dataCurtaTeste(c.data)}`}</Button></SheetTrigger><SheetContent className="tc-sheet">
    <SheetHeader className="tc-sheet-header"><SheetTitle className="tc-sheet-title">Teste completo · {dataCurtaTeste(c.data)}</SheetTitle><SheetDescription className="tc-sheet-description">Vata {c.vata} · Pitta {c.pitta} · Kapha {c.kapha} · Agni {c.agni.texto}</SheetDescription></SheetHeader>
    <div className="tc-sheet-body">{c.partes.map((p, i) => <Parte key={p.parte} titulo={p.titulo} soma={p.soma} primeira={i === 0}>{p.perguntas.map((q, j) => <div key={j}><p className="tc-pergunta">{q.pergunta}</p>{q.escolhidas.length ? q.escolhidas.map((r, k) => <Resposta key={k} texto={r.label} pontos={r.pontos} />) : <p className="tc-nota">não marcou</p>}</div>)}</Parte>)}
      <Parte titulo="Sintomas dos doshas" soma={pontosOrigem(c.composicao, 'queixas')}><MarcadosDosha grupos={queixas} /><p className="tc-nota">Cada sintoma vale 2 pontos para o dosha a que pertence.</p>{!queixas && <p className="tc-nota">Os sintomas deste registro não vieram no teste completo.</p>}</Parte>
      <Parte titulo="Alimentação" soma={pontosOrigem(c.composicao, 'alimentacao')}><MarcadosDosha grupos={alimentos} /><p className="tc-nota">Cada alimento vale 1 ponto.</p>{!alimentos && <p className="tc-nota">Os alimentos deste registro não vieram no teste completo.</p>}</Parte>
      <Parte titulo="Idade, peso e altura" soma={{ vata: idade.vata + imc.vata, pitta: idade.pitta + imc.pitta, kapha: idade.kapha + imc.kapha }}><Resposta texto={c.idade != null ? `${c.idade} anos` : 'Idade não informada'} pontos={{ v: idade.vata, p: idade.pitta, k: idade.kapha }} /><Resposta texto={c.imc != null ? `IMC ${c.imc.toLocaleString('pt-BR')}` : 'IMC não informado'} pontos={{ v: imc.vata, p: imc.pitta, k: imc.kapha }} /></Parte>
    </div>
  </SheetContent></Sheet>;
}