import { useEffect, useState } from "react";
import { ClipboardCheck, ClipboardList, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AtividadeRunner from "./AtividadeRunner";
import { ddmm, mensagemMotivo, PintaDoshas, rpc, type Tema } from "./base";

type Item = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  tipo: "ficha" | "quiz";
  prazo: string | null;
  ativa: boolean;
  ordem: number;
  status: "nao_iniciada" | "rascunho" | "entregue";
  entregue_em: string | null;
  resultado: { acertos: number; total: number } | null;
};

type Props = { abaId: string; abaAtiva: boolean; tema: Tema };

const seloSituacao = (a: Item) => {
  if (a.status === "entregue") {
    if (a.tipo === "quiz" && a.resultado) return { t: `Feito · ${a.resultado.acertos} de ${a.resultado.total}`, f: "#E3F2E8", c: "#1B5E37" };
    return { t: `Entregue em ${ddmm(a.entregue_em)}`, f: "#E3F2E8", c: "#1B5E37" };
  }
  if (a.status === "rascunho") return { t: "Rascunho salvo", f: "#FFF1D6", c: "#7A4E00" };
  return { t: "Não começada", f: "#EFEDF3", c: "#4A4560" };
};

const AtividadesArea = ({ abaId, abaAtiva, tema }: Props) => {
  const [itens, setItens] = useState<Item[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberta, setAberta] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    setItens(null);
    setAberta(null);
    void rpc("atividades_lista", { p_escola_modulo_id: null, p_curso_id: null, p_aba_id: abaId }).then((d) => {
      if (!vivo) return;
      if (Array.isArray(d)) {
        setErro(null);
        setItens([...d].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
      } else {
        setErro(mensagemMotivo(d?.motivo));
        setItens([]);
      }
    });
    return () => {
      vivo = false;
    };
  }, [abaId, versao]);

  const faixa = !abaAtiva && (
    <div className="flex items-start gap-2 rounded-2xl border-2 border-dashed border-[#BDB6CC] bg-[#F6F4FA] p-4 text-[15px] font-semibold text-[#4A4560]">
      <EyeOff className="mt-0.5 h-4 w-4 shrink-0" />
      Desligada: só o admin vê. Para a turma ver, ligue a aba e a atividade em Admin, Atividades.
    </div>
  );

  if (!itens) return <Skeleton className="h-48 w-full rounded-3xl" />;
  if (erro) return <p className="rounded-2xl bg-white p-5 text-base font-semibold">{erro}</p>;
  if (!itens.length)
    return (
      <div className="space-y-4">
        {faixa}
        <p className="text-base text-[#4A4560]">Ainda não há atividades nesta aba.</p>
      </div>
    );

  if (itens.length === 1)
    return (
      <div className="space-y-4">
        {faixa}
        <AtividadeRunner atividadeId={itens[0].id} tema={tema} />
      </div>
    );

  if (aberta)
    return (
      <div className="space-y-4">
        {faixa}
        <AtividadeRunner
          atividadeId={aberta}
          tema={tema}
          onVoltar={() => {
            setAberta(null);
            setVersao((v) => v + 1);
          }}
        />
      </div>
    );

  return (
    <div className="space-y-4">
      {faixa}
      <div className="grid gap-3 sm:grid-cols-2">
        {itens.map((a) => {
          const s = seloSituacao(a);
          const Icone = a.tipo === "quiz" ? ClipboardCheck : ClipboardList;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAberta(a.id)}
              className="flex min-h-[60px] items-start gap-4 rounded-tl-2xl rounded-br-2xl border-2 border-[#EEEAF3] bg-white p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: `${tema.primaryColor}18`, color: tema.primaryColor }}>
                <Icone className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg font-bold leading-snug" style={{ color: tema.darkColor }}>
                  <PintaDoshas texto={a.titulo} />
                </span>
                {a.subtitulo && <span className="mt-0.5 block text-[15px] text-[#4A4560]">{a.subtitulo}</span>}
                {a.prazo && <span className="mt-1 block text-sm font-semibold text-[#5A5570]">Entrega até {ddmm(a.prazo)}</span>}
                <span className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: s.f, color: s.c }}>
                    {s.t}
                  </span>
                  {!a.ativa && <span className="rounded-full bg-[#EFEDF3] px-2.5 py-0.5 text-[13px] font-bold text-[#4A4560]">Desligada</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AtividadesArea;
