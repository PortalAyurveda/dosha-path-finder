import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";

export type Tema = { primaryColor: string; darkColor: string; lightColor: string };
export type Dosha = "vata" | "pitta" | "kapha";

export type Opcao = { valor: string; rotulo: string; dosha?: Dosha | null; correta?: boolean; explicacao?: string | null };
export type Pergunta = {
  id: string;
  codigo: string;
  secao: string | null;
  ordem: number;
  tipo: string;
  enunciado: string | null;
  ajuda: string | null;
  opcoes: Opcao[] | null;
  config: any;
  obrigatoria: boolean;
};
export type Atividade = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  intro_html: string | null;
  mensagem_final: string | null;
  tipo: "ficha" | "quiz";
  prazo: string | null;
  ativa: boolean;
  config: any;
  escola_modulo_id: string | null;
  curso_id: string | null;
};
export type Resposta = {
  respostas: Record<string, any>;
  status: string;
  entregue_em: string | null;
  atualizada_em: string | null;
  resultado: { acertos: number; total: number } | null;
};
export type AbaExtra = { id: string; titulo: string; icone: string | null; ordem: number; ativa: boolean; total_atividades: number };

export const rpc = async (nome: string, params: Record<string, unknown>): Promise<any> => {
  const { data, error } = await (supabase as any).rpc(nome, params);
  if (error) return { ok: false, motivo: "erro", erro: error.message };
  return data;
};

export const MOTIVOS: Record<string, string> = {
  sem_sessao: "Entre na sua conta para continuar.",
  sem_acesso: "Você não tem acesso a esta atividade.",
  nao_encontrada: "Não encontramos esta atividade.",
  prazo_encerrado: "O prazo desta atividade terminou.",
  formato_invalido: "Uma das respostas está num formato que não deu para gravar.",
  arquivo_invalido: "Esse arquivo não pôde ser usado. Tente outro.",
  faltam: "Faltam algumas respostas.",
  erro: "Não foi possível falar com o servidor. Tente de novo.",
};
export const mensagemMotivo = (m?: string) => MOTIVOS[m ?? "erro"] ?? MOTIVOS.erro;

export const BUCKET_ATIVIDADES = "atividades-arquivos";

export const DOSHA_COR: Record<Dosha, { escura: string; clara: string; borda: string; cheia: string }> = {
  vata: { escura: "#2A4BCC", clara: "#D6E0FF", borda: "#709AFF", cheia: "#4F75FF" },
  pitta: { escura: "#CC3333", clara: "#FFE0E0", borda: "#FF8585", cheia: "#FF5C5C" },
  kapha: { escura: "#15803D", clara: "#D1F4E0", borda: "#5ED58F", cheia: "#22C55E" },
};
export const ehDosha = (d: unknown): d is Dosha => d === "vata" || d === "pitta" || d === "kapha";

/** Pinta as palavras Vata, Pitta e Kapha com a cor escura do Dosha. */
export const PintaDoshas = ({ texto }: { texto: string | null | undefined }) => {
  if (!texto) return null;
  const partes = String(texto).split(/(vata|pitta|kapha)/gi);
  return (
    <>
      {partes.map((p, i) => {
        const d = p.toLowerCase();
        return ehDosha(d) ? (
          <span key={i} style={{ color: DOSHA_COR[d].escura, fontWeight: 700 }}>
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        );
      })}
    </>
  );
};

const dataLocal = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T12:00:00`) : new Date(s));
export const ddmm = (s: string | null | undefined) =>
  s ? dataLocal(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }) : "";
export const hhmm = (s: string | Date | null | undefined) =>
  s
    ? new Date(s).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })
    : "";
export const prazoAberto = (prazo: string | null) => {
  if (!prazo) return true;
  const hoje = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return hoje <= prazo;
};

export const sanitizar = (html: string) =>
  DOMPurify.sanitize(html, { ADD_TAGS: ["style"], ADD_ATTR: ["target", "rel"], FORCE_BODY: true }) as string;
export const Html = ({ html, className }: { html: string | null | undefined; className?: string }) => {
  const limpo = useMemo(() => (html ? sanitizar(html) : ""), [html]);
  if (!limpo) return null;
  return <div className={`bloco-html ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: limpo }} />;
};

export const porcentagens = (v: number, p: number, k: number) => {
  const soma = (v || 0) + (p || 0) + (k || 0);
  if (!soma) return null;
  return { vata: Math.round((v / soma) * 100), pitta: Math.round((p / soma) * 100), kapha: Math.round((k / soma) * 100) };
};

export const BarraDosha = ({ valor, impressao = false }: { valor: { vata: number; pitta: number; kapha: number }; impressao?: boolean }) => (
  <div>
    <div className="flex h-4 w-full overflow-hidden rounded-full" style={{ border: impressao ? "0.5pt solid #000" : undefined }}>
      {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
        <div key={d} style={{ width: `${valor[d]}%`, background: DOSHA_COR[d].cheia }} />
      ))}
    </div>
    <p className="mt-1.5 flex flex-wrap gap-x-4 text-[15px]">
      {(["vata", "pitta", "kapha"] as Dosha[]).map((d) => (
        <span key={d} style={{ color: impressao ? "#000" : DOSHA_COR[d].escura, fontWeight: 700 }}>
          {d[0].toUpperCase() + d.slice(1)} {valor[d]}%
        </span>
      ))}
    </p>
  </div>
);

/** Faixa do número (primeira com valor < menor_que; a última, sem menor_que, vale para o resto). */
export const faixaDoNumero = (cfg: any, n: unknown) => {
  const faixas: { menor_que?: number; rotulo: string; dosha?: Dosha }[] = cfg?.faixas ?? [];
  if (typeof n !== "number" || !faixas.length) return null;
  return faixas.find((f) => f.menor_que == null || n < f.menor_que) ?? null;
};

/** URLs assinadas para uma lista de paths. */
export const useUrlsAssinadas = (paths: string[]) => {
  const chave = paths.join("|");
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const novas: Record<string, string> = {};
      for (const p of paths) {
        const { data } = await supabase.storage.from(BUCKET_ATIVIDADES).createSignedUrl(p, 3600);
        if (data?.signedUrl) novas[p] = data.signedUrl;
      }
      if (vivo) setUrls(novas);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return urls;
};

export const ehAudio = (p: string) => /\.(mp3|m4a|aac|wav|ogg|oga|webm|opus)$/i.test(p);

export const Pilula = ({ children, cor }: { children: ReactNode; cor?: string }) => (
  <span
    className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[13px] font-bold"
    style={{ color: cor ?? "#352F54", border: `1px solid ${cor ?? "#352F54"}33` }}
  >
    {children}
  </span>
);

/** Junta abas fixas (10, 20, 30...) com as extras pela ordem; empate entra depois da fixa. */
export function misturarAbas<F extends { id: string }>(fixas: { aba: F; pos: number }[], extras: AbaExtra[]) {
  const itens: { pos: number; peso: number; idx: number; fixa?: F; extra?: AbaExtra }[] = [
    ...fixas.map((f, idx) => ({ pos: f.pos, peso: 0, idx, fixa: f.aba })),
    ...extras.map((e, idx) => ({ pos: e.ordem ?? 0, peso: 1, idx, extra: e })),
  ];
  itens.sort((a, b) => a.pos - b.pos || a.peso - b.peso || a.idx - b.idx);
  return itens.map((i) => (i.fixa ? { tipo: "fixa" as const, aba: i.fixa } : { tipo: "extra" as const, aba: i.extra! }));
}

export const useAbasExtras = (params: { p_escola_modulo_id: string | null; p_curso_id: string | null } | null) => {
  const [abas, setAbas] = useState<AbaExtra[]>([]);
  const [carregando, setCarregando] = useState(true);
  const chave = params ? `${params.p_escola_modulo_id}|${params.p_curso_id}` : "";
  useEffect(() => {
    if (!params) return;
    let vivo = true;
    setCarregando(true);
    void rpc("atividade_abas_lista", params).then((d) => {
      if (!vivo) return;
      setAbas(Array.isArray(d) ? d : []);
      setCarregando(false);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);
  return { abas, carregando };
};
