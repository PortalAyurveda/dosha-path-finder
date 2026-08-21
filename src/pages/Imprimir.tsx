import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Image as ImageIcon,
  Printer,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* ------------------------------------------------------------------ */
/* tipos                                                               */
/* ------------------------------------------------------------------ */

interface Ingrediente {
  exibicao?: string | null;
  preparo?: string | null;
  opcional?: boolean | null;
  papel?: string | null;
}

interface RotinaImpressaoRow {
  dia: number;
  slot: string;
  nugget_id: string | null;
  titulo: string | null;
  icone: string | null;
  categoria: string | null;
  subcategoria: string | null;
  resumo: string | null;
  imagem_url: string | null;
  praticado: boolean | null;
  eh_receita: boolean | null;
  rende_porcoes: number | null;
  tempo_preparo_min: number | null;
  ingredientes: Ingrediente[] | null;
  modo_preparo: string[] | null;
  dicas: string | null;
  efeito_esperado: string | null;
}

interface ReceitaRow {
  nugget_id: string;
  titulo: string | null;
  slug: string | null;
  subcategoria: string | null;
  resumo: string | null;
  imagem_url: string | null;
  rende_porcoes: number | null;
  tempo_preparo_min: number | null;
  ingredientes: Ingrediente[] | null;
  modo_preparo: string[] | null;
  dicas: string | null;
  efeito_esperado: string | null;
}

interface CompraRow {
  setor: string;
  setor_ordem: number;
  ingrediente: string;
  despensa: boolean | null;
  quantidade_texto: string | null;
  unidade_compra: string | null;
  opcional: boolean | null;
  receitas: string[] | null;
  confianca: string | null;
  tem_estimativa: boolean | null;
}

type Peca = "rotina" | "receitas" | "compras";
const PECAS_VALIDAS: Peca[] = ["rotina", "receitas", "compras"];

const SLOTS: { slot: string; label: string }[] = [
  { slot: "rotina_manha", label: "Ritual da manhã" },
  { slot: "cafe_manha", label: "Café da manhã" },
  { slot: "lanche_manha", label: "Lanche da manhã" },
  { slot: "almoco", label: "Almoço" },
  { slot: "lanche_tarde", label: "Lanche da tarde" },
  { slot: "jantar", label: "Jantar" },
  { slot: "tonico_noite", label: "Tônico da noite" },
  { slot: "bonus_diario", label: "Bônus do dia" },
];

const SETORES: Record<string, string> = {
  hortifruti: "Hortifrúti",
  proteinas: "Proteínas",
  laticinios: "Laticínios",
  graos_e_farinhas: "Grãos e farinhas",
  mercearia: "Mercearia",
  oleos_e_gorduras: "Óleos e gorduras",
  adocantes: "Adoçantes",
  especiarias: "Especiarias",
  ervas_medicinais: "Ervas",
  loja_samkhya: "Da Samkhya",
};

const SETORES_LOJA = ["loja_samkhya", "ervas_medicinais"];

/* ------------------------------------------------------------------ */
/* helpers de folha                                                    */
/* ------------------------------------------------------------------ */

const pt = (v: number, escala: number) => `${(v * escala).toFixed(2)}pt`;

const Quadradinho = ({ escala }: { escala: number }) => (
  <span
    aria-hidden="true"
    style={{
      display: "inline-block",
      width: `${7 * escala}mm`,
      height: `${7 * escala}mm`,
      border: "1pt solid #000",
      flex: "none",
      marginTop: "1mm",
    }}
  />
);

const textoIngrediente = (i: Ingrediente) => {
  let t = (i.exibicao ?? "").trim();
  if (i.preparo) t += `, ${i.preparo}`;
  if (i.opcional) t += " (opcional)";
  return t;
};

/* ------------------------------------------------------------------ */
/* página                                                              */
/* ------------------------------------------------------------------ */

const Imprimir = () => {
  const { user, profile, loading, role, roleLoading, doshaResult } = useUser();
  const [params, setParams] = useSearchParams();
  const [avisoSemPeca, setAvisoSemPeca] = useState(false);
  const [avisoReceitas, setAvisoReceitas] = useState<string | null>(null);
  const [depoisDeImprimir, setDepoisDeImprimir] = useState(false);
  const [ajudaExtra, setAjudaExtra] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);
  const bloco1Ref = useRef<HTMLDivElement | null>(null);
  const primeiraCaixaRef = useRef<HTMLInputElement | null>(null);

  /* ---------- parâmetros ---------- */
  const pecas = useMemo<Peca[]>(() => {
    const brutos = (params.get("pecas") ?? "rotina").split(",").map((p) => p.trim());
    const validos = brutos.filter((p): p is Peca => (PECAS_VALIDAS as string[]).includes(p));
    return validos.length > 0 ? validos : ["rotina"];
  }, [params]);

  const idsDaUrl = useMemo(() => {
    const raw = params.get("ids");
    if (!raw) return undefined;
    const lista = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return lista.length > 0 ? lista : undefined;
  }, [params]);

  const diaParam = useMemo(() => {
    const n = Number(params.get("dia"));
    return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null;
  }, [params]);

  const comFoto = params.get("img") === "1";

  const letraUrl = params.get("letra") === "grande" ? "grande" : params.get("letra") === "normal" ? "normal" : null;
  const [letra, setLetra] = useState<"normal" | "grande">(() => {
    if (letraUrl) return letraUrl;
    if (typeof window !== "undefined") {
      const salvo = window.localStorage.getItem("imprimir:letra");
      if (salvo === "grande") return "grande";
    }
    return "normal";
  });
  useEffect(() => {
    if (letraUrl && letraUrl !== letra) setLetra(letraUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letraUrl]);

  const escala = letra === "grande" ? 1.25 : 1;

  const temRotina = pecas.includes("rotina");
  const temReceitas = pecas.includes("receitas");
  const temCompras = pecas.includes("compras");
  const soRotina = temRotina && !diaParam;
  const soFichasAvulsas = !!idsDaUrl && temReceitas && !temRotina && !temCompras;

  const atualizar = useCallback(
    (mudar: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(params);
      mudar(p);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  const alternarPeca = (peca: Peca, ligado: boolean) => {
    const novas = ligado ? [...new Set([...pecas, peca])] : pecas.filter((p) => p !== peca);
    setAvisoSemPeca(false);
    atualizar((p) => {
      if (novas.length === 0) p.set("pecas", "");
      else p.set("pecas", PECAS_VALIDAS.filter((x) => novas.includes(x)).join(","));
    });
  };

  const pecasMarcadas = (params.get("pecas") ?? "rotina") === "" ? [] : pecas;

  /* ---------- acesso ---------- */
  const temAcessoRotina = (() => {
    if (role === "admin") return true;
    if (!user || !profile) return false;
    if (profile.is_premium === true) return true;
    const planosValidos = ["rotina", "mensal", "anual"];
    const ativo = profile.subscription_status === "active";
    const planoOk = !!profile.plano && planosValidos.includes(profile.plano);
    const dataOk = !profile.premium_until || new Date(profile.premium_until) > new Date();
    return ativo && planoOk && dataOk;
  })();

  /* ---------- dados ---------- */
  const podeConsultar = !loading && !roleLoading && (temAcessoRotina || false);

  const testeQuery = useQuery({
    queryKey: ["imprimir-teste-id", doshaResult?.idPublico],
    enabled: podeConsultar && !!doshaResult?.idPublico && !soFichasAvulsas,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("resultado_teste" as any, {
        p_idpublico: doshaResult!.idPublico,
      });
      if (error) throw error;
      return Array.isArray(data) && data[0]?.id ? (data[0].id as string) : null;
    },
  });
  const testeId = testeQuery.data ?? null;

  const rotinaQuery = useQuery({
    queryKey: ["imprimir-rotina", testeId],
    enabled: podeConsultar && !!testeId && !soFichasAvulsas,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("rotina_para_impressao" as any, {
        p_teste_id: testeId!,
      });
      if (error) throw error;
      return (data ?? []) as RotinaImpressaoRow[];
    },
  });
  const rotinaRows = rotinaQuery.data ?? [];

  const selecaoQuery = useQuery({
    queryKey: ["imprimir-selecao", user?.id],
    enabled: podeConsultar && !!user?.id && !idsDaUrl,
    queryFn: async () => {
      const { data, error } = await (supabase.from("rotina_selecao") as any)
        .select("nugget_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return ((data ?? []) as { nugget_id: string }[]).map((r) => r.nugget_id).filter(Boolean);
    },
  });

  const idsSelecao = selecaoQuery.data && selecaoQuery.data.length > 0 ? selecaoQuery.data : undefined;
  const idsEscolhidos = idsDaUrl ?? idsSelecao;
  const pIds = idsEscolhidos && idsEscolhidos.length > 0 ? idsEscolhidos : null;

  // ids das receitas da semana quando não vier nada
  const idsReceitasSemana = useMemo(() => {
    const set = new Set<string>();
    rotinaRows.forEach((r) => {
      if (r.eh_receita && r.nugget_id) set.add(r.nugget_id);
    });
    return [...set];
  }, [rotinaRows]);

  const idsReceitas = pIds ?? (idsReceitasSemana.length > 0 ? idsReceitasSemana : null);

  const receitasQuery = useQuery({
    queryKey: ["imprimir-receitas", idsReceitas],
    enabled: podeConsultar && temReceitas && !!idsReceitas,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("receitas_para_impressao" as any, {
        p_nugget_ids: idsReceitas,
      });
      if (error) throw error;
      return (data ?? []) as ReceitaRow[];
    },
  });
  const receitas = receitasQuery.data ?? [];

  const comprasQuery = useQuery({
    queryKey: ["imprimir-compras", testeId, pIds],
    enabled: podeConsultar && temCompras && !!testeId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("lista_de_compras" as any, {
        p_teste_id: testeId!,
        p_nugget_ids: pIds,
      });
      if (error) throw error;
      return (data ?? []) as CompraRow[];
    },
  });
  const compras = comprasQuery.data ?? [];

  /* semana sem receita → desmarca sozinho */
  useEffect(() => {
    if (!temReceitas || soFichasAvulsas) return;
    if (rotinaQuery.isSuccess && idsReceitasSemana.length === 0 && !pIds) {
      setAvisoReceitas(
        "Essa semana não tem receita pra imprimir — desmarquei as fichas de receita pra você."
      );
      alternarPeca("receitas", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotinaQuery.isSuccess, idsReceitasSemana.length, temReceitas]);

  /* ---------- contagem de folhas ---------- */
  const comprasPrincipais = compras.filter((c) => !c.despensa);
  const folhasRotina = temRotina ? (diaParam ? 1 : 2) : 0;
  const folhasReceitas = temReceitas ? receitas.length : 0;
  const folhasCompras = temCompras ? Math.max(1, Math.ceil(compras.length / 28)) : 0;
  const baseFolhas = folhasRotina + folhasReceitas + folhasCompras;
  const totalFolhas = pecasMarcadas.length === 0 ? 0 : Math.ceil(baseFolhas * escala);

  const detalheFolhas = [
    folhasRotina > 0 &&
      `${folhasRotina} ${folhasRotina === 1 ? "folha" : "folhas"} do quadro da semana`,
    folhasReceitas > 0 && `${folhasReceitas} ${folhasReceitas === 1 ? "folha" : "folhas"} de receita`,
    folhasCompras > 0 &&
      `${folhasCompras} ${folhasCompras === 1 ? "folha" : "folhas"} de lista de compras`,
  ]
    .filter(Boolean)
    .join(" · ");

  /* ---------- carregando / erro ---------- */
  const carregandoDados =
    (temRotina || temCompras) && !soFichasAvulsas
      ? testeQuery.isLoading || rotinaQuery.isLoading || (temCompras && comprasQuery.isLoading)
      : false;
  const carregandoReceitas = temReceitas && receitasQuery.isLoading;
  const carregando = carregandoDados || carregandoReceitas;
  const erro = rotinaQuery.isError || receitasQuery.isError || comprasQuery.isError || testeQuery.isError;

  /* ---------- imprimir ---------- */
  const dispararImpressao = async () => {
    if (imprimindo || carregando) return;
    if (pecasMarcadas.length === 0) {
      setAvisoSemPeca(true);
      bloco1Ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => primeiraCaixaRef.current?.focus(), 350);
      return;
    }
    setImprimindo(true);
    try {
      if (comFoto) {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("#folha-impressao img"));
        await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
      }
      window.print();
    } finally {
      setTimeout(() => setImprimindo(false), 800);
    }
  };

  useEffect(() => {
    const aoVoltar = () => setDepoisDeImprimir(true);
    window.addEventListener("afterprint", aoVoltar);
    return () => window.removeEventListener("afterprint", aoVoltar);
  }, []);

  /* ---------- textos de cabeçalho ---------- */
  const nome = (profile?.nome || (profile as any)?.nome_completo || doshaResult?.nome || "").trim();
  const dosha = doshaResult?.doshaprincipal ?? "";
  const titulo = `Rotina — ${nome || "Portal Ayurveda"}${dosha ? ` — ${dosha}` : ""}`;

  useEffect(() => {
    document.title = titulo;
  }, [titulo]);

  const linkVoltar = (
    <Link
      to="/minha-rotina"
      className="inline-flex h-12 items-center text-[18px] font-medium text-[#352F54] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#352F54] focus-visible:ring-offset-2"
    >
      ← Voltar pra minha rotina
    </Link>
  );

  /* ---------- gates ---------- */
  if (loading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user || !temAcessoRotina) {
    const next = `/imprimir?${params.toString()}`;
    return (
      <div className="min-h-screen bg-[#EDEBE6] px-4 py-12">
        <div className="mx-auto max-w-[210mm] rounded-xl border border-[#352F54] bg-white p-6">
          <p className="text-[18px] text-[#1A1A1A]">
            Pra imprimir a sua rotina você precisa entrar na sua conta.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-14 text-[18px] bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/auth?next=${encodeURIComponent(next)}`}>Entrar</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 text-[18px] border-2 border-[#352F54] text-[#352F54]">
              <Link to={`/assinar?next=${encodeURIComponent(next)}`}>Ver os planos</Link>
            </Button>
          </div>
          <div className="mt-6">{linkVoltar}</div>
        </div>
      </div>
    );
  }

  /* ---------- folha ---------- */
  const larguraFolha = soRotina ? "297mm" : "210mm";

  const CabecalhoFolha = () => (
    <div
      className="nao-quebrar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "6mm",
        borderBottom: "1px solid #352F54",
        paddingBottom: "3mm",
        marginBottom: "5mm",
        color: "#000",
      }}
    >
      <span style={{ fontSize: pt(14, escala), fontWeight: 500, lineHeight: 1.5 }}>
        {nome ? `${nome}${dosha ? ` · ${dosha}` : ""}` : dosha}
      </span>
      <span style={{ fontSize: pt(12, escala), fontWeight: 500 }}>portalayurveda.com</span>
    </div>
  );

  const rotinaPorDia = (dia: number) => {
    const mapa = new Map<string, RotinaImpressaoRow>();
    rotinaRows.filter((r) => r.dia === dia).forEach((r) => mapa.set(r.slot, r));
    return mapa;
  };

  const QuadroSemana = ({ dias, primeira }: { dias: number[]; primeira: boolean }) => (
    <section
      className={primeira ? "folha nao-quebrar" : "folha quebra-antes nao-quebrar"}
      style={{ color: "#000" }}
    >
      <CabecalhoFolha />
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <thead>
          <tr>
            <th style={{ width: `${34 * escala}mm`, borderRight: "1pt solid #000", textAlign: "left" }} />
            {dias.map((d) => (
              <th
                key={d}
                style={{
                  border: "0.5pt solid #000",
                  fontSize: pt(16, escala),
                  fontWeight: 700,
                  padding: "2mm",
                  textAlign: "left",
                }}
              >
                Dia {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((s) => (
            <tr key={s.slot}>
              <th
                scope="row"
                style={{
                  fontSize: pt(14, escala),
                  fontWeight: 700,
                  textAlign: "left",
                  padding: "2mm 3mm 2mm 0",
                  borderRight: "1pt solid #000",
                  borderBottom: "0.5pt solid #000",
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </th>
              {dias.map((d) => {
                const row = rotinaPorDia(d).get(s.slot);
                return (
                  <td
                    key={d}
                    style={{
                      border: "0.5pt solid #000",
                      padding: "2mm",
                      verticalAlign: "top",
                      fontSize: pt(14, escala),
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ display: "flex", gap: "2mm", alignItems: "flex-start" }}>
                      <Quadradinho escala={escala} />
                      <span>{row?.titulo ?? ""}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const FolhaDoDia = ({ dia }: { dia: number }) => {
    const mapa = rotinaPorDia(dia);
    return (
      <section className="folha" style={{ color: "#000" }}>
        <CabecalhoFolha />
        <h2
          className="font-serif"
          style={{ fontSize: pt(24, escala), fontWeight: 600, marginBottom: "6mm", lineHeight: 1.5 }}
        >
          Dia {dia}
        </h2>
        {SLOTS.map((s) => {
          const row = mapa.get(s.slot);
          if (!row) return null;
          return (
            <div key={s.slot} className="nao-quebrar" style={{ marginBottom: "8mm" }}>
              <p style={{ fontSize: pt(16, escala), fontWeight: 700, lineHeight: 1.5 }}>{s.label}</p>
              <p style={{ fontSize: pt(20, escala), lineHeight: 1.5 }}>{row.titulo}</p>
              {(row.ingredientes ?? []).length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "3mm 0 0" }}>
                  {(row.ingredientes ?? []).map((ing, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: "3mm",
                        alignItems: "flex-start",
                        fontSize: pt(16, escala),
                        marginBottom: "8mm",
                        lineHeight: 1.5,
                      }}
                    >
                      <Quadradinho escala={escala} />
                      <span>{textoIngrediente(ing)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    );
  };

  const FichaReceita = ({ r, primeira }: { r: ReceitaRow; primeira: boolean }) => {
    const apoio = [
      r.rende_porcoes ? `Rende ${r.rende_porcoes} porções` : null,
      r.tempo_preparo_min ? `${r.tempo_preparo_min} min` : null,
      r.subcategoria || null,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <section className={primeira ? "folha" : "folha quebra-antes"} style={{ color: "#000" }}>
        <CabecalhoFolha />
        <div style={{ display: "flex", gap: "6mm", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h2 className="font-serif" style={{ fontSize: pt(24, escala), fontWeight: 600, lineHeight: 1.4 }}>
              {r.titulo}
            </h2>
            {apoio && <p style={{ fontSize: pt(14, escala), lineHeight: 1.5 }}>{apoio}</p>}
          </div>
          {comFoto && r.imagem_url && (
            <img
              src={r.imagem_url}
              alt=""
              loading="eager"
              style={{ width: "45mm", height: "45mm", objectFit: "cover", flex: "none" }}
            />
          )}
        </div>

        {r.resumo && (
          <p style={{ fontSize: pt(14, escala), lineHeight: 1.5, marginLeft: "6mm", marginTop: "4mm" }}>
            {r.resumo}
          </p>
        )}

        {(r.ingredientes ?? []).length > 0 && (
          <>
            <h3 style={{ fontSize: pt(16, escala), fontWeight: 700, margin: "6mm 0 3mm" }}>Ingredientes</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {(r.ingredientes ?? []).map((ing, i) => (
                <li
                  key={i}
                  className="nao-quebrar"
                  style={{
                    display: "flex",
                    gap: "3mm",
                    alignItems: "flex-start",
                    fontSize: pt(16, escala),
                    marginBottom: "10mm",
                    lineHeight: 1.5,
                  }}
                >
                  <Quadradinho escala={escala} />
                  <span>{textoIngrediente(ing)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {(r.modo_preparo ?? []).length > 0 && (
          <>
            <h3 style={{ fontSize: pt(16, escala), fontWeight: 700, margin: "6mm 0 3mm" }}>Modo de preparo</h3>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {(r.modo_preparo ?? []).map((passo, i) => (
                <li
                  key={i}
                  className="nao-quebrar"
                  style={{
                    display: "flex",
                    gap: "4mm",
                    alignItems: "flex-start",
                    fontSize: pt(16, escala),
                    marginBottom: "10mm",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 700, width: "8mm", flex: "none" }}>{i + 1}.</span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {r.dicas && (
          <div className="nao-quebrar" style={{ border: "1pt solid #000", padding: "4mm", marginTop: "5mm" }}>
            <p style={{ fontSize: pt(14, escala), lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>Dica: </span>
              {r.dicas}
            </p>
          </div>
        )}
        {r.efeito_esperado && (
          <div className="nao-quebrar" style={{ border: "1pt solid #000", padding: "4mm", marginTop: "4mm" }}>
            <p style={{ fontSize: pt(14, escala), lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>O que ela faz por você: </span>
              {r.efeito_esperado}
            </p>
          </div>
        )}

        <p style={{ fontSize: pt(12, escala), fontWeight: 500, marginTop: "6mm" }}>
          portalayurveda.com{r.slug ? ` · portalayurveda.com/receita/${r.slug}` : ""}
        </p>
      </section>
    );
  };

  const ListaCompras = ({ primeira }: { primeira: boolean }) => {
    const principais = compras.filter((c) => !c.despensa && !c.opcional && !SETORES_LOJA.includes(c.setor) && c.setor !== "nao_se_compra");
    const opcionais = compras.filter((c) => !c.despensa && c.opcional && c.setor !== "nao_se_compra");
    const loja = compras.filter((c) => !c.despensa && !c.opcional && SETORES_LOJA.includes(c.setor));
    const despensa = compras.filter((c) => c.despensa && c.setor !== "nao_se_compra");

    const setores = [...new Set(principais.map((c) => c.setor))].sort(
      (a, b) =>
        (principais.find((c) => c.setor === a)?.setor_ordem ?? 0) -
        (principais.find((c) => c.setor === b)?.setor_ordem ?? 0)
    );

    const nomeItem = (c: CompraRow) => (
      <span style={{ lineHeight: 1.5 }}>
        {c.quantidade_texto && (
          <span style={{ fontWeight: 700 }}>
            {c.tem_estimativa ? "mais ou menos " : ""}
            {c.quantidade_texto}{" "}
          </span>
        )}
        {c.ingrediente}
      </span>
    );

    const Linha = ({ c }: { c: CompraRow }) => (
      <li
        className="nao-quebrar"
        style={{
          display: "flex",
          gap: "3mm",
          alignItems: "flex-start",
          fontSize: pt(16, escala),
          marginBottom: "11mm",
        }}
      >
        <Quadradinho escala={escala} />
        {nomeItem(c)}
      </li>
    );

    const nReceitas = receitas.length || idsReceitasSemana.length;

    return (
      <section className={primeira ? "folha" : "folha quebra-antes"} style={{ color: "#000" }}>
        <CabecalhoFolha />
        <h2 className="font-serif" style={{ fontSize: pt(24, escala), fontWeight: 600, lineHeight: 1.4 }}>
          Lista de compras
        </h2>
        <p style={{ fontSize: pt(14, escala), lineHeight: 1.5 }}>
          Da sua semana{nReceitas ? ` · ${nReceitas} receitas` : ""}
        </p>

        {principais.length === 0 && despensa.length > 0 && (
          <p style={{ fontSize: pt(14, escala), lineHeight: 1.5, marginTop: "4mm" }}>
            Tudo que essa semana pede você já costuma ter em casa. Confira a lista abaixo.
          </p>
        )}

        <div style={{ paddingLeft: "20mm", marginTop: "6mm" }}>
          {setores.map((s) => (
            <div key={s} style={{ marginBottom: "8mm" }}>
              <h3
                style={{
                  fontSize: pt(16, escala),
                  fontWeight: 700,
                  borderBottom: "1pt solid #000",
                  paddingBottom: "1.5mm",
                  marginBottom: "5mm",
                }}
              >
                {SETORES[s] ?? s}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {principais
                  .filter((c) => c.setor === s)
                  .map((c, i) => (
                    <Linha key={`${c.ingrediente}-${i}`} c={c} />
                  ))}
              </ul>
            </div>
          ))}

          {opcionais.length > 0 && (
            <div style={{ marginBottom: "8mm" }}>
              <h3 style={{ fontSize: pt(16, escala), fontWeight: 700 }}>Se você quiser</h3>
              <p style={{ fontSize: pt(14, escala), lineHeight: 1.5, marginBottom: "4mm" }}>
                Nada aqui é obrigatório: a receita sai bem sem.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {opcionais.map((c, i) => (
                  <Linha key={`${c.ingrediente}-${i}`} c={c} />
                ))}
              </ul>
            </div>
          )}

          {loja.length > 0 && (
            <div style={{ marginBottom: "8mm" }}>
              <h3 style={{ fontSize: pt(16, escala), fontWeight: 700 }}>Compre uma vez na loja</h3>
              <p style={{ fontSize: pt(14, escala), lineHeight: 1.5, marginBottom: "4mm" }}>
                Massalas e tônico rendem meses; quem está na primeira semana precisa comprar, senão a
                receita não sai.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {loja.map((c, i) => (
                  <Linha key={`${c.ingrediente}-${i}`} c={c} />
                ))}
              </ul>
            </div>
          )}

          {despensa.length > 0 && (
            <div>
              <h3 style={{ fontSize: pt(16, escala), fontWeight: 700 }}>Confira se você já tem em casa</h3>
              <p style={{ fontSize: pt(14, escala), lineHeight: 1.5, marginBottom: "4mm" }}>
                Tempero seco, sal e óleo duram meses. Só marque o que estiver acabando.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  columnCount: 2,
                  columnGap: "10mm",
                }}
              >
                {despensa.map((c, i) => (
                  <li
                    key={`${c.ingrediente}-${i}`}
                    className="nao-quebrar"
                    style={{
                      display: "flex",
                      gap: "3mm",
                      alignItems: "flex-start",
                      fontSize: pt(14, escala),
                      marginBottom: "8mm",
                      breakInside: "avoid",
                    }}
                  >
                    <Quadradinho escala={escala} />
                    <span style={{ lineHeight: 1.5 }}>{c.ingrediente}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    );
  };

  /* ---------- montagem das folhas ---------- */
  const folhas: JSX.Element[] = [];
  if (!erro && !carregando) {
    let primeira = true;
    if (temRotina) {
      if (diaParam) {
        folhas.push(<FolhaDoDia key="dia" dia={diaParam} />);
      } else {
        folhas.push(<QuadroSemana key="q1" dias={[1, 2, 3, 4]} primeira />);
        folhas.push(<QuadroSemana key="q2" dias={[5, 6, 7]} primeira={false} />);
      }
      primeira = false;
    }
    if (temReceitas) {
      receitas.forEach((r) => {
        folhas.push(<FichaReceita key={r.nugget_id} r={r} primeira={primeira} />);
        primeira = false;
      });
    }
    if (temCompras) {
      folhas.push(<ListaCompras key="compras" primeira={primeira} />);
      primeira = false;
    }
  }

  const rotuloBotao = carregando
    ? "Preparando as folhas…"
    : `Imprimir ${totalFolhas === 1 ? "a folha" : `as ${totalFolhas} folhas`}`;

  return (
    <div className="min-h-screen bg-[#EDEBE6] pb-16">
      <Helmet>
        <title>{titulo}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <style>{`@page { size: ${soRotina ? "A4 landscape" : "A4 portrait"}; margin: ${soRotina ? "10mm" : "14mm"}; }`}</style>
      <style>{`@media print {
        #folha-impressao, #folha-impressao * { visibility: visible !important; }
        #folha-impressao { position: static !important; }
      }`}</style>

      {/* ------------ barra de opções ------------ */}
      <div className="no-print px-4 pt-6">
        <div className="mx-auto max-w-[210mm] space-y-4 rounded-xl border border-[#352F54] bg-white p-6">
          {linkVoltar}

          {depoisDeImprimir && (
            <div role="status" className="rounded-lg border-2 border-[#352F54] p-4">
              <p className="text-[18px] font-bold text-[#1A1A1A]">Saiu tudo certo?</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-14 text-[18px] bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setDepoisDeImprimir(false)}
                >
                  Sim, obrigado
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 text-[18px] border-2 border-[#352F54] text-[#352F54]"
                  onClick={() => {
                    setAjudaExtra(true);
                    setDepoisDeImprimir(false);
                  }}
                >
                  Não saiu direito
                </Button>
              </div>
            </div>
          )}

          <h1 className="font-serif text-[26px] font-bold text-[#1A1A1A]">Pronto pra imprimir</h1>
          <p className="text-[18px] text-[#3F3A52]">
            Marque o que vai pro papel. Logo abaixo você vê a folha exatamente como ela vai sair da
            impressora.
          </p>

          {/* bloco 1 */}
          <section ref={bloco1Ref} className="space-y-3">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">O que vai pro papel</h2>
            {[
              {
                id: "rotina" as Peca,
                Icone: CalendarDays,
                titulo: "A rotina da semana",
                apoio:
                  "um quadro com os 7 dias, pra colar na geladeira — sai em 2 folhas, pra letra ficar grande o bastante pra ler de longe",
              },
              {
                id: "receitas" as Peca,
                Icone: BookOpen,
                titulo: "As fichas das receitas",
                apoio: "uma receita por folha, com ingredientes e modo de preparo",
              },
              {
                id: "compras" as Peca,
                Icone: ShoppingCart,
                titulo: "A lista de compras",
                apoio: "tudo que você precisa comprar, somado e separado por setor do mercado",
              },
            ].map(({ id, Icone, titulo: t, apoio }, i) => (
              <label
                key={id}
                className="flex min-h-[60px] cursor-pointer items-start gap-4 rounded-lg border-2 border-[#3F3A52] p-3"
              >
                <Checkbox
                  ref={i === 0 ? (primeiraCaixaRef as any) : undefined}
                  checked={pecasMarcadas.includes(id)}
                  onCheckedChange={(v) => alternarPeca(id, v === true)}
                  className="mt-1 h-6 w-6 border-2 border-[#3F3A52] focus-visible:ring-[3px] focus-visible:ring-[#352F54] focus-visible:ring-offset-2"
                />
                <Icone className="mt-1 h-6 w-6 shrink-0 text-[#352F54]" strokeWidth={2} aria-hidden="true" />
                <span>
                  <span className="block text-[18px] font-bold text-[#1A1A1A]">{t}</span>
                  <span className="block text-[16px] text-[#3F3A52]">{apoio}</span>
                </span>
              </label>
            ))}
            {avisoSemPeca && (
              <p className="text-[18px] text-[#8A2A1B]">
                Marque pelo menos uma coisa lá em cima pra eu saber o que imprimir.
              </p>
            )}
            {avisoReceitas && <p className="text-[18px] text-[#8A2A1B]">{avisoReceitas}</p>}
          </section>

          {/* bloco 2 */}
          <section className="space-y-3">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">Como vai sair</h2>

            {temRotina && (
              <div className="space-y-2">
                <label htmlFor="dias" className="block text-[18px] font-medium text-[#1A1A1A]">
                  Quais dias entram no quadro
                </label>
                <Select
                  value={diaParam ? String(diaParam) : "todos"}
                  onValueChange={(v) =>
                    atualizar((p) => (v === "todos" ? p.delete("dia") : p.set("dia", v)))
                  }
                >
                  <SelectTrigger id="dias" className="h-[60px] text-[18px] border-2 border-[#3F3A52]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-[18px]" value="todos">
                      A semana inteira
                    </SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <SelectItem className="text-[18px]" key={d} value={String(d)}>
                        Só o dia {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {temReceitas && (
              <label className="flex min-h-[60px] cursor-pointer items-start gap-4 rounded-lg border-2 border-[#3F3A52] p-3">
                <Checkbox
                  checked={comFoto}
                  onCheckedChange={(v) => atualizar((p) => p.set("img", v === true ? "1" : "0"))}
                  className="mt-1 h-6 w-6 border-2 border-[#3F3A52] focus-visible:ring-[3px] focus-visible:ring-[#352F54] focus-visible:ring-offset-2"
                />
                <ImageIcon className="mt-1 h-6 w-6 shrink-0 text-[#352F54]" strokeWidth={2} aria-hidden="true" />
                <span>
                  <span className="block text-[18px] font-bold text-[#1A1A1A]">
                    Imprimir as fotos das receitas
                  </span>
                  <span className="block text-[16px] text-[#3F3A52]">
                    sem foto a impressora gasta bem menos tinta
                  </span>
                </span>
              </label>
            )}

            <div className="space-y-2">
              <span className="block text-[18px] font-medium text-[#1A1A1A]">Tamanho das letras</span>
              <ToggleGroup
                type="single"
                value={letra}
                onValueChange={(v) => {
                  if (!v) return;
                  setLetra(v as "normal" | "grande");
                  window.localStorage.setItem("imprimir:letra", v);
                  atualizar((p) => p.set("letra", v));
                }}
                className="justify-start gap-3"
              >
                <ToggleGroupItem
                  value="normal"
                  className="h-14 px-6 text-[18px] border-2 border-[#3F3A52] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Normal
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grande"
                  className="h-14 px-6 text-[18px] border-2 border-[#3F3A52] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  Grande
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </section>

          {/* bloco 3 */}
          <div role="status" aria-live="polite" className="rounded-lg bg-[#F0EEE9] p-4">
            <p className="text-[18px] font-bold text-[#1A1A1A]">
              {carregando ? "Montando as suas folhas…" : `Vai sair em ${totalFolhas} folhas`}
            </p>
            {!carregando && detalheFolhas && (
              <p className="text-[16px] text-[#1A1A1A]">{detalheFolhas}</p>
            )}
          </div>

          {/* bloco 4 */}
          <div className="space-y-3">
            <Button
              onClick={dispararImpressao}
              disabled={imprimindo}
              size="lg"
              className="w-full h-16 text-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-[#352F54] focus-visible:ring-offset-2"
            >
              <Printer className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              {rotuloBotao}
            </Button>
            <p className="text-[16px] text-[#3F3A52]">
              Não tem impressora? Esse mesmo botão dá a opção de salvar em PDF, no computador e no
              celular.
            </p>
            <div className="rounded-lg border-2 border-[#3F3A52] p-4">
              <p className="text-[18px] font-bold text-[#1A1A1A]">
                Vai abrir a janela de impressão do seu computador
              </p>
              <ul className="mt-2 space-y-2 text-[16px] text-[#1A1A1A]">
                <li>
                  Onde aparecer "Retrato" e "Paisagem", deixe como já vem — a página já escolheu o
                  certo pra você.
                </li>
                <li>
                  Em "Mais configurações", deixe <strong>"Cabeçalhos e rodapés" desligado</strong> —
                  senão o navegador escreve a data e o endereço do site por cima da sua folha.
                </li>
                <li>Deixe "Escala" em "Padrão". Se você diminuir a escala, a letra encolhe junto.</li>
                {ajudaExtra && (
                  <li>
                    Se saiu em branco, espere a folha aparecer aqui embaixo antes de clicar em
                    Imprimir de novo.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ------------ prévia / folha ------------ */}
      <div className="mt-8 overflow-x-auto px-4">
        {erro ? (
          <div className="no-print mx-auto max-w-[210mm] rounded-xl border border-[#352F54] bg-white p-6">
            <p className="text-[18px] font-bold text-[#1A1A1A]">Não consegui montar as folhas agora.</p>
            <p className="text-[16px] text-[#3F3A52]">
              Tente de novo daqui a pouco, ou volte pra sua rotina.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-14 text-[18px] bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  rotinaQuery.refetch();
                  receitasQuery.refetch();
                  comprasQuery.refetch();
                }}
              >
                Tentar de novo
              </Button>
              {linkVoltar}
            </div>
          </div>
        ) : carregando ? (
          <p className="no-print mx-auto max-w-[210mm] text-[18px] text-[#1A1A1A]">
            Montando as suas folhas…
          </p>
        ) : (
          <div
            id="folha-impressao"
            className="mx-auto bg-white"
            style={{ width: larguraFolha, maxWidth: "100%", minWidth: larguraFolha }}
          >
            <style>{`
              #folha-impressao .folha {
                background: #fff;
                padding: 14mm;
                margin-bottom: 8mm;
                box-shadow: 0 6px 20px -12px rgba(0,0,0,.5);
                hyphens: none;
                text-align: left;
                font-weight: 400;
              }
              @media print {
                #folha-impressao .folha { box-shadow: none; padding: 0; margin: 0; }
              }
            `}</style>
            {folhas}
          </div>
        )}
      </div>

      <div className="no-print mt-8 px-4 text-center">{linkVoltar}</div>
    </div>
  );
};

export default Imprimir;
