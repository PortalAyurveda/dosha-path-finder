create table public.consulta_solicitacoes(
 id uuid primary key default gen_random_uuid(),
 terapeuta_id text not null references public.portal_terapeutas(id) on delete cascade,
 user_id uuid not null,
 inicio timestamptz not null, fim timestamptz not null,
 status text not null default 'preenchendo',
 motivo text,
 perm_teste boolean not null default true, perm_fotos boolean not null default true, perm_rotina boolean not null default true, perm_akasha boolean not null default false,
 dados jsonb,
 guardado_ate timestamptz not null,
 enviada_em timestamptz,
 pedido_inicio timestamptz,
 sugerido_inicio timestamptz, sugerido_fim timestamptz,
 resposta_texto text, respondida_em timestamptz,
 consulta_id uuid references public.consultas(id) on delete set null,
 criado_em timestamptz not null default now(), atualizado_em timestamptz not null default now(),
 constraint consulta_solicitacoes_status_check check (status in ('preenchendo','aguardando','sugerida','confirmada','recusada','cancelada','expirada'))
);
create index consulta_solicitacoes_ter on public.consulta_solicitacoes(terapeuta_id,status);
create index consulta_solicitacoes_user on public.consulta_solicitacoes(user_id,status);
grant select on public.consulta_solicitacoes to authenticated;
grant all on public.consulta_solicitacoes to service_role;
alter table public.consulta_solicitacoes enable row level security;
create policy "Pessoa lê os próprios pedidos" on public.consulta_solicitacoes for select to authenticated using (user_id = auth.uid());

alter table public.terapeuta_sistema add column if not exists confirmacao_auto boolean not null default false;

create or replace function public._pedido_json(s public.consulta_solicitacoes) returns jsonb language sql stable security definer set search_path to 'public' as $$
 select jsonb_build_object('id',s.id,'status',s.status,'inicio',s.inicio,'fim',s.fim,'motivo',s.motivo,
  'permissoes',jsonb_build_object('teste',s.perm_teste,'fotos',s.perm_fotos,'rotina',s.perm_rotina,'akasha',s.perm_akasha),
  'guardado_ate',s.guardado_ate,'enviada_em',s.enviada_em,'pedido_inicio',coalesce(s.pedido_inicio,s.inicio),
  'sugerido_inicio',s.sugerido_inicio,'sugerido_fim',s.sugerido_fim,'resposta_texto',s.resposta_texto,'respondida_em',s.respondida_em,
  'consulta_id',s.consulta_id,'dados',s.dados,'criado_em',s.criado_em,'atualizado_em',s.atualizado_em,
  'terapeuta',(select jsonb_build_object('id',t.id,'nome',t.nome,'primeiro_nome',split_part(t.nome,' ',1),'imagem',coalesce(t.imagem_card,t.imagem),'slug',coalesce(nullif(t."terapeutas(dinamica)",''),t.id)) from portal_terapeutas t where t.id=s.terapeuta_id))
$$;

create or replace function public._pedido_confirmar(p_id uuid) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare s consulta_solicitacoes; t portal_terapeutas; cid uuid; sid uuid;
begin
 select * into s from consulta_solicitacoes where id=p_id for update;
 select * into t from portal_terapeutas where id=s.terapeuta_id;
 if s.inicio <= now() then raise exception 'Esse horário já passou.'; end if;
 if exists(select 1 from consultas k where k.terapeuta_id=s.terapeuta_id and k.status<>'cancelada' and tstzrange(k.inicio,k.fim) && tstzrange(s.inicio,s.fim)) then
   raise exception 'Este horário já está marcado.'; end if;
 insert into consultas(terapeuta_id,paciente_user_id,inicio,fim,marcada_por,motivo) values (s.terapeuta_id,s.user_id,s.inicio,s.fim,'paciente',nullif(trim(s.motivo),'')) returning id into cid;
 insert into video_salas(titulo,terapeuta_nome,paciente_nome,terapeuta_user_id,paciente_user_id,abre_em,fecha_em,minimo_minutos,consulta_id)
 values ('Consulta', t.nome, _nome_conta(s.user_id), t.user_id, s.user_id, s.inicio - interval '10 minutes', s.fim + interval '30 minutes', 20, cid) returning id into sid;
 update consultas set sala_id=sid where id=cid;
 delete from horario_reservas where terapeuta_id=s.terapeuta_id and user_id=s.user_id;
 update consulta_solicitacoes set status='confirmada', consulta_id=cid, respondida_em=coalesce(respondida_em,now()), atualizado_em=now() where id=p_id;
 return jsonb_build_object('consulta',cid,'inicio',s.inicio,'fim',s.fim);
end $$;

create or replace function public.terapeuta_solicitar(p_slug text, p_inicio timestamptz) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare u uuid := auth.uid(); tid text := _terapeuta_por_slug(p_slug); t portal_terapeutas; h record; s consulta_solicitacoes;
 lim int := coalesce((_ter_cfg('limite_consultas_futuras'))::text::int, 1);
 horas int := coalesce((_ter_cfg('regras_consulta')->>'pedido_horas')::int, 2); ate timestamptz;
begin
 if u is null then raise exception 'Entre na sua conta primeiro.'; end if;
 if tid is null or not _no_sistema(tid) then raise exception 'Esta agenda não está aberta.'; end if;
 select * into t from portal_terapeutas where id=tid;
 if t.user_id = u then raise exception 'Esta é a sua própria agenda.'; end if;
 perform pg_advisory_xact_lock(hashtext('agenda:'||tid));
 if exists(select 1 from consulta_solicitacoes x where x.terapeuta_id=tid and x.user_id=u and x.status in ('aguardando','sugerida')) then
   raise exception 'Você já tem um pedido com % esperando resposta. Veja em Meu acompanhamento.', split_part(t.nome,' ',1); end if;
 if (select count(*) from consultas c where c.terapeuta_id=tid and c.paciente_user_id=u and c.status='marcada' and c.fim>now()) >= lim then
   raise exception 'Você já tem consulta marcada com %. Para trocar, remarque ou cancele a que já existe em Meu acompanhamento.', split_part(t.nome,' ',1); end if;
 select * into h from _horarios_livres(tid, 60) x where x.inicio=p_inicio;
 if not found then raise exception '%', _horario_motivo(tid, p_inicio, true); end if;
 update consulta_solicitacoes set status='cancelada', atualizado_em=now() where terapeuta_id=tid and user_id=u and status='preenchendo';
 ate := least(now() + make_interval(hours => horas), h.inicio);
 delete from horario_reservas where terapeuta_id=tid and user_id=u;
 insert into horario_reservas(terapeuta_id,inicio,user_id,expira_em) values (tid,h.inicio,u,ate)
 on conflict (terapeuta_id,inicio) do update set user_id=excluded.user_id, expira_em=excluded.expira_em;
 insert into consulta_solicitacoes(terapeuta_id,user_id,inicio,fim,guardado_ate) values (tid,u,h.inicio,h.fim,ate) returning * into s;
 return _pedido_json(s);
end $$;

create or replace function public.consulta_pedido_meu(p_slug text) returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare tid text := _terapeuta_por_slug(p_slug); s consulta_solicitacoes;
begin
 if auth.uid() is null or tid is null then return null; end if;
 select * into s from consulta_solicitacoes x where x.terapeuta_id=tid and x.user_id=auth.uid()
   and (x.status in ('aguardando','sugerida') or (x.status='preenchendo' and x.guardado_ate>now())) order by x.criado_em desc limit 1;
 if not found then return null; end if;
 return _pedido_json(s);
end $$;

create or replace function public.consulta_pedido_salvar(p_id uuid, p_motivo text, p_teste boolean, p_fotos boolean, p_rotina boolean, p_akasha boolean) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare s consulta_solicitacoes;
begin
 update consulta_solicitacoes set motivo=nullif(trim(p_motivo),''), perm_teste=coalesce(p_teste,true), perm_fotos=coalesce(p_fotos,true), perm_rotina=coalesce(p_rotina,true), perm_akasha=coalesce(p_akasha,false), atualizado_em=now()
  where id=p_id and user_id=auth.uid() and status='preenchendo' and guardado_ate>now() returning * into s;
 if not found then raise exception 'O horário guardado expirou. Escolha um horário novamente.'; end if;
 return _pedido_json(s);
end $$;

create or replace function public.consulta_pedido_enviar(p_id uuid, p_motivo text, p_teste boolean, p_fotos boolean, p_rotina boolean, p_akasha boolean) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare u uuid := auth.uid(); s consulta_solicitacoes; auto boolean; pedir boolean;
begin
 select * into s from consulta_solicitacoes where id=p_id and user_id=u for update;
 if not found then raise exception 'Pedido não encontrado.'; end if;
 if s.status<>'preenchendo' then raise exception 'Este pedido já foi enviado.'; end if;
 if s.guardado_ate<=now() then raise exception 'O horário guardado expirou. Escolha um horário novamente.'; end if;
 select coalesce(ts.pedir_nascimento,false), coalesce(ts.confirmacao_auto,false) into pedir, auto from portal_terapeutas t left join terapeuta_sistema ts on ts.terapeuta_id=t.id where t.id=s.terapeuta_id;
 if pedir and not exists(select 1 from pessoa_nascimento n where n.user_id=u) then raise exception 'Falta a data de nascimento.'; end if;
 perform pg_advisory_xact_lock(hashtext('agenda:'||s.terapeuta_id));
 insert into terapeuta_pacientes(terapeuta_id,paciente_user_id,origem,perm_teste,perm_fotos,perm_rotina,perm_akasha)
 select s.terapeuta_id,u,'lista',coalesce(p_teste,true),coalesce(p_fotos,true),coalesce(p_rotina,true),coalesce(p_akasha,false)
 where not exists(select 1 from terapeuta_pacientes where terapeuta_id=s.terapeuta_id and paciente_user_id=u and status='ativo');
 update horario_reservas set expira_em=s.inicio where terapeuta_id=s.terapeuta_id and user_id=u and inicio=s.inicio;
 update consulta_solicitacoes set status='aguardando', enviada_em=now(), pedido_inicio=s.inicio, guardado_ate=s.inicio,
   motivo=nullif(trim(p_motivo),''), perm_teste=coalesce(p_teste,true), perm_fotos=coalesce(p_fotos,true), perm_rotina=coalesce(p_rotina,true), perm_akasha=coalesce(p_akasha,false),
   dados=jsonb_build_object('fotos',(select count(*) from paciente_fotos f where f.user_id=u),
     'ultima_foto',(select max(f.criado_em) from paciente_fotos f where f.user_id=u),
     'tem_teste',exists(select 1 from doshas_registros d where d.user_id=u),
     'tem_nascimento',exists(select 1 from pessoa_nascimento n where n.user_id=u)),
   atualizado_em=now() where id=p_id returning * into s;
 if auto then perform _pedido_confirmar(p_id); select * into s from consulta_solicitacoes where id=p_id; end if;
 return _pedido_json(s);
end $$;

create or replace function public.consulta_pedido_cancelar(p_id uuid) returns void language plpgsql security definer set search_path to 'public' as $$
declare s consulta_solicitacoes;
begin
 update consulta_solicitacoes set status='cancelada', atualizado_em=now() where id=p_id and user_id=auth.uid() and status in ('preenchendo','aguardando','sugerida') returning * into s;
 if not found then raise exception 'Pedido não encontrado.'; end if;
 delete from horario_reservas where terapeuta_id=s.terapeuta_id and user_id=s.user_id;
end $$;

create or replace function public.meus_pedidos_consulta() returns jsonb language sql stable security definer set search_path to 'public' as $$
 select coalesce(jsonb_agg(_pedido_json(s) order by s.inicio),'[]') from consulta_solicitacoes s
 where s.user_id=auth.uid() and (s.status in ('aguardando','sugerida') or (s.status='preenchendo' and s.guardado_ate>now())
   or (s.status in ('recusada','expirada') and s.atualizado_em>now()-interval '14 days'))
$$;

create or replace function public.terapeuta_pedidos() returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare tid text := _terapeuta_id_de(auth.uid());
begin
 if tid is null then raise exception 'Esta conta não é de terapeuta.'; end if;
 return (select coalesce(jsonb_agg(_pedido_json(s) || jsonb_build_object('paciente_id',s.user_id,'nome',_nome_conta(s.user_id),
   'horas_esperando', floor(extract(epoch from now()-s.enviada_em)/3600)) order by s.enviada_em),'[]')
  from consulta_solicitacoes s where s.terapeuta_id=tid and s.status in ('aguardando','sugerida'));
end $$;

create or replace function public.terapeuta_pedido_responder(p_id uuid, p_acao text, p_inicio timestamptz default null, p_texto text default null) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare tid text := _terapeuta_id_de(auth.uid()); s consulta_solicitacoes; h record;
begin
 if tid is null then raise exception 'Esta conta não é de terapeuta.'; end if;
 perform pg_advisory_xact_lock(hashtext('agenda:'||tid));
 select * into s from consulta_solicitacoes where id=p_id and terapeuta_id=tid for update;
 if not found then raise exception 'Pedido não encontrado.'; end if;
 if s.status not in ('aguardando','sugerida') then raise exception 'Este pedido já foi respondido.'; end if;
 update consulta_solicitacoes set resposta_texto=nullif(trim(p_texto),''), respondida_em=now(), atualizado_em=now() where id=p_id;
 if p_acao='confirmar' then
   if s.status<>'aguardando' then raise exception 'Aguarde a resposta da pessoa ao horário sugerido.'; end if;
   perform _pedido_confirmar(p_id);
 elsif p_acao='sugerir' then
   if p_inicio is null then raise exception 'Escolha o horário para sugerir.'; end if;
   select * into h from _horarios_livres(tid, 60) x where x.inicio=p_inicio;
   if not found then raise exception '%', _horario_motivo(tid, p_inicio, false); end if;
   delete from horario_reservas where terapeuta_id=tid and user_id=s.user_id;
   insert into horario_reservas(terapeuta_id,inicio,user_id,expira_em) values (tid,h.inicio,s.user_id,h.inicio)
   on conflict (terapeuta_id,inicio) do update set user_id=excluded.user_id, expira_em=excluded.expira_em;
   update consulta_solicitacoes set status='sugerida', sugerido_inicio=h.inicio, sugerido_fim=h.fim, guardado_ate=h.inicio where id=p_id;
 elsif p_acao='recusar' then
   delete from horario_reservas where terapeuta_id=tid and user_id=s.user_id;
   update consulta_solicitacoes set status='recusada' where id=p_id;
 else raise exception 'Ação desconhecida.'; end if;
 select * into s from consulta_solicitacoes where id=p_id;
 return _pedido_json(s);
end $$;

create or replace function public.consulta_sugestao_responder(p_id uuid, p_aceitar boolean) returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare s consulta_solicitacoes;
begin
 select * into s from consulta_solicitacoes where id=p_id and user_id=auth.uid() for update;
 if not found or s.status<>'sugerida' then raise exception 'Pedido não encontrado.'; end if;
 perform pg_advisory_xact_lock(hashtext('agenda:'||s.terapeuta_id));
 if p_aceitar then
   update consulta_solicitacoes set inicio=s.sugerido_inicio, fim=s.sugerido_fim, atualizado_em=now() where id=p_id;
   perform _pedido_confirmar(p_id);
 else
   delete from horario_reservas where terapeuta_id=s.terapeuta_id and user_id=s.user_id;
   update consulta_solicitacoes set status='cancelada', atualizado_em=now() where id=p_id;
 end if;
 select * into s from consulta_solicitacoes where id=p_id;
 return _pedido_json(s);
end $$;

create or replace function public.terapia_manutencao()
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare n_real int := 0; n_falta int := 0; n_ped int := 0; n_res int := 0; n_sol int := 0; r record; res jsonb;
begin
  for r in
    select c.id, c.sala_id from consultas c left join video_salas v on v.id = c.sala_id
    where c.status = 'marcada' and coalesce(v.fecha_em, c.fim + interval '30 minutes') < now()
    limit 500
  loop
    res := case when r.sala_id is null then null else video_sala_resumo(r.sala_id) end;
    if coalesce((res->>'realizada')::boolean, false) then
      update consultas set status = 'realizada' where id = r.id; n_real := n_real + 1;
    else
      update consultas set status = 'faltou' where id = r.id; n_falta := n_falta + 1;
    end if;
  end loop;
  update consulta_pedidos set status = 'expirado'
   where status in ('pedido','aceito') and expira_em < now();
  get diagnostics n_ped = row_count;
  -- pedidos de consulta: rascunho vencido ou sem resposta até 12h antes
  with v as (update consulta_solicitacoes set status='expirada', atualizado_em=now()
     where (status='preenchendo' and guardado_ate < now())
        or (status in ('aguardando','sugerida') and coalesce(sugerido_inicio,inicio) < now() + interval '12 hours')
     returning terapeuta_id, user_id)
  delete from horario_reservas r using v where r.terapeuta_id=v.terapeuta_id and r.user_id=v.user_id;
  select count(*) into n_sol from consulta_solicitacoes where status='expirada' and atualizado_em > now() - interval '1 minute';
  delete from horario_reservas where expira_em < now() - interval '1 hour';
  get diagnostics n_res = row_count;
  return jsonb_build_object('realizadas', n_real, 'faltou', n_falta, 'pedidos_expirados', n_ped, 'reservas_apagadas', n_res, 'solicitacoes_expiradas', n_sol);
end $function$;

grant execute on function public.terapeuta_solicitar(text,timestamptz), public.consulta_pedido_meu(text), public.consulta_pedido_salvar(uuid,text,boolean,boolean,boolean,boolean),
 public.consulta_pedido_enviar(uuid,text,boolean,boolean,boolean,boolean), public.consulta_pedido_cancelar(uuid), public.meus_pedidos_consulta(), public.terapeuta_pedidos(),
 public.terapeuta_pedido_responder(uuid,text,timestamptz,text), public.consulta_sugestao_responder(uuid,boolean) to authenticated;
revoke execute on function public._pedido_confirmar(uuid) from public, anon, authenticated;