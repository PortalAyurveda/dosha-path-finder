import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { brl, prazoAcesso, useMeuCashback } from "@/lib/cashBlack";
import { samkhyaTokens as t } from "@/components/samkhya/tokens";

type CursoCredito = { id: string; slug: string; titulo: string; capa_url: string | null; preco: number | null; acesso_meses: number | null; acesso_ate: string | null };
type Resultado = { ok?: boolean; erro?: string; mensagem?: string; message?: string; error?: string; [k: string]: unknown };

const EXCLUIDO = "mentoria-para-terapeutas";

const UsarCredito = () => {
  const { user, isAnonymous, loading } = useUser();
  const logado = !!user && !isAnonymous;
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const { data: saldo } = useMeuCashback(logado);
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [liberados, setLiberados] = useState<CursoCredito[] | null>(null);

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

  // ?curso=slug1,slug2 já chega escolhido
  useEffect(() => {
    if (!cursos) return;
    const slugs = (params.get("curso") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length) setEscolhidos(cursos.filter((c) => slugs.includes(c.slug)).map((c) => c.id));
  }, [cursos]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = Number(saldo?.total) || 0;
  const lista = cursos ?? [];
  const escolhidosCursos = useMemo(() => lista.filter((c) => escolhidos.includes(c.id)), [lista, escolhidos]);
  const gasto = escolhidosCursos.reduce((s, c) => s + Number(c.preco || 0), 0);
  const sobra = total - gasto;

  if (!loading && !logado) return <Navigate to={`/entrar?redirect=${encodeURIComponent("/usar-credito" + (params.toString() ? `?${params}` : ""))}`} replace />;

  const usar = async () => {
    setEnviando(true); setErro(null);
    const { data, error } = await supabase.rpc("cashback_usar_cursos", { p_curso_ids: escolhidos });
    setEnviando(false);
    const r = (data ?? {}) as Resultado;
    const msg = error?.message ?? (r.ok === false || r.erro || r.error ? String(r.mensagem ?? r.erro ?? r.error ?? r.message ?? "") : null);
    if (msg !== null) { setErro(msg || "Não foi possível usar o crédito."); return; }
    setLiberados(escolhidosCursos);
    setEscolhidos([]);
    await qc.invalidateQueries({ queryKey: ["meu_cashback"] });
    qc.invalidateQueries({ queryKey: ["usar_credito_cursos"] });
  };

  const QuadroSaldo = (
    <div className="rounded-2xl px-5 py-3" style={{ background: t.roxoDark, color: t.footerTexto }}>
      <div className="text-xs">Seu crédito</div>
      <div className="font-serif text-2xl font-bold">{brl(total)}</div>
    </div>
  );

  if (liberados) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10" style={{ color: t.texto }}>
        <h1 className="font-serif text-2xl font-bold md:text-3xl" style={{ color: t.roxo }}>Cursos liberados</h1>
        <ul className="mt-5 space-y-3">
          {liberados.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: t.cardBorder }}>
              <span className="font-semibold">{c.titulo}</span>
              <Link to={`/cursos/${c.slug}/estudar`} className="inline-flex min-h-11 items-center rounded-full px-5 font-semibold" style={{ background: t.ouro, color: "#fff" }}>Abrir meu curso</Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 inline-block">{QuadroSaldo}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10" style={{ color: t.texto }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold md:text-3xl" style={{ color: t.roxo }}>Escolha o que levar</h1>
        {QuadroSaldo}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <ul className="space-y-3">
          {lista.map((c) => {
            const preco = Number(c.preco || 0);
            const marcado = escolhidos.includes(c.id);
            const falta = preco - sobra;
            const apagado = !marcado && falta > 0;
            return (
              <li key={c.id} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${apagado ? "opacity-50" : ""}`} style={{ borderColor: marcado ? t.roxo : t.cardBorder }}>
                {c.capa_url ? <img src={c.capa_url} alt="" width={96} height={64} loading="lazy" className="h-16 w-24 shrink-0 rounded-lg object-cover" /> : <div className="h-16 w-24 shrink-0 rounded-lg" style={{ background: t.roxoLight }} />}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold leading-tight">{c.titulo}</div>
                  <div className="text-xs" style={{ color: t.textoSec }}>{prazoAcesso(c.acesso_meses, c.acesso_ate)}</div>
                  <div className="font-bold" style={{ color: t.ouroText }}>{brl(preco)}</div>
                </div>
                {apagado ? (
                  <span className="shrink-0 text-right text-xs font-semibold sm:text-sm">Faltam {brl(falta)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEscolhidos((e) => (marcado ? e.filter((x) => x !== c.id) : [...e, c.id]))}
                    className="min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold"
                    style={marcado ? { borderColor: t.roxo, color: t.roxo, background: "#fff" } : { background: t.roxo, color: "#fff", borderColor: t.roxo }}
                  >
                    {marcado ? "Tirar" : "Escolher"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <aside className="rounded-2xl border p-5 lg:sticky lg:top-28" style={{ background: t.fundo, borderColor: t.cardBorder }}>
          <h2 className="font-serif text-xl font-bold" style={{ color: t.roxo }}>Você leva</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {escolhidosCursos.map((c) => (
              <li key={c.id} className="flex justify-between gap-2"><span>{c.titulo}</span><span className="whitespace-nowrap font-semibold">{brl(Number(c.preco || 0))}</span></li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between gap-2 border-t pt-3 font-semibold" style={{ borderColor: t.cardBorder }}>
            <span>Sobra no crédito</span><span className="text-green-700">{brl(sobra)}</span>
          </div>
          {erro && <p className="mt-3 text-sm text-destructive" role="alert">{erro}</p>}
          <button
            type="button"
            disabled={!escolhidos.length || enviando}
            onClick={usar}
            className="mt-4 min-h-12 w-full rounded-full font-semibold disabled:opacity-50"
            style={{ background: t.ouro, color: "#fff" }}
          >
            Usar meu crédito
          </button>
        </aside>
      </div>
    </main>
  );
};
export default UsarCredito;
