import {Calendar,Video,MessageCircle,Camera,FileText,Sparkles} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { Hoje as HojeDados, horaBR, diaBR, salaAberta } from "@/lib/terapia";
import { inicial, Secao } from "./Comuns";
import { Switch } from '@/components/ui/switch';
import { useOnlineTerapeuta } from './online/OnlineTerapeuta';
export default function Hoje({
  dados,
  agora,
}: {
  dados: HojeDados;
  agora: number;
}) {
  const online = useOnlineTerapeuta();
  return (
    <><div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] items-start">
      <Secao
        titulo="Hoje e amanhã"
      >
        {online && <label className="mb-4 flex items-center justify-end gap-2 text-sm">Estou online<Switch checked={online.online} disabled={online.mudando || !online.participa} onCheckedChange={v=>void online.mudar(v)} className="data-[state=checked]:bg-secondary"/></label>}
        <div className="divide-y divide-border">
          {dados.consultas.length === 0 && (
            <p className="py-5 text-sm text-muted-foreground">
              Nenhuma consulta marcada.
            </p>
          )}
          {dados.consultas.map((c) => (
            <article
              key={c.id}
              className="portal-hoje-linha"
            >
              <span className="portal-icone">{c.hoje?<Video/>:<Calendar/>}</span>
              <div className="min-w-0"><h3 className="text-sm font-semibold">{c.hoje?'':'Amanhã '}{horaBR(c.inicio).replace(':','h')} · {c.nome}</h3><p className="text-xs text-muted-foreground">{c.primeira?'Primeira consulta':'Retorno'}{c.hoje&&c.sala_abre_em?` · sala abre às ${horaBR(c.sala_abre_em).replace(':','h')}`:''}</p><div className="mt-1 flex gap-1">{c.tem_teste&&<span className="text-xs text-muted-foreground">teste feito</span>}{c.nascimento&&<span className="text-xs text-muted-foreground"> · nascimento</span>}</div></div>
              <div className="portal-hoje-acoes">
                {c.hoje &&
                  (salaAberta(c, agora) ? (
                    <CTAButton asChild className="px-3 py-2 text-sm h-9">
                      <Link to={`/consulta/${c.id}`}>Entrar na sala</Link>
                    </CTAButton>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Sala às{" "}
                      {c.sala_abre_em
                        ? horaBR(c.sala_abre_em).replace(":", "h")
                        : "sem data"}
                    </Button>
                  ))}
                <Button asChild variant="outline" size="sm">
                  <Link to={`/painel-terapeuta/paciente/${c.paciente_id}`}>
                    Abrir a ficha
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Secao>
      <div className="space-y-4">
        <Secao titulo="Pede sua atenção">
          {(dados.atencao?.length??0)>0&&<span className="portal-atencao-num">{dados.atencao?.length}</span>}
          {(dados.atencao??[]).map((a,i)=>{const base=`/painel-terapeuta/paciente/${a.paciente_id}`;const url=a.tipo==='sem_folha'?`${base}/indicacoes/nova${a.consulta_id?`?consulta=${a.consulta_id}`:''}`:a.tipo==='folha_nao_vista'&&a.folha_id?`${base}/indicacoes/${a.folha_id}`:a.tipo==='mensagens'?`/painel-terapeuta?aba=mensagens&paciente=${a.paciente_id}`:`${base}?aba=fotos`;return <article key={i} className="flex items-start justify-between gap-3 border-b border-border py-3"><span className="portal-icone">{a.tipo==='mensagens'?<MessageCircle/>:a.tipo.includes('foto')?<Camera/>:<FileText/>}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{a.texto}</p>{a.detalhe&&<p className="text-xs text-muted-foreground">{a.detalhe}</p>}</div>{<Button asChild variant="outline" size="sm"><Link to={url}>{a.tipo==='sem_folha'?'Montar':a.tipo==='folha_nao_vista'?'Ver folha':a.tipo==='faltam_fotos'?'Ver fotos':'Ver'}</Link></Button>}</article>;})}
          {!dados.atencao?.length&&<p className="text-sm text-muted-foreground">Nada pede sua atenção.</p>}
        </Secao>
        <Secao titulo="Novidades">
          {dados.novidades.length ? (
            <ul className="space-y-4">
              {dados.novidades.map((n, i) => (
                <li key={i} className="border-b border-border pb-3 text-sm">
                  <p className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    {n.texto}
                  </p>
                  {n.detalhe && (
                    <p className="pl-3.5 text-xs text-muted-foreground">
                      {n.detalhe}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma novidade.</p>
          )}
        </Secao>
        {dados.pendencias.length > 0 && <Secao titulo="Pendências">
          <ul className="space-y-3 text-sm">
            {dados.pendencias.map((p, i) => (
              <li key={i}>{p.texto}</li>
            ))}
          </ul>
          {!dados.pendencias.length && (
            <p className="text-sm text-muted-foreground">Nenhuma pendência.</p>
          )}
        </Secao>}
      </div>
    </div></>
  );
}
