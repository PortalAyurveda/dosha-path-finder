import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { terapia, diaBR } from '@/lib/terapia';
import { APROFUNDAR, ETAPAS, type Etapa, type Setor, type Biblioteca, type DadosAvaliacao } from '@/lib/terapiaAvaliacao';
import { extras, type Adicao } from '@/lib/terapiaAdicoes';
import type { FotoPaciente } from '@/lib/terapiaPaciente';

type FotoTreino = { tipo: string; titulo: string; url: string };

function useFotos(paciente: string, userId: string | undefined, permitido: boolean, treino: boolean) {
  return useQuery({ queryKey: ['paciente-fotos', userId, paciente], queryFn: () => terapia.fotosPaciente(paciente), enabled: permitido && !treino });
}
function todas(d?: { fotos?: FotoPaciente[]; lingua?: FotoPaciente[] }) {
  return [...(d?.fotos ?? []), ...(d?.lingua ?? [])].filter((f, i, a) => a.findIndex(x => x.id === f.id) === i);
}
function Imagem({ foto, className, alt }: { foto: FotoPaciente; className?: string; alt: string }) {
  const url = useQuery({ queryKey: ['avaliacao-foto-url', foto.id, foto.path], queryFn: () => terapia.fotoAssinada(foto), staleTime: 50 * 60 * 1000, gcTime: 0 });
  return url.data ? <img src={url.data} alt={alt} className={className} /> : <span className="text-xs text-muted-foreground">{url.error ? url.error.message : 'Carregando…'}</span>;
}
function Ampliar({ titulo, children, abrir, fechar }: { titulo: string; children: ReactNode; abrir: boolean; fechar: () => void }) {
  return <Dialog open={abrir} onOpenChange={v => { if (!v) fechar(); }}><DialogContent className="max-h-[95dvh] max-w-4xl overflow-y-auto p-4"><DialogTitle>{titulo}</DialogTitle><DialogDescription className="sr-only">Foto ampliada</DialogDescription><div className="grid place-items-center [&_img]:max-h-[75dvh] [&_img]:max-w-full [&_img]:object-contain">{children}</div></DialogContent></Dialog>;
}
const doTipo = (tipo?: string, setor?: string) => !!tipo && !!setor && (tipo === setor || tipo.startsWith(setor));

/** Miniaturas das fotos que a pessoa mandou, na ficha (tocar amplia). */
export function FotosFicha({ paciente, userId, permitido, treino = false, fotosTreino = [] }: { paciente: string; userId?: string; permitido: boolean; treino?: boolean; fotosTreino?: FotoTreino[] }) {
  const fotos = useFotos(paciente, userId, permitido, treino); const [aberta, setAberta] = useState<string | null>(null);
  const lista = treino ? fotosTreino.map(f => ({ id: f.tipo, titulo: f.titulo, url: f.url })) : todas(fotos.data).map(f => ({ id: f.id, titulo: f.titulo ?? f.tipo ?? 'Foto', foto: f, data: f.criado_em }));
  if (!permitido && !treino) return null;
  if (!lista.length) return null;
  const atual = lista.find(f => f.id === aberta);
  return <section><h3 className="m-eti">Fotos que mandou</h3><div className="ff-fotos">{lista.map(f => <button type="button" key={f.id} onClick={() => setAberta(f.id)} aria-label={`Ampliar ${f.titulo}`}>{'url' in f ? <img src={f.url} alt={f.titulo} /> : <Imagem foto={f.foto} alt={f.titulo} />}<small>{f.titulo}{'data' in f && f.data ? ` · ${diaBR(f.data)}` : ''}</small></button>)}</div>
    <Ampliar titulo={atual?.titulo ?? 'Foto'} abrir={!!atual} fechar={() => setAberta(null)}>{atual && ('url' in atual ? <img src={atual.url} alt={atual.titulo} /> : <Imagem foto={atual.foto} alt={atual.titulo} />)}</Ampliar></section>;
}

/** A foto que a pessoa mandou daquele item (língua, unhas…), ao lado dos sinais. */
export function FotoDoItem({ setor, nome, paciente, userId, permitido, treino = false, fotosTreino = [] }: { setor: string; nome: string; paciente: string; userId?: string; permitido: boolean; treino?: boolean; fotosTreino?: FotoTreino[] }) {
  const fotos = useFotos(paciente, userId, permitido, treino); const [aberta, setAberta] = useState(false);
  const t = treino ? fotosTreino.find(f => doTipo(f.tipo, setor)) : undefined;
  const f = treino ? undefined : (setor === 'lingua' ? (fotos.data?.lingua ?? []) : []).concat(fotos.data?.fotos ?? []).filter(x => doTipo(x.tipo, setor)).sort((a, b) => Date.parse(b.criado_em) - Date.parse(a.criado_em))[0];
  if (!t && !f) return <div className="et-foto vazia"><p>{permitido || treino ? `Ela ainda não mandou foto: ${nome.toLowerCase()}.` : 'A pessoa não liberou as fotos.'}</p></div>;
  return <button type="button" className="et-foto" onClick={() => setAberta(true)} aria-label={`Ampliar foto: ${nome}`}>
    {t ? <img src={t.url} alt={t.titulo} /> : f && <Imagem foto={f} alt={nome} />}
    <small>Foto que ela mandou{f ? ` em ${diaBR(f.criado_em)}` : ''} · tocar para ampliar</small>
    <Ampliar titulo={nome} abrir={aberta} fechar={() => setAberta(false)}>{t ? <img src={t.url} alt={t.titulo} /> : f && <Imagem foto={f} alt={nome} />}</Ampliar>
  </button>;
}

/** Quadro tracejado "Ela marcou no teste": o + confirma o sintoma na avaliação. */
export function SugestoesTeste({ lista, confirmar }: { lista: { nome: string; dosha: 'V' | 'P' | 'K' | null; confirmado: boolean }[]; confirmar: (nome: string) => void }) {
  if (!lista.length) return null;
  return <section className="et-sug"><h3 className="m-eti">Ela marcou no teste · toque no + para confirmar</h3><div className="flex flex-wrap gap-1.5">{lista.map(s => <span key={s.nome} className={`et-sc ${s.dosha ?? ''} ${s.confirmado ? 'ok' : ''}`}>{s.nome}{s.confirmado ? <i aria-label="Confirmado"><Check size={12} /></i> : <button type="button" aria-label={`Confirmar ${s.nome}`} onClick={() => confirmar(s.nome)}><Plus size={12} /></button>}</span>)}</div></section>;
}

/** Os três cartões das etapas (são abas) e o cartão tracejado "+ Aprofundar". */
export function CartoesEtapas({ etapa, contar, ir, compacto, aprofundar }: { etapa: Etapa; contar: (e: Etapa) => number; ir: (e: Etapa) => void; compacto: boolean; aprofundar: ReactNode }) {
  return <nav className={`et-trilho ${compacto ? 'compacto' : ''}`} aria-label="Etapas da avaliação">{ETAPAS.map((e, i) => { const n = contar(e.id); return <button type="button" key={e.id} aria-pressed={etapa === e.id} className={`et ${etapa === e.id ? 'on' : ''} ${n > 0 ? 'feito' : ''}`} onClick={() => ir(e.id)}><span className="n">{n > 0 && etapa !== e.id ? <Check size={13} /> : i + 1}</span><span className="min-w-0"><b>{e.nome}{n > 0 ? ` · ${n}` : ''}</b>{!compacto && <small>{e.sub}</small>}</span></button>; })}{aprofundar}</nav>;
}

/** "+ Aprofundar": abre a lista dos setores que saíram da frente; os abertos viram pílulas para voltar fácil. */
export function Aprofundar({ dados, mudar, abrir, biblioteca, abertos, atual, contar, compacto }: { dados: DadosAvaliacao; mudar: (d: DadosAvaliacao) => void; abrir: (s: Setor, nome?: string) => void; biblioteca: Biblioteca; abertos: { id: Setor; nome: string }[]; atual: Setor | null; contar: (s: Setor) => number; compacto: boolean }) {
  const [open, setOpen] = useState(false); const e = extras(dados);
  const ir = (s: Setor, nome: string) => { abrir(s, nome); setOpen(false); };
  const novo = (a: Adicao) => { mudar({ ...dados, extras: { ...e, adicoes: [...e.adicoes.filter(x => x.id !== a.id), a] } }); ir(a.id, a.nome); };
  const outros = [...e.adicoes.filter(a => String(a.id).startsWith('custom:')), ...((biblioteca.areas ?? []) as Adicao[])].filter((a, i, l) => l.findIndex(x => x.id === a.id) === i);
  return <div className="et-aprofundar">
    <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><button type="button" className={`et opc ${atual ? 'on' : ''}`}><span className="min-w-0"><b>+ Aprofundar</b>{!compacto && <small>agni e ama, tecidos, excreções, subdoshas, adições</small>}</span></button></PopoverTrigger>
      <PopoverContent collisionPadding={16} className="max-h-[65dvh] w-72 max-w-[calc(100vw-32px)] overflow-y-auto p-2">
        {APROFUNDAR.map(([id, nome]) => <button type="button" key={id} className="et-op" onClick={() => ir(id, nome)}>{nome}{contar(id) > 0 && <span>{contar(id)}</span>}</button>)}
        {outros.map(a => <button type="button" key={a.id} className="et-op" onClick={() => e.adicoes.some(x => x.id === a.id) ? ir(a.id, a.nome) : novo(a)}>{a.nome}</button>)}
        <button type="button" className="et-op" onClick={() => novo({ id: `custom:${crypto.randomUUID()}`, nome: 'Nova área', itens: [] })}>+ Criar do zero</button>
      </PopoverContent></Popover>
    {abertos.map(a => <button type="button" key={a.id} aria-pressed={atual === a.id} className="et-pl" onClick={() => abrir(a.id, a.nome)}>{a.nome}{contar(a.id) > 0 && <span>{contar(a.id)}</span>}</button>)}
  </div>;
}
