import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { optimizeImageToJpeg } from "@/lib/imageOptimize";
import {
  BarraDosha,
  BUCKET_ATIVIDADES,
  DOSHA_COR,
  ehAudio,
  ehDosha,
  faixaDoNumero,
  Html,
  PintaDoshas,
  porcentagens,
  useUrlsAssinadas,
  type Pergunta,
  type Tema,
} from "./base";

type CampoProps = {
  pergunta: Pergunta;
  valor: any;
  onChange: (v: any) => void;
  tema: Tema;
  leitura: boolean;
  atividadeId: string;
};

const estiloMarcado = (marcado: boolean, dosha: unknown, tema: Tema) => {
  if (!marcado) return { background: "#fff", borderColor: "#D8D3E3", color: "#2A2540" };
  if (ehDosha(dosha)) return { background: DOSHA_COR[dosha].clara, borderColor: DOSHA_COR[dosha].borda, color: "#1F1B30" };
  return { background: `${tema.primaryColor}18`, borderColor: tema.primaryColor, color: "#1F1B30" };
};

export const PilulaOpcao = ({
  rotulo,
  marcado,
  dosha,
  tema,
  onClick,
  disabled,
}: {
  rotulo: string;
  marcado: boolean;
  dosha?: unknown;
  tema: Tema;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    disabled={disabled}
    aria-pressed={marcado}
    onClick={onClick}
    className="inline-flex min-h-[52px] items-center gap-1.5 rounded-full border-2 px-4 py-2 text-left text-base font-semibold transition-colors disabled:cursor-default"
    style={estiloMarcado(marcado, dosha, tema)}
  >
    {marcado && <Check className="h-4 w-4 shrink-0" />}
    <span>
      <PintaDoshas texto={rotulo} />
    </span>
  </button>
);

const TesteDosha = ({ valor, onChange, leitura }: CampoProps) => {
  const { doshaResult } = useUser();
  const local = useLocation();
  const calc = doshaResult
    ? porcentagens(doshaResult.vatascore ?? 0, doshaResult.pittascore ?? 0, doshaResult.kaphascore ?? 0)
    : null;
  const ref = useRef(onChange);
  ref.current = onChange;
  useEffect(() => {
    if (leitura || !calc) return;
    if (!valor || valor.vata !== calc.vata || valor.pitta !== calc.pitta || valor.kapha !== calc.kapha) ref.current(calc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc?.vata, calc?.pitta, calc?.kapha, leitura]);
  const mostrar = calc ?? valor;
  return (
    <div className="rounded-2xl border-2 border-[#E7E3EE] bg-white p-4">
      <p className="font-serif text-lg font-bold text-[#2A2540]">Seu teste de dosha</p>
      {mostrar ? (
        <div className="mt-3">
          <BarraDosha valor={mostrar} />
        </div>
      ) : (
        <div className="mt-2 space-y-3">
          <p className="text-base text-[#4A4560]">Você ainda não fez o teste de dosha</p>
          {!leitura && (
            <Link
              to={`/teste-de-dosha?redirect=${encodeURIComponent(local.pathname + local.search)}`}
              className="flex min-h-[60px] items-center justify-center rounded-full bg-[#352F54] px-6 text-base font-bold text-white"
            >
              Fazer o teste de dosha
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

const Numero = ({ pergunta, valor, onChange, leitura }: CampoProps) => {
  const cfg = pergunta.config ?? {};
  const [texto, setTexto] = useState(valor == null ? "" : String(valor).replace(".", ","));
  useEffect(() => {
    const atual = texto.trim() === "" ? null : Number(texto.replace(",", "."));
    if (atual !== valor) setTexto(valor == null ? "" : String(valor).replace(".", ","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);
  const faixa = faixaDoNumero(cfg, valor);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          disabled={leitura}
          value={texto}
          onChange={(e) => {
            const t = e.target.value.replace(/[^\d.,-]/g, "");
            setTexto(t);
            if (t.trim() === "") return onChange(null);
            const n = Number(t.replace(",", "."));
            if (!Number.isNaN(n)) onChange(n);
          }}
          className="h-[60px] w-40 rounded-2xl border-2 border-[#D8D3E3] bg-white px-4 text-2xl font-bold text-[#1F1B30] focus:border-[#352F54] focus:outline-none"
        />
        {cfg.unidade && <span className="text-lg font-semibold text-[#4A4560]">{cfg.unidade}</span>}
      </div>
      {faixa && (
        <span
          className="inline-block rounded-full px-3 py-1 text-[15px] font-bold"
          style={
            ehDosha(faixa.dosha)
              ? { background: DOSHA_COR[faixa.dosha].clara, color: DOSHA_COR[faixa.dosha].escura }
              : { background: "#EFEDF3", color: "#352F54" }
          }
        >
          {cfg.rotulo_relatorio ? `${cfg.rotulo_relatorio}: ` : ""}
          {faixa.rotulo}
        </span>
      )}
    </div>
  );
};

const Multipla = ({ pergunta, valor, onChange, tema, leitura }: CampoProps) => {
  const sel: string[] = Array.isArray(valor) ? valor : [];
  const ops = pergunta.opcoes ?? [];
  const alterna = (v: string) => onChange(sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v]);
  const pilulas = (lista: typeof ops) => (
    <div className="flex flex-wrap gap-2">
      {lista.map((o) => (
        <PilulaOpcao key={o.valor} rotulo={o.rotulo} dosha={o.dosha} marcado={sel.includes(o.valor)} tema={tema} disabled={leitura} onClick={() => alterna(o.valor)} />
      ))}
    </div>
  );
  const grupos: { titulo: string; subtitulo?: string; valores: string[] }[] | undefined = pergunta.config?.grupos;
  if (!grupos?.length) return pilulas(ops);
  return (
    <div className="space-y-5">
      {grupos.map((g, i) => (
        <div key={i}>
          <p className="font-serif text-lg font-bold text-[#2A2540]">
            <PintaDoshas texto={g.titulo} />
          </p>
          {g.subtitulo && <p className="mb-2 text-sm text-[#5A5570]">{g.subtitulo}</p>}
          {pilulas(ops.filter((o) => g.valores?.includes(o.valor)))}
        </div>
      ))}
    </div>
  );
};

const Matriz = ({ pergunta, valor, onChange, tema, leitura }: CampoProps) => {
  const cfg = pergunta.config ?? {};
  const linhas: { valor: string; rotulo: string; ajuda?: string; dosha?: string }[] = cfg.linhas ?? [];
  const colunas: { valor: string; rotulo: string; dosha?: string; exclusiva?: boolean }[] = cfg.colunas ?? [];
  const atual: Record<string, string[]> = valor && typeof valor === "object" && !Array.isArray(valor) ? valor : {};
  const grava = (novo: Record<string, string[]>) => onChange(Object.keys(novo).length ? novo : null);

  if (cfg.abre_ao_marcar) {
    return (
      <div className="space-y-2">
        {linhas.map((l) => {
          const marcada = l.valor in atual;
          const escolha = atual[l.valor] ?? [];
          return (
            <div key={l.valor} className="rounded-2xl border-2 bg-white p-3" style={estiloMarcado(marcada, l.dosha, tema)}>
              <button
                type="button"
                disabled={leitura}
                role="checkbox"
                aria-checked={marcada}
                onClick={() => {
                  const n = { ...atual };
                  if (marcada) delete n[l.valor];
                  else n[l.valor] = [];
                  grava(n);
                }}
                className="flex min-h-[52px] w-full items-center gap-3 text-left text-base font-semibold"
              >
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2"
                  style={{ borderColor: marcada ? tema.primaryColor : "#BDB6CC", background: marcada ? tema.primaryColor : "#fff" }}
                >
                  {marcada && <Check className="h-4 w-4 text-white" />}
                </span>
                <span>
                  <PintaDoshas texto={l.rotulo} />
                  {l.ajuda && <span className="block text-sm font-normal text-[#5A5570]">{l.ajuda}</span>}
                </span>
              </button>
              {marcada && (
                <div className="mt-2 space-y-2 pl-10">
                  {cfg.pergunta_da_linha && <p className="text-[15px] text-[#4A4560]">{cfg.pergunta_da_linha}</p>}
                  <div className="flex flex-wrap gap-2">
                    {colunas.map((c) => (
                      <PilulaOpcao
                        key={c.valor}
                        rotulo={c.rotulo}
                        dosha={c.dosha}
                        tema={tema}
                        disabled={leitura}
                        marcado={escolha.includes(c.valor)}
                        onClick={() => grava({ ...atual, [l.valor]: escolha.includes(c.valor) ? [] : [c.valor] })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const toca = (linha: string, col: (typeof colunas)[number]) => {
    const sel = atual[linha] ?? [];
    let novo: string[];
    if (cfg.varias_por_linha) {
      if (sel.includes(col.valor)) novo = sel.filter((x) => x !== col.valor);
      else if (col.exclusiva) novo = [col.valor];
      else novo = [...sel.filter((x) => !colunas.find((c) => c.valor === x)?.exclusiva), col.valor];
    } else novo = sel.includes(col.valor) ? [] : [col.valor];
    const n = { ...atual };
    if (novo.length) n[linha] = novo;
    else delete n[linha];
    grava(n);
  };

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th />
            {colunas.map((c) => (
              <th key={c.valor} className="px-0.5 pb-2 text-center text-[12px] font-bold leading-tight sm:text-sm">
                <PintaDoshas texto={c.rotulo} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.valor} className="h-[52px] border-t border-[#EEEAF3]">
              <td className="py-1 pr-2 text-base font-semibold text-[#2A2540]">
                <PintaDoshas texto={l.rotulo} />
                {l.ajuda && <span className="ml-1.5 text-[13px] font-normal text-[#6d6883]">{l.ajuda}</span>}
              </td>
              {colunas.map((c) => {
                const marcado = (atual[l.valor] ?? []).includes(c.valor);
                const cor = ehDosha(c.dosha) ? DOSHA_COR[c.dosha].cheia : tema.primaryColor;
                return (
                  <td key={c.valor} className="text-center">
                    <button
                      type="button"
                      disabled={leitura}
                      aria-pressed={marcado}
                      aria-label={`${l.rotulo}: ${c.rotulo}`}
                      onClick={() => toca(l.valor, c)}
                      className="inline-flex h-[44px] w-[40px] items-center justify-center"
                    >
                      <span
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2"
                        style={{ borderColor: marcado ? cor : "#BDB6CC", background: marcado ? cor : "#fff" }}
                      >
                        {marcado && <Check className="h-4 w-4 text-white" />}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Silhueta = ({ lado }: { lado: boolean }) => (
  <svg viewBox="0 0 60 140" className="h-36 w-auto" fill="none" stroke="#BDB6CC" strokeWidth="2" strokeLinecap="round">
    {lado ? (
      <>
        <circle cx="30" cy="14" r="9" />
        <path d="M28 24 C24 40 24 60 27 74 L25 104 L26 134 M32 74 L33 104 L35 134 M28 30 C34 44 36 56 33 70" />
      </>
    ) : (
      <>
        <circle cx="30" cy="14" r="9" />
        <path d="M20 28 L40 28 L44 70 M20 28 L16 70 M22 30 L22 76 L24 134 M38 30 L38 76 L36 134 M22 76 L38 76 M30 78 L30 130" />
      </>
    )}
  </svg>
);

async function subirArquivo(atividadeId: string, codigo: string, arquivo: File, foto: boolean) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("sem_sessao");
  let file = arquivo;
  if (foto) file = (await optimizeImageToJpeg(arquivo, { maxWidth: 1600, quality: 0.85 })).file;
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${u.user.id}/${atividadeId}/${codigo}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET_ATIVIDADES).upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

const Foto = ({ pergunta, valor, onChange, leitura, atividadeId }: CampoProps) => {
  const fotos: { valor: string; rotulo: string }[] = pergunta.config?.fotos ?? [];
  const atual: Record<string, string> = valor && typeof valor === "object" ? valor : {};
  const urls = useUrlsAssinadas(Object.values(atual));
  const [subindo, setSubindo] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  const enviar = async (v: string, f?: File | null) => {
    if (!f) return;
    setErro(false);
    setSubindo(v);
    try {
      const path = await subirArquivo(atividadeId, pergunta.codigo, f, true);
      onChange({ ...atual, [v]: path });
    } catch {
      setErro(true);
    } finally {
      setSubindo(null);
    }
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        {fotos.map((f) => {
          const path = atual[f.valor];
          const lado = /lado|perfil|lateral/i.test(f.valor + f.rotulo);
          return (
            <div key={f.valor} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#D8D3E3] bg-white p-3">
              {path && urls[path] ? (
                <img src={urls[path]} alt={f.rotulo} className="h-44 w-full rounded-xl object-cover" />
              ) : (
                <Silhueta lado={lado} />
              )}
              <p className="text-center text-[15px] font-bold text-[#2A2540]">{f.rotulo}</p>
              {!leitura && (
                <label className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#352F54] px-3 text-center text-sm font-bold text-[#352F54]">
                  {subindo === f.valor ? <Loader2 className="h-4 w-4 animate-spin" /> : path ? "Trocar" : "Tirar ou escolher foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={subindo !== null}
                    onChange={(e) => {
                      void enviar(f.valor, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
      {erro && <p className="text-sm font-semibold text-destructive">Não foi possível enviar a foto. Tente de novo.</p>}
      <p className="text-[15px] text-[#4A4560]">🔒 Só você e o Edson veem as fotos.</p>
    </div>
  );
};

export const ListaArquivos = ({ paths }: { paths: string[] }) => {
  const urls = useUrlsAssinadas(paths);
  return (
    <ul className="space-y-2">
      {paths.map((p) => (
        <li key={p}>
          {ehAudio(p) && urls[p] ? (
            <audio controls src={urls[p]} className="w-full" />
          ) : (
            <a href={urls[p]} target="_blank" rel="noreferrer" className="font-semibold text-[#352F54] underline">
              {p.split("/").pop()}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
};

const Arquivo = ({ pergunta, valor, onChange, leitura, atividadeId }: CampoProps) => {
  const lista: string[] = Array.isArray(valor) ? valor : [];
  const max = Number(pergunta.config?.quantidade) || 1;
  const [subindo, setSubindo] = useState(false);
  const [erro, setErro] = useState(false);
  return (
    <div className="space-y-3">
      {lista.length > 0 && (
        <div className="space-y-2">
          <ListaArquivos paths={lista} />
          {!leitura && (
            <div className="flex flex-wrap gap-2">
              {lista.map((p, i) => (
                <button key={p} type="button" className="text-sm font-semibold text-destructive underline" onClick={() => onChange(lista.filter((x) => x !== p))}>
                  Remover arquivo {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!leitura && lista.length < max && (
        <label className="flex min-h-[60px] cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[#352F54] px-6 text-base font-bold text-[#352F54]">
          {subindo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />} Enviar arquivo
          <input
            type="file"
            accept={pergunta.config?.aceita ?? undefined}
            multiple={max - lista.length > 1}
            className="sr-only"
            disabled={subindo}
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []).slice(0, max - lista.length);
              e.target.value = "";
              if (!files.length) return;
              setErro(false);
              setSubindo(true);
              try {
                const novos: string[] = [];
                for (const f of files) novos.push(await subirArquivo(atividadeId, pergunta.codigo, f, false));
                onChange([...lista, ...novos]);
              } catch {
                setErro(true);
              } finally {
                setSubindo(false);
              }
            }}
          />
        </label>
      )}
      {erro && <p className="text-sm font-semibold text-destructive">Não foi possível enviar o arquivo. Tente de novo.</p>}
    </div>
  );
};

export const Campo = (props: CampoProps) => {
  const { pergunta, valor, onChange, tema, leitura } = props;
  switch (pergunta.tipo) {
    case "informativo":
      return null;
    case "teste_dosha":
      return <TesteDosha {...props} />;
    case "texto_curto":
      return (
        <input
          disabled={leitura}
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="min-h-[52px] w-full rounded-2xl border-2 border-[#D8D3E3] bg-white px-4 text-base text-[#1F1B30] focus:border-[#352F54] focus:outline-none"
        />
      );
    case "texto_longo":
      return (
        <textarea
          disabled={leitura}
          rows={5}
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-2xl border-2 border-[#D8D3E3] bg-white p-4 text-base leading-relaxed text-[#1F1B30] focus:border-[#352F54] focus:outline-none"
        />
      );
    case "numero":
      return <Numero {...props} />;
    case "escolha_unica":
      return (
        <div className="flex flex-wrap gap-2">
          {(pergunta.opcoes ?? []).map((o) => (
            <PilulaOpcao key={o.valor} rotulo={o.rotulo} dosha={o.dosha} tema={tema} disabled={leitura} marcado={valor === o.valor} onClick={() => onChange(valor === o.valor ? null : o.valor)} />
          ))}
        </div>
      );
    case "multipla":
      return <Multipla {...props} />;
    case "matriz":
      return <Matriz {...props} />;
    case "foto":
      return <Foto {...props} />;
    case "arquivo":
      return <Arquivo {...props} />;
    default:
      return null;
  }
};

export const CabecalhoPergunta = ({ pergunta, tema }: { pergunta: Pergunta; tema: Tema }) => {
  if (pergunta.tipo === "informativo") return <Html html={pergunta.ajuda} className="text-base leading-relaxed text-[#2A2540]" />;
  return (
    <div className="mb-3">
      {pergunta.enunciado && (
        <p className="font-serif text-[20px] font-bold leading-snug text-[#1F1B30]">
          <PintaDoshas texto={pergunta.enunciado} />
          {pergunta.obrigatoria && (
            <span aria-label="obrigatória" className="ml-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ background: tema.primaryColor }} />
          )}
        </p>
      )}
      {pergunta.ajuda && <p className="mt-1 text-sm text-[#5A5570]">{pergunta.ajuda}</p>}
    </div>
  );
};
