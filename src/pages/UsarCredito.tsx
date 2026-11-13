import "@/components/samkhya/samkhya-fonts.css";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { useUser } from "@/contexts/UserContext";
import { useFreteGratisConfig } from "@/hooks/useFreteGratisConfig";
import { brl, prazoAcesso, useMeuCashback } from "@/lib/cashBlack";
import { samkhyaTokens as t } from "@/components/samkhya/tokens";
import KitEscolhas, { escolhasPadrao, rotuloEscolhas, type EscolhaGrupo } from "@/components/samkhya/KitEscolhas";

type CursoCredito = { id: string; slug: string; titulo: string; capa_url: string | null; preco: number | null; acesso_meses: number | null; acesso_ate: string | null };
type ItemLoja = { slug: string; nome: string; imagem_url: string | null; preco: number; peso: number; tipo: "produto" | "kit" };
type Escolha = { qtd: number; escolhas?: Record<string, number>; grupos?: EscolhaGrupo[] };
type Frete = { id: string | number; nome: string; empresa?: string; preco: number; prazo_dias: number; frete_gratis?: boolean };
type End = { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string };

const EXCLUIDO = "mentoria-para-terapeutas";
const PREMIUM = 597;
const so = (s: string) => s.replace(/\D/g, "");
const msgErro = (e: unknown) => (e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Não foi possível usar o crédito.");

const UsarCredito = () => {
  const { user, isAnonymous, loading, profile, refreshProfile } = useUser();
  const logado = !!user && !isAnonymous;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: saldo } = useMeuCashback(logado);
  const { data: freteConfig } = useFreteGratisConfig();
  const [aba, setAba] = useState<"portal" | "samkhya">("portal");
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [premium, setPremium] = useState(false);
  const [loja, setLoja] = useState<Record<string, Escolha>>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [liberados, setLiberados] = useState<{ cursos: CursoCredito[]; premium: boolean } | null>(null);
  const [end, setEnd] = useState<End>({ cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" });
  const [trocando, setTrocando] = useState(false);
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [freteId, setFreteId] = useState("");
  const [calculando, setCalculando] = useState(false);

  const jaPremium = !!profile?.is_premium && (!(profile as { premium_until?: string | null }).premium_until || new Date((profile as { premium_until?: string | null }).premium_until!).getTime() > Date.now());

  const { data: cursos } = useQuery({
    queryKey: ["usar_credito_cursos", user?.id],
    enabled: logado,
    queryFn: async () => {
      const [{ data: cs }, { data: mats }] = await Promise.all([
        supabase.from("cursos").select("id,slug,titulo,capa_url,preco,acesso_meses,acesso_ate").eq("ativo", true).neq("slug", EXCLUIDO).order("ordem"),
        supabase.from("curso_matriculas").select("curso_id,expira_em,status").eq("user_id", user!.id),
      ]);
      const agora = Date.now();
      const tem = new Set((mats ?? []).filter((m) => m.status === "ativa" && (!m.expira_em || new Date(m.expira_em).getTime() > agora)).map((m) => m.curso_id));
      return ((cs ?? []) as CursoCredito[]).filter((c) => !tem.has(c.id));
    },
  });

  const ambos = Number(saldo?.samkhya_e_portal) || 0;
  const temSamkhya = ambos > 0;

  const { data: itensLoja } = useQuery({
    queryKey: ["usar_credito_loja"],
    enabled: logado && temSamkhya,
    queryFn: async (): Promise<ItemLoja[]> => {
      const [{ data: ps }, { data: ks }] = await Promise.all([
        lojaSupabase.from("produtos").select("*").eq("ativo", true).order("ordem_exibicao", { ascending: true, nullsFirst: false }),
        lojaSupabase.from("kits").select("*").eq("ativo", true).order("ordem_exibicao", { ascending: true, nullsFirst: false }),
      ]);
      type Row = { slug: string; nome_display?: string; nome?: string; imagem_url: string | null; preco_normal: number; peso_gramas?: number | null; so_no_kit?: boolean | null };
      return [
        ...((ks ?? []) as unknown as Row[]).map((k) => ({ slug: k.slug, nome: k.nome ?? k.slug, imagem_url: k.imagem_url, preco: Number(k.preco_normal), peso: Number(k.peso_gramas || 300), tipo: "kit" as const })),
        ...((ps ?? []) as unknown as Row[]).filter((p) => !p.so_no_kit).map((p) => ({ slug: p.slug, nome: p.nome_display ?? p.slug, imagem_url: p.imagem_url, preco: Number(p.preco_normal), peso: Number(p.peso_gramas || 300), tipo: "produto" as const })),
      ];
    },
  });

  // Endereço salvo no perfil
  useEffect(() => {
    if (!logado) return;
    supabase.from("user_profiles").select("endereco").eq("id", user!.id).maybeSingle().then(({ data }) => {
      const e = (data?.endereco ?? {}) as Record<string, string | undefined>;
      setEnd({ cep: e.cep ?? "", logradouro: e.rua ?? e.logradouro ?? "", numero: e.numero ?? "", complemento: e.complemento ?? "", bairro: e.bairro ?? "", cidade: e.cidade ?? "", estado: e.uf ?? e.estado ?? "" });
      if (!so(e.cep ?? "")) setTrocando(true);
    });
  }, [logado, user?.id]);

  // ?curso=slug1,slug2 já chega escolhido
  useEffect(() => {
    if (!cursos) return;
    const slugs = (params.get("curso") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length) setEscolhidos(cursos.filter((c) => slugs.includes(c.slug)).map((c) => c.id));
  }, [cursos]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Number(saldo?.total) || 0;
  const lista = cursos ?? [];
  const escolhidosCursos = useMemo(() => lista.filter((c) => escolhidos.includes(c.id)), [lista, escolhidos]);
  const itensEscolhidos = useMemo(() => (itensLoja ?? []).filter((i) => loja[i.slug]).map((i) => ({ ...i, ...loja[i.slug] })), [itensLoja, loja]);
  const gastoLoja = itensEscolhidos.reduce((s, i) => s + i.preco * i.qtd, 0);
  const gastoPortal = escolhidosCursos.reduce((s, c) => s + Number(c.preco || 0), 0) + (premium ? PREMIUM : 0);
  const sobra = total - gastoPortal - gastoLoja;
  const restaLoja = Math.min(ambos - gastoLoja, sobra);
  const frete = fretes.find((f) => String(f.id) === freteId) ?? null;
  const cepOk = so(end.cep).length === 8;

  // Frete, do mesmo jeito do carrinho da Samkhya
  const chaveFrete = JSON.stringify([so(end.cep), itensEscolhidos.map((i) => [i.slug, i.qtd, i.escolhas])]);
  useEffect(() => {
    setFretes([]); setFreteId("");
    if (!cepOk || !itensEscolhidos.length) return;
    let cancel = false;
    const id = window.setTimeout(async () => {
      setCalculando(true);
      try {
        const { data, error } = await supabase.functions.invoke("calcular-frete", {
          body: {
            cep_destino: so(end.cep),
            frete_gratis_cupom: false,
            itens: itensEscolhidos.map((i) => ({ slug: i.slug, tipo: i.tipo, quantidade: i.qtd, peso_gramas: i.peso, preco_unitario: i.preco, ...(i.escolhas ? { escolhas: i.escolhas } : {}) })),
          },
        });
        if (error) throw error;
        let ops = (data?.opcoes || data?.fretes || data || []) as Frete[];
        if (!Array.isArray(ops)) ops = [];
        if (ops.length && (freteConfig?.frete_gratis_ativo ?? true) && gastoLoja >= (freteConfig?.frete_gratis_minimo ?? 350)) {
          const prazo = ops.reduce((m, o) => Math.max(m, o.prazo_dias || 0), 0) || 7;
          ops = [{ id: "gratis", nome: "Samkhya Frete Grátis", empresa: "Samkhya", preco: 0, prazo_dias: prazo, frete_gratis: true }];
        }
        if (cancel) return;
        setFretes(ops);
        if (ops[0]) setFreteId(String(ops[0].id));
      } catch {
        if (!cancel) setFretes([]);
      } finally {
        if (!cancel) setCalculando(false);
      }
    }, 500);
    return () => { cancel = true; window.clearTimeout(id); };
  }, [chaveFrete]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !logado) return <Navigate to={`/entrar?redirect=${encodeURIComponent("/usar-credito" + (params.toString() ? `?${params}` : ""))}`} replace />;

  const escolherLoja = async (i: ItemLoja) => {
    if (loja[i.slug]) { setLoja(({ [i.slug]: _, ...r }) => r); return; }
    let grupos: EscolhaGrupo[] | undefined;
    if (i.tipo === "kit") {
      const { data } = await supabase.rpc("kit_detalhe" as never, { p_slug: i.slug } as never);
      const k = (Array.isArray(data) ? (data as unknown[])[0] : data) as { escolhas?: EscolhaGrupo[] } | null;
      if (k?.escolhas?.length) grupos = k.escolhas;
    }
    setLoja((l) => ({ ...l, [i.slug]: { qtd: 1, grupos, escolhas: grupos ? escolhasPadrao(grupos) : undefined } }));
  };

  const atualizarSaldo = async () => {
    await qc.invalidateQueries({ queryKey: ["meu_cashback"] });
    qc.invalidateQueries({ queryKey: ["usar_credito_cursos"] });
  };

  const usar = async () => {
    setEnviando(true); setErro(null);
    const feitos: CursoCredito[] = [];
    let fezPremium = false;
    try {
      if (escolhidosCursos.length) {
        const { error } = await supabase.rpc("cashback_usar_cursos", { p_curso_ids: escolhidosCursos.map((c) => c.id) });
        if (error) { setErro(msgErro(error)); return; }
        feitos.push(...escolhidosCursos);
        setEscolhidos([]);
      }
      if (premium) {
        const { error } = await supabase.rpc("cashback_usar_premium");
        if (error) {
          setErro(msgErro(error));
          if (feitos.length) setLiberados({ cursos: feitos, premium: false });
          return;
        }
        fezPremium = true; setPremium(false); refreshProfile?.();
      }
      if (itensEscolhidos.length) {
        const { data: perfil } = await supabase.from("user_profiles").select("nome_completo,nome,telefone,cpf").eq("id", user!.id).maybeSingle();
        const { data, error } = await supabase.rpc("cashback_resgatar_samkhya", {
          p_itens: itensEscolhidos.map((i) => ({ slug: i.slug, quantidade: i.qtd, ...(i.escolhas ? { escolhas: i.escolhas } : {}) })),
          p_comprador: { nome: perfil?.nome_completo || perfil?.nome || "", telefone: so(perfil?.telefone ?? ""), cpf: so(perfil?.cpf ?? "") },
          p_endereco: { ...end, cep: so(end.cep) },
          p_frete: { preco: frete!.preco, nome: frete!.nome, id: /^\d+$/.test(String(frete!.id)) ? Number(frete!.id) : null, prazo_dias: frete!.prazo_dias },
        } as never);
        if (error) {
          setErro(msgErro(error));
          if (feitos.length || fezPremium) setLiberados({ cursos: feitos, premium: fezPremium });
          return;
        }
        const r = data as unknown as { pedido_id: string; precisa_pagar: boolean };
        if (r.precisa_pagar) await supabase.functions.invoke("create-pix-pagamento", { body: { renovar_pedido_id: r.pedido_id } });
        await atualizarSaldo();
        navigate(`/samkhya/pedido/${r.pedido_id}`);
        return;
      }
      setLiberados({ cursos: feitos, premium: fezPremium });
    } finally {
      setEnviando(false);
      atualizarSaldo();
    }
  };

  const QuadroSaldo = (
    <div className="rounded-2xl px-5 py-3" style={{ background: t.roxoDark, color: t.footerTexto }}>
      <div className="text-xs">Seu crédito</div>
      <div className="font-serif text-2xl font-bold">{brl(total)}</div>
    </div>
  );

  const BotaoEscolha = ({ marcado, falta, onClick }: { marcado: boolean; falta: number; onClick: () => void }) =>
    !marcado && falta > 0 ? (
      <span className="shrink-0 text-right text-xs font-semibold sm:text-sm">Faltam {brl(falta)}</span>
    ) : (
      <button type="button" onClick={onClick} className="min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold"
        style={marcado ? { borderColor: t.roxo, color: t.roxo, background: "#fff" } : { background: t.roxo, color: "#fff", borderColor: t.roxo }}>
        {marcado ? "Tirar" : "Escolher"}
      </button>
    );

  const Cartao = ({ img, titulo, sub, preco, marcado, children }: { img: string | null; titulo: string; sub?: string; preco: number; marcado: boolean; children: React.ReactNode }) => (
    <div className="flex items-center gap-3">
      {img ? <img src={img} alt="" width={96} height={64} loading="lazy" className="h-16 w-24 shrink-0 rounded-lg object-cover bg-white" /> : <div className="h-16 w-24 shrink-0 rounded-lg" style={{ background: t.roxoLight }} />}
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-tight">{titulo}</div>
        {sub && <div className="text-xs" style={{ color: t.textoSec }}>{sub}</div>}
        <div className="font-bold" style={{ color: t.ouroText }}>{brl(preco)}</div>
      </div>
      {children}
      <span className="sr-only">{marcado ? "Escolhido" : ""}</span>
    </div>
  );

  if (liberados) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10" style={{ color: t.texto }}>
        <h1 className="font-serif text-2xl font-bold md:text-3xl" style={{ color: t.roxo }}>Cursos liberados</h1>
        <ul className="mt-5 space-y-3">
          {liberados.premium && <li className="rounded-2xl border bg-white p-4 font-semibold" style={{ borderColor: t.cardBorder }}>Assinatura Premium Anual</li>}
          {liberados.cursos.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: t.cardBorder }}>
              <span className="font-semibold">{c.titulo}</span>
              <Link to={`/cursos/${c.slug}/estudar`} className="inline-flex min-h-11 items-center rounded-full px-5 font-semibold" style={{ background: t.ouro, color: "#fff" }}>Abrir meu curso</Link>
            </li>
          ))}
        </ul>
        {erro && <p className="mt-4 text-sm text-destructive" role="alert">{erro}</p>}
        <div className="mt-6 inline-block">{QuadroSaldo}</div>
      </main>
    );
  }

  const podeUsar = (escolhidos.length > 0 || premium || itensEscolhidos.length > 0) && (!itensEscolhidos.length || (cepOk && !!frete && !!end.numero.trim() && !!end.logradouro.trim()));
  const campo = (k: keyof End, rotulo: string, cls = "") => (
    <label className={`block text-xs ${cls}`}>{rotulo}
      <input value={end[k]} onChange={(e) => setEnd({ ...end, [k]: e.target.value })} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-base" style={{ borderColor: t.cardBorder }} />
    </label>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10" style={{ color: t.texto }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold md:text-3xl" style={{ color: t.roxo }}>Escolha o que levar</h1>
        {QuadroSaldo}
      </div>
      {temSamkhya && (
        <div className="mt-6 inline-flex rounded-full p-1" style={{ background: t.roxoLight }} role="tablist">
          {(["portal", "samkhya"] as const).map((a) => (
            <button key={a} role="tab" aria-selected={aba === a} type="button" onClick={() => setAba(a)}
              className="min-h-11 rounded-full px-5 text-sm font-semibold"
              style={aba === a ? { background: t.roxo, color: "#fff" } : { color: t.roxo }}>
              {a === "portal" ? "Portal" : "Samkhya"}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {aba === "portal" || !temSamkhya ? (
          <ul className="space-y-3">
            {!jaPremium && (
              <li className="rounded-2xl border bg-white p-3" style={{ borderColor: premium ? t.roxo : t.cardBorder, opacity: !premium && PREMIUM > sobra ? 0.5 : 1 }}>
                <Cartao img={null} titulo="Assinatura Premium Anual" preco={PREMIUM} marcado={premium}>
                  <BotaoEscolha marcado={premium} falta={PREMIUM - sobra} onClick={() => setPremium((p) => !p)} />
                </Cartao>
              </li>
            )}
            {lista.map((c) => {
              const preco = Number(c.preco || 0);
              const marcado = escolhidos.includes(c.id);
              return (
                <li key={c.id} className="rounded-2xl border bg-white p-3" style={{ borderColor: marcado ? t.roxo : t.cardBorder, opacity: !marcado && preco > sobra ? 0.5 : 1 }}>
                  <Cartao img={c.capa_url} titulo={c.titulo} sub={prazoAcesso(c.acesso_meses, c.acesso_ate)} preco={preco} marcado={marcado}>
                    <BotaoEscolha marcado={marcado} falta={preco - sobra} onClick={() => setEscolhidos((e) => (marcado ? e.filter((x) => x !== c.id) : [...e, c.id]))} />
                  </Cartao>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3" style={{ fontFamily: t.fonteCorpo }}>
            {(itensLoja ?? []).map((i) => {
              const e = loja[i.slug];
              return (
                <li key={i.slug} className="rounded-2xl border bg-white p-3" style={{ borderColor: e ? t.roxo : t.cardBorder, opacity: !e && i.preco > restaLoja ? 0.5 : 1 }}>
                  <Cartao img={i.imagem_url} titulo={i.nome} preco={i.preco} marcado={!!e}>
                    <BotaoEscolha marcado={!!e} falta={i.preco - restaLoja} onClick={() => escolherLoja(i)} />
                  </Cartao>
                  {e && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Quantidade</span>
                        <button type="button" aria-label="Menos" disabled={e.qtd <= 1} onClick={() => setLoja((l) => ({ ...l, [i.slug]: { ...e, qtd: e.qtd - 1 } }))} className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-40" style={{ borderColor: t.cardBorder }}><Minus className="h-4 w-4" /></button>
                        <span className="w-6 text-center font-semibold">{e.qtd}</span>
                        <button type="button" aria-label="Mais" disabled={i.preco > restaLoja} onClick={() => setLoja((l) => ({ ...l, [i.slug]: { ...e, qtd: e.qtd + 1 } }))} className="flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-40" style={{ borderColor: t.cardBorder }}><Plus className="h-4 w-4" /></button>
                      </div>
                      {e.grupos && <KitEscolhas grupos={e.grupos} selecoes={e.escolhas ?? {}} onChange={(s) => setLoja((l) => ({ ...l, [i.slug]: { ...e, escolhas: s } }))} />}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="rounded-2xl border p-5" style={{ background: t.fundo, borderColor: t.cardBorder }}>
            <h2 className="font-serif text-xl font-bold" style={{ color: t.roxo }}>Você leva</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {premium && <li className="flex justify-between gap-2"><span>Assinatura Premium Anual</span><span className="whitespace-nowrap font-semibold">{brl(PREMIUM)}</span></li>}
              {escolhidosCursos.map((c) => (
                <li key={c.id} className="flex justify-between gap-2"><span>{c.titulo}</span><span className="whitespace-nowrap font-semibold">{brl(Number(c.preco || 0))}</span></li>
              ))}
              {itensEscolhidos.map((i) => (
                <li key={i.slug} className="flex justify-between gap-2">
                  <span>{i.qtd > 1 ? `${i.qtd}× ` : ""}{i.nome}{i.grupos && i.escolhas ? ` — ${rotuloEscolhas(i.grupos, i.escolhas) ?? ""}` : ""}</span>
                  <span className="whitespace-nowrap font-semibold">{brl(i.preco * i.qtd)}</span>
                </li>
              ))}
              {itensEscolhidos.length > 0 && frete && (
                <li className="flex justify-between gap-2"><span>Frete</span><span className="whitespace-nowrap font-semibold">{brl(frete.preco)}</span></li>
              )}
            </ul>
            <div className="mt-4 flex justify-between gap-2 border-t pt-3 font-semibold" style={{ borderColor: t.cardBorder }}>
              <span>Sobra no crédito</span><span className="text-green-700">{brl(sobra)}</span>
            </div>
          </div>

          {itensEscolhidos.length > 0 && (
            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: t.cardBorder }}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold" style={{ color: t.roxo }}>Endereço de entrega</h3>
                {!trocando && <button type="button" onClick={() => setTrocando(true)} className="min-h-11 px-2 text-sm font-semibold underline" style={{ color: t.roxo }}>Trocar</button>}
              </div>
              {trocando ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {campo("cep", "CEP *", "col-span-3")}
                  {campo("logradouro", "Rua", "col-span-3")}
                  {campo("numero", "Número")}
                  {campo("complemento", "Complemento", "col-span-2")}
                  {campo("bairro", "Bairro", "col-span-3")}
                  {campo("cidade", "Cidade", "col-span-2")}
                  {campo("estado", "UF")}
                </div>
              ) : (
                <p className="mt-2 text-sm">{end.logradouro}, {end.numero}{end.complemento ? ` · ${end.complemento}` : ""}<br />{end.bairro} · {end.cidade}/{end.estado} · CEP {end.cep}</p>
              )}
              {!cepOk && <p className="mt-2 text-xs text-destructive">Informe o CEP.</p>}
              {calculando && <p className="mt-3 text-sm">Calculando frete…</p>}
              {fretes.length > 0 && (
                <div className="mt-3 space-y-2" role="radiogroup">
                  {fretes.map((f) => (
                    <label key={String(f.id)} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: String(f.id) === freteId ? t.roxo : t.cardBorder }}>
                      <input type="radio" name="frete" checked={String(f.id) === freteId} onChange={() => setFreteId(String(f.id))} />
                      <span className="flex-1">{f.nome} · {f.prazo_dias} dias</span>
                      <span className="font-semibold">{brl(f.preco)}</span>
                    </label>
                  ))}
                </div>
              )}
              {frete && (
                <div className="mt-4 rounded-xl p-4" style={{ background: t.roxoLight }}>
                  <div className="font-serif text-xl font-bold" style={{ color: t.roxoDark }}>Total a pagar: {brl(frete.preco)}</div>
                  <p className="mt-1 text-sm">Os produtos saem do seu crédito. Você paga só o frete.</p>
                </div>
              )}
            </div>
          )}

          {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
          <button type="button" disabled={!podeUsar || enviando} onClick={usar}
            className="min-h-12 w-full rounded-full font-semibold disabled:opacity-50" style={{ background: t.ouro, color: "#fff" }}>
            Usar meu crédito
          </button>
        </aside>
      </div>
    </main>
  );
};
export default UsarCredito;
