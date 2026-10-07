import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import {
  BarraDosha,
  ddmm,
  faixaDoNumero,
  PintaDoshas,
  useUrlsAssinadas,
  type Atividade,
  type Pergunta,
  type Tema,
} from "./base";
import { ListaArquivos } from "./Campos";

const juntarE = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);

/** Texto legível da resposta de uma pergunta (usado no relatório, admin e impressão). */
export function textoResposta(p: Pergunta, v: any): string | null {
  if (v == null || v === "" || (Array.isArray(v) && !v.length)) return null;
  const cfg = p.config ?? {};
  const rotOp = (val: string) => (p.opcoes ?? []).find((o) => o.valor === val)?.rotulo ?? val;
  switch (p.tipo) {
    case "texto_curto":
    case "texto_longo":
      return String(v);
    case "numero": {
      const f = faixaDoNumero(cfg, v);
      const n = `${String(v).replace(".", ",")}${cfg.unidade ? ` ${cfg.unidade}` : ""}`;
      return f ? `${n} · ${f.rotulo}` : n;
    }
    case "escolha_unica":
      return rotOp(v);
    case "multipla": {
      const sel: string[] = Array.isArray(v) ? v : [];
      const grupos: { titulo: string; valores: string[] }[] | undefined = cfg.grupos;
      if (grupos?.length) {
        return grupos
          .map((g) => {
            const r = sel.filter((x) => g.valores?.includes(x)).map(rotOp);
            return r.length ? `${g.titulo}: ${r.join(", ")}` : null;
          })
          .filter(Boolean)
          .join(" · ");
      }
      return sel.map(rotOp).join(", ");
    }
    case "matriz": {
      const linhas: any[] = cfg.linhas ?? [];
      const colunas: any[] = cfg.colunas ?? [];
      const rl = (x: string) => linhas.find((l) => l.valor === x)?.rotulo ?? x;
      const rc = (x: string) => colunas.find((c) => c.valor === x)?.rotulo ?? x;
      const ent = linhas.filter((l) => l.valor in v);
      if (cfg.abre_ao_marcar) return ent.map((l) => [rl(l.valor), ...(v[l.valor] ?? []).map(rc)].join(", ")).join(" · ");
      if (!cfg.varias_por_linha) return ent.map((l) => `${rl(l.valor)} ${(v[l.valor] ?? []).map(rc).join(" ")}`).join(" · ");
      const excl = colunas.find((c) => c.exclusiva);
      const so = excl ? ent.filter((l) => (v[l.valor] ?? []).length === 1 && v[l.valor][0] === excl.valor) : [];
      const resto = ent.filter((l) => !so.includes(l) && (v[l.valor] ?? []).length);
      const partes: string[] = [];
      if (so.length) partes.push(`${juntarE(so.map((l) => rl(l.valor)))} ${String(excl.rotulo).toLowerCase()}`);
      partes.push(...resto.map((l) => `${rl(l.valor)} ${juntarE((v[l.valor] ?? []).map(rc))}`));
      return partes.join(" · ");
    }
    default:
      return null;
  }
}

const tituloCurto = (p: Pergunta) => p.config?.rotulo_relatorio || p.secao || p.enunciado || p.codigo;

type Props = {
  atividade: Atividade;
  perguntas: Pergunta[];
  respostas: Record<string, any>;
  entregueEm: string | null;
  tema: Tema;
  imprimirHref?: string;
};

export const separarRelatorio = (atividade: Atividade, perguntas: Pergunta[], respostas: Record<string, any>) => {
  const rel = atividade.config?.relatorio ?? {};
  const cab: string[] = rel.cabecalho ?? [];
  const dest: string[] = rel.destaques ?? [];
  const porCodigo = (c: string) => perguntas.find((p) => p.codigo === c);
  const fotosCab = cab.map(porCodigo).filter((p): p is Pergunta => !!p && p.tipo === "foto");
  const numerosCab = cab
    .map(porCodigo)
    .filter((p): p is Pergunta => !!p && p.tipo !== "foto" && p.tipo !== "teste_dosha")
    .map((p) => textoResposta(p, respostas[p.codigo]))
    .filter(Boolean) as string[];
  const doshaCab = cab.map(porCodigo).find((p) => p?.tipo === "teste_dosha");
  const destaques = dest.map(porCodigo).filter((p): p is Pergunta => !!p);
  const linhas = perguntas.filter(
    (p) =>
      !cab.includes(p.codigo) &&
      !dest.includes(p.codigo) &&
      p.tipo !== "informativo" &&
      p.tipo !== "teste_dosha" &&
      respostas[p.codigo] != null,
  );
  const fotoPaths = fotosCab.flatMap((p) => Object.values((respostas[p.codigo] ?? {}) as Record<string, string>));
  return { titulo: rel.titulo || "Meu relatório", fotosCab, fotoPaths, numerosCab, doshaCab, destaques, linhas };
};

const AtividadeRelatorio = ({ atividade, perguntas, respostas, entregueEm, tema, imprimirHref }: Props) => {
  const s = separarRelatorio(atividade, perguntas, respostas);
  const urls = useUrlsAssinadas(s.fotoPaths);
  const doshaVal = s.doshaCab ? respostas[s.doshaCab.codigo] : null;

  return (
    <div className="space-y-5 text-[#1F1B30]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-bold" style={{ color: tema.darkColor }}>
          {s.titulo}
        </h2>
        <Link
          to={imprimirHref ?? `/atividade/${atividade.id}/imprimir`}
          className="inline-flex min-h-[60px] items-center gap-2 rounded-full border-2 px-6 text-base font-bold"
          style={{ borderColor: tema.primaryColor, color: tema.primaryColor }}
        >
          <Printer className="h-5 w-5" /> Imprimir
        </Link>
      </div>

      {(s.fotoPaths.length > 0 || entregueEm || s.numerosCab.length > 0 || doshaVal) && (
        <div className="space-y-3 rounded-2xl border-2 border-[#EEEAF3] bg-white p-4">
          {s.fotoPaths.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {s.fotoPaths.map((p) => (urls[p] ? <img key={p} src={urls[p]} alt="" className="h-32 rounded-xl object-cover" /> : null))}
            </div>
          )}
          <p className="text-base font-semibold text-[#4A4560]">
            {[entregueEm ? `Entregue em ${ddmm(entregueEm)}` : null, ...s.numerosCab].filter(Boolean).join(" · ")}
          </p>
          {doshaVal && <BarraDosha valor={doshaVal} />}
        </div>
      )}

      {s.destaques.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {s.destaques.map((p) => {
            const v = respostas[p.codigo];
            const f = p.tipo === "numero" ? faixaDoNumero(p.config, v) : null;
            const txt = f ? f.rotulo : textoResposta(p, v);
            return (
              <div key={p.id} className="rounded-tl-2xl rounded-br-2xl border-2 border-[#EEEAF3] bg-white p-3">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#6d6883]">{tituloCurto(p)}</p>
                <p className="mt-1 font-serif text-[19px] font-bold leading-snug">{txt ? <PintaDoshas texto={txt} /> : "—"}</p>
              </div>
            );
          })}
        </div>
      )}

      {s.linhas.length > 0 && (
        <div className="divide-y divide-[#EEEAF3] rounded-2xl border-2 border-[#EEEAF3] bg-white">
          {s.linhas.map((p) => {
            const v = respostas[p.codigo];
            return (
              <div key={p.id} className="p-4">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#6d6883]">{tituloCurto(p)}</p>
                <div className="mt-1 whitespace-pre-line text-base leading-relaxed">
                  {p.tipo === "arquivo" ? (
                    <ListaArquivos paths={Array.isArray(v) ? v : []} />
                  ) : p.tipo === "foto" ? (
                    <FotosLinha paths={Object.values(v ?? {}) as string[]} />
                  ) : (
                    <PintaDoshas texto={textoResposta(p, v)} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FotosLinha = ({ paths }: { paths: string[] }) => {
  const urls = useUrlsAssinadas(paths);
  return (
    <div className="flex gap-2 overflow-x-auto">
      {paths.map((p) => (urls[p] ? <img key={p} src={urls[p]} alt="" className="h-28 rounded-xl object-cover" /> : null))}
    </div>
  );
};

export default AtividadeRelatorio;
