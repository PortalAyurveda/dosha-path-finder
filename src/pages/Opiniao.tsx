import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Star,
  Smartphone,
  BookOpen,
  Sunrise,
  Sparkles,
  Mail,
  ShoppingBag,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

const ICONES: Record<string, LucideIcon> = {
  Smartphone,
  BookOpen,
  Sunrise,
  Sparkles,
  Mail,
  ShoppingBag,
  MessageCircle,
  Star,
};


const PRIMARY = "#352F54";
const SALMAO = "#FF7676";
const SALMAO_SOFT = "#FFF1F1";

type Tipo =
  | "escala_0_10"
  | "escala_1_5"
  | "estrelas"
  | "escolha_unica"
  | "multipla"
  | "texto_curto"
  | "texto_longo"
  | "sim_nao"
  | string;

interface Opcao {
  valor: string;
  rotulo: string;
}

interface Condicao {
  codigo?: string;
  operador?: string;
  valor?: unknown;
  tipo?: string;
}

interface Pergunta {
  codigo: string;
  secao: string | null;
  ordem: number;
  tipo: Tipo;
  enunciado: string;
  ajuda: string | null;
  opcoes: Opcao[] | null;
  obrigatoria: boolean;
  max_escolhas: number | null;
  condicao: Condicao | null;
  cor?: string | null;
  icone?: string | null;
}

interface RespostaValor {
  num?: number | null;
  texto?: string | null;
  lista?: string[] | null;
}

interface AbrirPayload {
  ok: boolean;
  motivo?: string;
  pesquisa?: {
    slug: string;
    titulo: string;
    subtitulo: string | null;
    intro_html: string | null;
    mensagem_final: string | null;
    tempo_estimado_min: number | null;
  };
  pessoa?: { nome: string | null; plano: string | null; dias_de_assinatura: number | null; dosha: string | null };
  ja_respondeu?: boolean;
  perguntas?: Pergunta[];
  respostas?: Record<string, RespostaValor>;
}

const textoDe = (r: RespostaValor | undefined): string => {
  if (!r) return "";
  if (r.texto != null && r.texto !== "") return String(r.texto);
  if (r.num != null) return String(r.num);
  if (r.lista && r.lista.length) return r.lista.join(",");
  return "";
};

const condicaoAtendida = (cond: Condicao | null, respostas: Record<string, RespostaValor>): boolean => {
  if (!cond || !cond.operador) return true;
  const alvo = cond.codigo ? respostas[cond.codigo] : undefined;
  const txt = textoDe(alvo);
  switch (cond.operador) {
    case "igual":
      return txt === String(cond.valor);
    case "diferente":
      return txt !== "" && txt !== String(cond.valor);
    case "em":
      return Array.isArray(cond.valor) && (cond.valor as unknown[]).map(String).includes(txt);
    case "preenchido":
      return txt.trim() !== "";
    default:
      return true;
  }
};

const Bolinha = ({
  n,
  ativo,
  onClick,
}: {
  n: number;
  ativo: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className="h-11 w-11 rounded-full border text-sm font-medium transition-all hover:-translate-y-0.5"
    style={
      ativo
        ? { borderColor: SALMAO, background: SALMAO_SOFT, color: PRIMARY }
        : { borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: PRIMARY }
    }
  >
    {n}
  </button>
);

const CartaoOpcao = ({
  rotulo,
  ativo,
  onClick,
  disabled,
}: {
  rotulo: string;
  ativo: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !ativo}
    aria-pressed={ativo}
    className="w-full rounded-xl border px-4 py-3 text-left text-[15px] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
    style={
      ativo
        ? { borderColor: SALMAO, background: SALMAO_SOFT, color: PRIMARY }
        : { borderColor: "hsl(var(--border))", background: "hsl(var(--card))", color: PRIMARY }
    }
  >
    {rotulo}
  </button>
);

const TextareaAuto = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-[#FF7676]"
      style={{ color: PRIMARY }}
    />
  );
};

const Estrelas = ({
  value,
  texto,
  onChange,
  naoUsei,
  onNaoUsei,
}: {
  value: number | null;
  texto: string | null;
  onChange: (n: number | null) => void;
  naoUsei?: { valor: string; rotulo: string } | null;
  onNaoUsei?: (v: string | null) => void;
}) => {
  const [hover, setHover] = useState<number | null>(null);
  const ativo = hover ?? value ?? 0;
  const marcadoNaoUsei = !!naoUsei && texto === naoUsei.valor;
  return (
    <div className="space-y-3">
      <div
        className="flex gap-1"
        onMouseLeave={() => setHover(null)}
        role="radiogroup"
        aria-label="Nota de 1 a 5 estrelas"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const preenchida = n <= ativo;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              onClick={() => {
                if (value === n && !marcadoNaoUsei) {
                  onChange(null);
                } else {
                  onChange(n);
                  onNaoUsei?.(null);
                }
              }}
              onMouseEnter={() => setHover(n)}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7676]"
              style={{ color: preenchida ? "#FACC15" : "hsl(var(--border))" }}
            >
              <Star
                className="h-7 w-7"
                fill={preenchida ? "#FACC15" : "transparent"}
                stroke={preenchida ? "#FACC15" : "currentColor"}
                strokeWidth={preenchida ? 0 : 1.5}
              />
            </button>
          );
        })}
      </div>
      {naoUsei ? (
        <button
          type="button"
          onClick={() => {
            if (marcadoNaoUsei) {
              onNaoUsei?.(null);
            } else {
              onChange(null);
              onNaoUsei?.(naoUsei.valor);
            }
          }}
          className="text-sm underline-offset-2 transition-colors hover:underline"
          style={{ color: marcadoNaoUsei ? SALMAO : undefined }}
        >
          {naoUsei.rotulo}
        </button>
      ) : null}
    </div>
  );
};

const Opiniao = () => {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("c");

  const origem = token ? "email" : searchParams.get("origem") === "banner" ? "banner" : "link";

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<AbrirPayload | null>(null);
  const [respostas, setRespostas] = useState<Record<string, RespostaValor>>({});
  const [secaoIdx, setSecaoIdx] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [tentouAvancar, setTentouAvancar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [semPesquisa, setSemPesquisa] = useState(false);

  // /opiniao sem slug -> descobre pela pesquisa_minha
  useEffect(() => {
    if (slugParam) return;
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.rpc("pesquisa_minha");
      if (!vivo) return;
      const d = data as unknown as { elegivel?: boolean; slug?: string } | null;
      if (error || !d || !d.elegivel || !d.slug) {
        setSemPesquisa(true);
        setLoading(false);
        return;
      }
      navigate(`/opiniao/${d.slug}${token ? `?c=${token}` : ""}`, { replace: true });
    })();
    return () => {
      vivo = false;
    };
  }, [slugParam, navigate, token]);

  useEffect(() => {
    if (!slugParam) return;
    let vivo = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.rpc("pesquisa_abrir", {
        p_slug: slugParam,
        p_token: token ?? null,
      });
      if (!vivo) return;
      if (error) {
        setErro("Não consegui abrir a pesquisa agora.");
        setLoading(false);
        return;
      }
      const payload = data as unknown as AbrirPayload;
      if (!payload?.ok) {
        if (payload?.motivo === "sem_login") {
          const dest = `${window.location.pathname}${window.location.search}`;
          navigate(`/entrar?redirect=${encodeURIComponent(dest)}`, { replace: true });
          return;
        }
        setSemPesquisa(true);
        setLoading(false);
        return;
      }
      setDados(payload);
      setRespostas(payload.respostas || {});
      if (payload.ja_respondeu) setConcluido(true);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
  }, [slugParam, token, navigate]);

  const perguntas = useMemo(
    () => [...(dados?.perguntas || [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [dados]
  );

  const secoes = useMemo(() => {
    const ordem: string[] = [];
    perguntas.forEach((p) => {
      const s = p.secao || "Geral";
      if (!ordem.includes(s)) ordem.push(s);
    });
    return ordem;
  }, [perguntas]);

  const visiveis = useCallback(
    (p: Pergunta): boolean => {
      const cond = p.condicao;
      if (cond?.tipo === "complemento") {
        const base = respostas[cond.codigo || ""]?.lista || [];
        const restantes = (p.opcoes || []).filter((o) => !base.includes(o.valor));
        return restantes.length > 0;
      }
      return condicaoAtendida(cond ?? null, respostas);
    },
    [respostas]
  );

  const opcoesDe = useCallback(
    (p: Pergunta): Opcao[] => {
      const cond = p.condicao;
      if (cond?.tipo === "complemento") {
        const base = respostas[cond.codigo || ""]?.lista || [];
        return (p.opcoes || []).filter((o) => !base.includes(o.valor));
      }
      return p.opcoes || [];
    },
    [respostas]
  );

  const perguntasDaSecao = useMemo(() => {
    const s = secoes[secaoIdx];
    return perguntas.filter((p) => (p.secao || "Geral") === s && visiveis(p));
  }, [perguntas, secoes, secaoIdx, visiveis]);

  const set = (codigo: string, val: RespostaValor) =>
    setRespostas((prev) => ({ ...prev, [codigo]: { ...prev[codigo], ...val } }));

  const faltando = (p: Pergunta): boolean => {
    if (!p.obrigatoria) return false;
    const r = respostas[p.codigo];
    if (p.tipo === "multipla") return !r?.lista || r.lista.length === 0;
    if (p.tipo === "escala_0_10" || p.tipo === "escala_1_5" || p.tipo === "sim_nao") return r?.num == null;
    if (p.tipo === "estrelas") return r?.num == null && !r?.texto;
    return !r?.texto || String(r.texto).trim() === "";
  };

  const montarItens = (lista: Pergunta[]) =>
    lista
      .map((p) => {
        const r = respostas[p.codigo];
        if (!r) return null;
        if (p.tipo === "multipla") {
          if (!r.lista || r.lista.length === 0) return null;
          return { codigo: p.codigo, lista: r.lista };
        }
        if (p.tipo === "escala_0_10" || p.tipo === "escala_1_5" || p.tipo === "sim_nao") {
          if (r.num == null) return null;
          return { codigo: p.codigo, num: r.num };
        }
        if (p.tipo === "estrelas") {
          if (r.num != null) return { codigo: p.codigo, num: r.num };
          if (r.texto) return { codigo: p.codigo, texto: r.texto };
          return null;
        }
        if (!r.texto || String(r.texto).trim() === "") return null;
        return { codigo: p.codigo, texto: r.texto };
      })
      .filter(Boolean);

  const salvar = async (lista: Pergunta[], concluir: boolean) => {
    const itens = montarItens(lista);
    const { data, error } = await supabase.rpc("pesquisa_responder", {
      p_slug: dados?.pesquisa?.slug ?? slugParam ?? "",
      p_itens: itens as unknown as never,
      p_token: token ?? null,
      p_concluir: concluir,
      p_origem: origem,
    });
    if (error) return { ok: false as const, motivo: "erro" };
    return (data as unknown as { ok: boolean; motivo?: string }) ?? { ok: false, motivo: "erro" };
  };

  const avancar = async () => {
    const pendencia = perguntasDaSecao.some(faltando);
    if (pendencia) {
      setTentouAvancar(true);
      return;
    }
    setTentouAvancar(false);
    const ultima = secaoIdx === secoes.length - 1;
    if (!ultima) {
      void salvar(perguntasDaSecao, false);
      setSecaoIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEnviando(true);
    const todas = perguntas.filter(visiveis);
    const res = await salvar(todas, true);
    setEnviando(false);
    if (res.ok || res.motivo === "ja_respondeu") {
      setConcluido(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErro("Não consegui gravar suas respostas agora. Tenta de novo em instantes.");
    }
  };

  const Cartao = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">{children}</div>
  );

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: SALMAO }} />
        </div>
      </main>
    );
  }

  if (semPesquisa) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
        <Helmet defer={false}>
          <title>Pesquisa — Portal Ayurveda</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Cartao>
          <h1 className="font-serif text-2xl md:text-3xl" style={{ color: PRIMARY }}>
            Nenhuma pesquisa aberta pra você agora
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Quando eu tiver uma pergunta boa pra te fazer, ela aparece aqui e no seu Meu Dosha.
          </p>
          <Link
            to="/meu-dosha"
            className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white"
            style={{ background: SALMAO }}
          >
            Voltar para Meu Dosha
          </Link>
        </Cartao>
      </main>
    );
  }

  const pesquisa = dados?.pesquisa;

  if (concluido) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
        <Helmet defer={false}>
          <title>{`${pesquisa?.titulo || "Pesquisa"} — Portal Ayurveda`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <Cartao>
          <div className="text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full font-serif text-2xl"
              style={{ background: SALMAO_SOFT, color: SALMAO }}
            >
              ॐ
            </div>
            <h1 className="mt-5 font-serif text-2xl md:text-3xl" style={{ color: PRIMARY }}>
              Obrigado de verdade
            </h1>
            {pesquisa?.mensagem_final ? (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
                {pesquisa.mensagem_final}
              </p>
            ) : null}
            <Link
              to="/meu-dosha"
              className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white"
              style={{ background: SALMAO }}
            >
              Voltar para Meu Dosha
            </Link>
          </div>
        </Cartao>
      </main>
    );
  }

  const progresso = secoes.length ? ((secaoIdx + 1) / secoes.length) * 100 : 0;
  const ultima = secaoIdx === secoes.length - 1;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <Helmet defer={false}>
        <title>{`${pesquisa?.titulo || "Pesquisa"} — Portal Ayurveda`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Cartao>
        <p className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: SALMAO }}>
          Pesquisa, opinião e satisfação
        </p>
        <h1 className="mt-2 font-serif text-2xl md:text-3xl" style={{ color: PRIMARY }}>
          {pesquisa?.titulo}
        </h1>
        {dados?.pessoa?.nome ? (
          <p className="mt-2 text-[15px]" style={{ color: PRIMARY }}>
            Oi, {dados.pessoa.nome.split(" ")[0]}.
          </p>
        ) : null}
        {pesquisa?.subtitulo ? (
          <p className="mt-2 text-[15px] text-muted-foreground">{pesquisa.subtitulo}</p>
        ) : null}
        {pesquisa?.intro_html ? (
          <div
            className="prose prose-sm mt-3 max-w-none text-[15px] text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: pesquisa.intro_html }}
          />
        ) : null}
        {pesquisa?.tempo_estimado_min ? (
          <p className="mt-3 text-xs text-muted-foreground">
            leva uns {pesquisa.tempo_estimado_min} minutos
          </p>
        ) : null}
      </Cartao>

      {secoes.length > 1 ? (
        <div className="mt-6">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, background: SALMAO }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {`Parte ${secaoIdx + 1} de ${secoes.length}`}
            {secoes[secaoIdx] && secoes[secaoIdx].toLowerCase() !== "geral" ? ` · ${secoes[secaoIdx]}` : ""}
          </p>
        </div>
      ) : null}

      <div className="mt-4 space-y-6">
        <Cartao>
          <div className="space-y-8">
            {perguntasDaSecao.map((p) => {
              const r = respostas[p.codigo];
              const invalido = tentouAvancar && faltando(p);
              const opcoes = opcoesDe(p);
              const legendas = (p.ajuda || "").split("|").map((s) => s.trim());
              return (
                <div key={p.codigo}>
                  <p className="text-[16px] font-medium leading-snug" style={{ color: PRIMARY }}>
                    {p.enunciado}
                  </p>
                  {p.tipo === "multipla" && p.max_escolhas ? (
                    <p className="mt-1 text-xs text-muted-foreground">Escolha até {p.max_escolhas}</p>
                  ) : null}
                  {p.ajuda && !["escala_0_10", "escala_1_5"].includes(p.tipo) ? (
                    <p className="mt-1 text-sm text-muted-foreground">{p.ajuda}</p>
                  ) : null}

                  <div className="mt-3">
                    {(p.tipo === "escala_0_10" || p.tipo === "escala_1_5") && (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {(p.tipo === "escala_0_10"
                            ? Array.from({ length: 11 }, (_, i) => i)
                            : Array.from({ length: 5 }, (_, i) => i + 1)
                          ).map((n) => (
                            <Bolinha key={n} n={n} ativo={r?.num === n} onClick={() => set(p.codigo, { num: n })} />
                          ))}
                        </div>
                        {legendas.length > 1 ? (
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{legendas[0]}</span>
                            <span>{legendas[legendas.length - 1]}</span>
                          </div>
                        ) : null}
                      </>
                    )}

                    {p.tipo === "estrelas" && (
                      <Estrelas
                        value={r?.num ?? null}
                        texto={r?.texto ?? null}
                        onChange={(n) => set(p.codigo, { num: n, texto: null })}
                        naoUsei={p.opcoes?.[0] ?? null}
                        onNaoUsei={(v) => set(p.codigo, { num: null, texto: v })}
                      />
                    )}

                    {p.tipo === "escolha_unica" && (
                      <div className="space-y-2">
                        {opcoes.map((o) => (
                          <CartaoOpcao
                            key={o.valor}
                            rotulo={o.rotulo}
                            ativo={r?.texto === o.valor}
                            onClick={() => set(p.codigo, { texto: o.valor })}
                          />
                        ))}
                      </div>
                    )}

                    {p.tipo === "multipla" && (
                      <div className="space-y-2">
                        {opcoes.map((o) => {
                          const lista = r?.lista || [];
                          const ativo = lista.includes(o.valor);
                          const cheio = !!p.max_escolhas && lista.length >= p.max_escolhas;
                          return (
                            <CartaoOpcao
                              key={o.valor}
                              rotulo={o.rotulo}
                              ativo={ativo}
                              disabled={cheio}
                              onClick={() =>
                                set(p.codigo, {
                                  lista: ativo ? lista.filter((v) => v !== o.valor) : [...lista, o.valor],
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    )}

                    {p.tipo === "sim_nao" && (
                      <div className="flex gap-3">
                        {[
                          { rotulo: "Sim", v: 1 },
                          { rotulo: "Não", v: 0 },
                        ].map((op) => (
                          <button
                            key={op.v}
                            type="button"
                            onClick={() => set(p.codigo, { num: op.v })}
                            aria-pressed={r?.num === op.v}
                            className="min-w-[104px] rounded-xl border px-5 py-3 text-[15px] transition-all hover:-translate-y-0.5"
                            style={
                              r?.num === op.v
                                ? { borderColor: SALMAO, background: SALMAO_SOFT, color: PRIMARY }
                                : { borderColor: "hsl(var(--border))", color: PRIMARY }
                            }
                          >
                            {op.rotulo}
                          </button>
                        ))}
                      </div>
                    )}

                    {p.tipo === "texto_curto" && (
                      <input
                        type="text"
                        value={r?.texto ?? ""}
                        onChange={(e) => set(p.codigo, { texto: e.target.value })}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-[#FF7676]"
                        style={{ color: PRIMARY }}
                      />
                    )}

                    {p.tipo === "texto_longo" && (
                      <TextareaAuto value={r?.texto ?? ""} onChange={(v) => set(p.codigo, { texto: v })} />
                    )}
                  </div>

                  {invalido ? (
                    <p className="mt-2 text-xs" style={{ color: SALMAO }}>
                      Essa aqui eu preciso saber
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Cartao>

        {erro ? <p className="text-sm text-destructive">{erro}</p> : null}

        <div
          className={`flex items-center gap-3 pb-6 ${
            secoes.length > 1 ? "justify-between" : "justify-end"
          }`}
        >
          {secoes.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setTentouAvancar(false);
                setSecaoIdx((i) => Math.max(0, i - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={secaoIdx === 0}
              className="rounded-full px-5 py-3 text-sm font-medium disabled:opacity-40"
              style={{ color: PRIMARY }}
            >
              Voltar
            </button>
          ) : null}
          <button
            type="button"
            onClick={avancar}
            disabled={enviando}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
            style={{ background: SALMAO }}
          >
            {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {secoes.length === 1 || ultima ? "Enviar minhas respostas" : "Continuar"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default Opiniao;
