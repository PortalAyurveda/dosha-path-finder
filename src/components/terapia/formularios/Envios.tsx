import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { textoResposta, type EnvioFormulario } from '@/lib/terapiaFormularios';
import Resultado from './Resultado';
import './formularios.css';
const data = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
export default function Envios({ envios = [], paciente }: { envios?: EnvioFormulario[]; paciente: string }) {
  const chave = `formularios-vistos:${paciente}`;
  const assinatura = envios.filter(e => e.respondido_em).map(e => `${e.id}:${e.respondido_em}`).join('|');
  const [aberto, setAberto] = useState(() => { try { return !!assinatura && sessionStorage.getItem(chave) !== assinatura; } catch { return !!assinatura; } });
  useEffect(() => { if (!aberto) return; try { sessionStorage.setItem(chave, assinatura); } catch { /* armazenamento indisponível */ } }, [aberto, assinatura, chave]);
  useEffect(() => { try { if (assinatura && sessionStorage.getItem(chave) !== assinatura) setAberto(true); } catch { /* armazenamento indisponível */ } }, [assinatura, chave]);
  return <section className="pessoa-sanfona tf"><Button variant="ghost" className="w-full justify-between rounded-none" aria-expanded={aberto} onClick={() => setAberto(v => !v)}><span className="font-serif">Formulários</span><span className="flex items-center gap-2">{envios.length}<ChevronDown size={16} className={aberto ? 'rotate-180' : ''} /></span></Button>{aberto && <div className="tf-lista-envios">{!envios.length ? <p>Nenhum formulário enviado.</p> : envios.map(e => <details key={e.id} open={!!e.respondido_em}><summary>{e.nome} · {e.respondido_em ? `respondido ${data(e.respondido_em)}` : 'ainda não respondeu'}</summary>{e.respondido_em && <><Resultado resultado={e.resultado} /><div>{e.perguntas.map(p => <div key={p.id} className="tf-linha-resposta"><span>{p.texto}</span><strong>{textoResposta(p, e.respostas?.[p.id])}</strong></div>)}</div></>}</details>)}</div>}</section>;
}