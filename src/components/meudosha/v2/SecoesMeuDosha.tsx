import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Lock } from "lucide-react";
import { CursoCardCapa } from "@/components/course/CursoCardCapa";
import { cursoParaCardConfig } from "@/pages/CursosVitrine";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { getTherapistProfilePath, nomeCurtoEspecialidade, splitTherapistSpecialties } from "@/lib/terapeutas";
import { cn } from "@/lib/utils";

const CAMPOS_CARD =
  "id,titulo,capa_url,card_logo_url,card_cor_secundaria,card_subtitulo,card_cta_texto,card_foto_posicao,card_fosco_opacidade,card_titulo_sobre_foto,card_foto_zoom,card_titulo_tamanho,card_mostrar_titulo,card_mostrar_subtitulo,card_mostrar_logo,card_overlay_pos,card_logo_tamanho,card_texto_cor";

// Seções do Meu Dosha 2.0. Todos os dados vêm de RPCs do banco (CMS).

const Titulo = ({ children, lado }: { children: React.ReactNode; lado?: React.ReactNode }) => (
  <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
    <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl">{children}</h2>
    {lado && <span className="text-sm text-muted-foreground">{lado}</span>}
  </div>
);

const Cadeado = () => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[#5B5675]">
    <Lock className="h-3.5 w-3.5" />
  </span>
);

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// ============ Seu dia ============
type ItemDia = { slot: string; rotulo: string; nugget_id: string; slug: string | null; titulo: string; imagem: string | null };

export const SeuDia = ({ idPublico, temAcesso }: { idPublico: string; temAcesso: boolean }) => {
  const { data: itens = [] } = useQuery({
    queryKey: ["meu-dia", idPublico],
    enabled: temAcesso && !!idPublico,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("meu_dia" as any, { p_idpublico: idPublico });
      if (error) return [];
      return (data ?? []) as ItemDia[];
    },
  });
  const hoje = new Date();
  const dataTxt = `${DIAS[hoje.getDay()]}, ${hoje.getDate()} de ${MESES[hoje.getMonth()]}`;

  return (
    <section>
      <Titulo lado={dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1)}>Seu dia</Titulo>
      {!temAcesso ? (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 p-4">
          <Cadeado />
          <p className="flex-1 min-w-[200px] text-sm">
            <strong>Você ainda não tem a Rotina do dia.</strong>
            <span className="block text-muted-foreground">
              A Rotina monta café da manhã, almoço, lanche, jantar e tônico da noite pelo seu dosha, todo dia.
            </span>
          </p>
          <Link to="/assinar" className="rounded-full border border-[#D9CCF2] bg-[#EFE9FA] px-4 py-2 text-sm font-semibold text-[#5B3E91]">
            Conhecer a Rotina
          </Link>
        </div>
      ) : (
        <>
          {itens.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {itens.map((it) => (
                <Link
                  key={it.slot}
                  to={`/minha-rotina?item=${encodeURIComponent(it.slug || it.nugget_id)}`}
                  className="flex-none w-[72%] sm:w-auto overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    {it.imagem && <img src={it.imagem} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
                    <span className="absolute left-2 bottom-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                      {it.rotulo}
                    </span>
                  </div>
                  <p className="p-3 font-serif text-sm font-semibold leading-snug text-foreground">{it.titulo}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/minha-rotina" className="rounded-full bg-[#FF7676] px-4 py-2 text-sm font-semibold text-white">
              Ver minha rotina de hoje
            </Link>
            <Link to="/minha-rotina?aba=receitas" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
              Todas as receitas
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

// ============ Meus cursos ============
type CursoMeu = { id: string; slug: string; titulo: string; subtitulo: string | null; cor: string | null; capa: string | null; tem: boolean; rotulo: string | null; link: string };

export const MeusCursos = () => {
  const { user } = useUser();
  const { data: cursos = [] } = useQuery({
    queryKey: ["cursos-para-mim", user?.id],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cursos_para_mim" as any);
      if (error) return [];
      return (data ?? []) as CursoMeu[];
    },
  });
  const ids = cursos.map((c) => c.id);
  const { data: cards = [] } = useQuery({
    queryKey: ["cursos-cards", ids.join(",")],
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("cursos").select(CAMPOS_CARD).in("id", ids);
      return (data ?? []) as any[];
    },
  });
  if (!cursos.length) return null;
  const meus = cursos.filter((c) => c.tem).length;

  return (
    <section>
      <Titulo lado={meus ? `${meus} ${meus === 1 ? "seu" : "seus"} · ${cursos.length} cursos no Portal` : `${cursos.length} cursos no Portal`}>
        Meus cursos
      </Titulo>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {cursos.map((c) => {
          const row = cards.find((r) => r.id === c.id);
          // A capa já traz o título desenhado: sem logo e sem texto abaixo, para todos os cards ficarem iguais.
          const cfgBase = row
            ? cursoParaCardConfig(row)
            : cursoParaCardConfig({ titulo: c.titulo, capa_url: c.capa, card_subtitulo: c.subtitulo, card_cor_secundaria: c.cor } as any);
          const cfg = { ...cfgBase, mostrarLogo: false };
          return (
            <Link
              key={c.id}
              to={c.link}
              className={cn(
                "group flex flex-none w-[64%] snap-start sm:w-auto flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
                c.tem && "ring-2 ring-amber-400/80"
              )}
            >
              <div className="relative">
                <div className={cn(!c.tem && "grayscale opacity-75")}>
                  <CursoCardCapa cfg={cfg} />
                </div>
                {c.tem ? (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#D9A400] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-md">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Seu curso
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </span>
                )}
              </div>
              <div className="mt-auto px-6 pb-4 pt-3">
                <span className={cn("flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold", c.tem ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {c.tem ? "Acessar curso" : row?.card_cta_texto || "Conhecer"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// ============ O que mais perguntam à Akasha ============
type PerguntaAkasha = { grupo: string; ordem: number; pergunta: string; resposta: string | null };

export const AkashaPerguntas = ({ dosha }: { dosha: string }) => {
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");
  const { data: itens = [] } = useQuery({
    queryKey: ["akasha-perguntas", dosha],
    enabled: !!dosha,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("akasha_perguntas_para" as any, { p_dosha: dosha });
      if (error) return [];
      return (data ?? []) as PerguntaAkasha[];
    },
  });
  if (!itens.length) return null;
  const grupo = itens[0].grupo;
  const cartoes = itens.filter((i) => i.resposta);
  const atalhos = itens.filter((i) => !i.resposta);
  const abrir = (p: string) => navigate(`/akasha?pergunta=${encodeURIComponent(p)}`);

  return (
    <section className="rounded-3xl p-5 md:p-6 text-white" style={{ background: "linear-gradient(160deg, #2E2850, #4A3F7A)" }}>
      <h2 className="font-serif font-bold text-xl md:text-2xl !text-white">O que mais perguntam à Akasha quem tem {grupo} agravado</h2>
      <p className="mt-1 text-sm text-[#D9D3F2]">Resumo das conversas de pessoas com o mesmo dosha agravado que você.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {cartoes.map((c) => (
          <button
            key={c.ordem}
            type="button"
            onClick={() => abrir(c.pergunta)}
            className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.08] p-4 text-left transition-colors hover:bg-white/[0.12]"
          >
            <span className="font-serif text-[15px] font-bold leading-snug text-white">{c.pergunta}</span>
            <span className="text-[13px] leading-relaxed text-[#E4DFF7]">{c.resposta}</span>
            <span className="mt-auto text-xs font-bold text-[#FFD8A8]">Continuar com a Akasha →</span>
          </button>
        ))}
      </div>
      {atalhos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {atalhos.map((a) => (
            <button key={a.ordem} type="button" onClick={() => abrir(a.pergunta)} className="rounded-full border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/10">
              {a.pergunta}
            </button>
          ))}
        </div>
      )}
      <form
        className="mt-4 flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (texto.trim()) abrir(texto.trim());
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={`Pergunte à Akasha sobre o seu ${grupo}…`}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#352F54] outline-none placeholder:text-[#6E6A86]"
        />
        <button type="submit" className="rounded-full bg-[#7B5EA7] px-4 py-2 text-sm font-semibold text-white">
          Perguntar
        </button>
      </form>
    </section>
  );
};

// ============ Artigos para começar ============
type ArtigoInicio = { id: string; titulo: string; slug: string; imagem: string | null; resumo: string | null };

export const ArtigosComecar = ({ dosha }: { dosha: string }) => {
  const { user } = useUser();
  const { data: artigos = [] } = useQuery({
    queryKey: ["artigos-para-comecar", user?.id, dosha],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("artigos_para_comecar" as any, { p_limite: 3, p_dosha: dosha || null });
      if (error) return [];
      return (data ?? []) as ArtigoInicio[];
    },
  });
  if (!artigos.length) return null;
  return (
    <section>
      <Titulo>Artigos para começar</Titulo>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {artigos.map((a) => (
          <Link key={a.id} to={`/blog/${a.slug}`} className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 transition-shadow hover:shadow-md sm:flex-col sm:p-0">
            <div className="h-20 w-28 flex-none overflow-hidden rounded-xl bg-muted sm:h-auto sm:w-full sm:rounded-none sm:aspect-video">
              {a.imagem && <img src={a.imagem} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 py-1 sm:px-3 sm:pb-3">
              <p className="font-serif text-sm font-semibold leading-snug text-foreground md:text-[15px]">{a.titulo}</p>
              {a.resumo && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.resumo}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// ============ Dos Textos Clássicos ============
type Classicos = {
  verso: { texto: string; livro: string; referencia: string } | null;
  planta: { chave: string; nome: string; nome_popular: string | null; nome_latim: string | null; n_obras: number | null; link: string } | null;
};

export const ClassicosDosha = ({ dosha }: { dosha: string }) => {
  const { data } = useQuery({
    queryKey: ["classicos-para-dosha", dosha],
    enabled: !!dosha,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("classicos_para_dosha" as any, { p_dosha: dosha });
      if (error) return null;
      return (data ?? null) as Classicos | null;
    },
  });
  if (!data || (!data.verso && !data.planta)) return null;
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl">Dos Textos Clássicos</h2>
        <Link to="/textos-classicos" className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
          Abrir os Textos Clássicos
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
        {data.verso && (
          <div className="flex flex-col gap-2 rounded-2xl border border-[#EFE3C8] bg-[#FBF6EC] p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A7550]">Verso para o seu dosha</span>
            <p className="font-serif text-[17px] leading-relaxed text-foreground">“{data.verso.texto}”</p>
            <span className="text-xs text-[#8A7550]">
              {data.verso.livro} · {data.verso.referencia}
            </span>
          </div>
        )}
        {data.planta && (
          <Link to={data.planta.link} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Planta dos clássicos</span>
            <p className="font-serif text-lg font-semibold text-foreground">{data.planta.nome}</p>
            {(data.planta.nome_popular || data.planta.nome_latim) && (
              <p className="text-sm text-muted-foreground">{[data.planta.nome_popular, data.planta.nome_latim].filter(Boolean).join(" · ")}</p>
            )}
            <span className="mt-auto text-xs font-semibold text-foreground">
              {data.planta.n_obras ? `Em ${data.planta.n_obras} ${data.planta.n_obras === 1 ? "livro" : "livros"} · ` : ""}Ver a planta →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
};

// ============ Terapeutas perto de você ============
type TerapeutaPerto = { nome: string; cidade: string | null; uf: string | null; desde: number | null; especialidade: string | null; frase: string | null; imagem: string | null; slug: string | null };
type Perto = { uf: string | null; total_uf: number; total: number; ufs: { uf: string; n: number }[] | null; itens: TerapeutaPerto[] };

export const TerapeutasPerto = ({ idPublico }: { idPublico: string }) => {
  const [uf, setUf] = useState<string>("");
  const { data } = useQuery({
    queryKey: ["terapeutas-perto", idPublico, uf],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("terapeutas_perto" as any, { p_idpublico: idPublico, p_uf: uf || null });
      if (error) return null;
      return (data ?? null) as Perto | null;
    },
  });
  const semItens = !data || !data.itens?.length;
  const { data: reserva = [] } = useQuery({
    queryKey: ["terapeutas-reserva"],
    enabled: semItens,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("portal_terapeutas")
        .select("*")
        .eq("status", "aprovado")
        .order("created date", { ascending: false })
        .limit(3);
      return ((rows ?? []) as any[]).map(
        (t): TerapeutaPerto => ({
          nome: t.nome ?? "Terapeuta",
          cidade: t.cidade,
          uf: t.estado ? String(t.estado).slice(0, 2).toUpperCase() : null,
          desde: t.formado_desde ?? null,
          especialidade: t.especialidade,
          frase: t.frase_card ?? null,
          imagem: t.imagem_card || t.imagem || t["imagem.1"] || null,
          slug: t["terapeutas(dinamica)"] ?? null,
        })
      );
    },
  });
  const itensMostrar = semItens ? reserva : data!.itens;
  if (!data && !reserva.length) return null;
  const ufAtual = data?.uf ?? null;
  const ufs = data?.ufs ?? [];

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl">Terapeutas perto de você</h2>
        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">Seu estado:</span>
          <select value={ufAtual ?? ""} onChange={(e) => setUf(e.target.value)} className="bg-transparent font-semibold text-foreground outline-none">
            <option value="" disabled>
              escolha
            </option>
            {(data.ufs ?? []).map((u) => (
              <option key={u.uf} value={u.uf}>
                {u.uf}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {ufAtual
          ? data.total_uf
            ? `Em ${ufAtual} ${data.total_uf === 1 ? "é 1 terapeuta" : `são ${data.total_uf} terapeutas`}.`
            : `Ainda não temos terapeutas em ${ufAtual}.`
          : "Escolha o estado onde você mora para ver quem atende perto."}
      </p>
      {data.itens.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {data.itens.map((t) => {
            const esp = splitTherapistSpecialties(t.especialidade).slice(0, 2).map(nomeCurtoEspecialidade);
            return (
              <Link key={t.slug ?? t.nome} to={getTherapistProfilePath(t.slug ?? t.nome)} className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-md">
                <div className="aspect-[4/5] w-20 flex-none overflow-hidden rounded-xl bg-muted">
                  {t.imagem && <img src={t.imagem} alt={`Foto de ${t.nome}`} loading="lazy" decoding="async" width={480} height={600} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-[15px] font-bold leading-snug text-foreground">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {[t.cidade, t.uf].filter(Boolean).join(" · ")}
                    {t.desde ? ` · desde ${t.desde}` : ""}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {esp.map((e) => (
                      <span key={e} className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-[11px] font-semibold text-[#4E3F7E]">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Link to="/terapeutas-do-brasil" className="mt-3 inline-block rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
        Ver os {data.total} terapeutas do Brasil
      </Link>
    </section>
  );
};
