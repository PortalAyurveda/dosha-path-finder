import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { formularios, minutosFormulario, nomeTerapeutaFormulario } from '@/lib/terapiaFormularios';
import './formularios.css';
export default function Pendentes({ terapeuta }: { terapeuta: string }) {
  const { user, isAnonymous } = useUser();
  const q = useQuery({ queryKey: ['formularios-meus', user?.id], queryFn: formularios.meus, enabled: !!user && !isAnonymous, refetchInterval: 30000, refetchIntervalInBackground: false });
  if (q.error) return <p role="alert">{q.error.message}</p>;
  const pendentes = (q.data ?? []).filter(f => !f.respondido_em && nomeTerapeutaFormulario(f.terapeuta) === terapeuta);
  if (!pendentes.length) return null;
  return <div className="tf space-y-3">{pendentes.map(f => <div className="tf-pendente" key={f.id}><h3>Responder antes da consulta</h3><p>{f.nome} · uns {minutosFormulario(f.perguntas)} minutos</p><Button asChild className="self-start"><Link to={`/meu-acompanhamento/formulario/${f.id}`}>Responder</Link></Button></div>)}</div>;
}