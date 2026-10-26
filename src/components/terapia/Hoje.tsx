import { useState } from 'react';
import ConversaAtencao from './ConversaAtencao';
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
  const [conversa,setConversa]=useState<{paciente:string;nome:string}|null>(null);
  const online = useOnlineTerapeuta();
  return (
    <><div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(240px,1fr)]">
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
              className="flex flex-wrap items-center gap-3 py-5"
            >
              <div className="w-16 shrink-0">
                <p className="font-serif text-xl font-bold text-primary">
                  {c.hoje
                    ? horaBR(c.inicio)
                    : new Date(c.inicio).toLocaleDateString("pt-BR", {
                        weekday: "short",
                        timeZone: "America/Sao_Paulo",
                      })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.hoje
                    ? c.primeira
                      ? "Primeira consulta"
                      : "Retorno"
                    : diaBR(c.inicio)}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-primary">
                {inicial(c.nome)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{c.nome}</h3>
                {!c.hoje && (
                  <p className="text-xs text-muted-foreground">
                    {c.primeira ? "Primeira consulta" : "Retorno"} ·{" "}
                    {horaBR(c.inicio)}
                  </p>
                )}
                <div className="mt-1 flex gap-1">
                  {c.tem_teste && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">
                      teste
                    </span>
                  )}
                  {c.nascimento && (
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">
                      nascimento
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-auto flex flex-wrap justify-end gap-2 max-sm:w-full">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/painel-terapeuta/paciente/${c.paciente_id}`}>
                    Abrir ficha
                  </Link>
                </Button>
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
                        : "—"}
                    </Button>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </Secao>
      <div className="space-y-7 xl:border-l xl:border-border xl:pl-6">
        <Secao titulo={`Pede sua atenção · ${dados.atencao?.length??0}`}>
          {(dados.atencao??[]).map((a,i)=>{const base=`/painel-terapeuta/paciente/${a.paciente_id}`;const url=a.tipo==='sem_folha'?`${base}/indicacoes/nova${a.consulta_id?`?consulta=${a.consulta_id}`:''}`:a.tipo==='folha_nao_vista'&&a.folha_id?`${base}/indicacoes/${a.folha_id}`:a.tipo==='mensagens'?`${base}?aba=mensagens`:`${base}?aba=fotos`;return <article key={i} className="flex items-start justify-between gap-3 border-b border-border py-3"><div className="min-w-0"><p className="text-sm">{a.texto}</p>{a.detalhe&&<p className="text-xs text-muted-foreground">{a.detalhe}</p>}</div>{a.tipo==='mensagens'?<Button variant="outline" size="sm" onClick={()=>setConversa({paciente:a.paciente_id,nome:a.nome})}>Ver</Button>:<Button asChild variant="outline" size="sm"><Link to={url}>{a.tipo==='sem_folha'?'Montar':a.tipo==='folha_nao_vista'?'Ver folha':a.tipo==='faltam_fotos'?'Ver fotos':'Ver'}</Link></Button>}</article>;})}
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
        <Secao titulo="Pendências">
          <ul className="space-y-3 text-sm">
            {dados.pendencias.map((p, i) => (
              <li key={i}>{p.texto}</li>
            ))}
          </ul>
          {!dados.pendencias.length && (
            <p className="text-sm text-muted-foreground">Nenhuma pendência.</p>
          )}
        </Secao>
      </div>
    </div>{conversa&&<ConversaAtencao paciente={conversa.paciente} nome={conversa.nome} fechar={()=>setConversa(null)}/>}</>
  );
}
