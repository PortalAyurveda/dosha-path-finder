import { useCallback, useEffect, useState } from "react";
import { Camera, Check, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { optimizeImageToJpeg } from "@/lib/imageOptimize";

type Marco = {
  n: number;
  titulo: string;
  texto: string | null;
  abre_em: string;
  fecha_em: string;
  aberta: boolean;
  foto_path: string | null;
  enviada_em: string | null;
  estado: "aberta" | "futura" | "fechada" | "feita";
};
type Programa = { slug: string; chamada: string | null; titulo_tela: string | null; descricao: string | null; dica: string | null };
type Dados = { tem_direito: boolean; programa: Programa | null; marcos: Marco[] };

const BUCKET = "linguas-leituras";
const LARANJA = "#E07A10";
const TINTA = "#352F54";
const dataCurta = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" }) : "";

const LinguaMomentos = ({ programa }: { programa: string }) => {
  const { user } = useUser();
  const [dados, setDados] = useState<Dados | null>(null);
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [subindo, setSubindo] = useState<number | null>(null);
  const [erro, setErro] = useState<number | null>(null);
  const [falhou, setFalhou] = useState(false);

  const carregar = useCallback(async () => {
    const { data, error } = await (supabase as any).rpc("lingua_minhas", { p_programa: programa });
    if (error || !data) {
      setFalhou(true);
      return;
    }
    setFalhou(false);
    const d = data as Dados;
    setDados(d);
    const novas: Record<number, string> = {};
    for (const m of d?.marcos ?? []) {
      if (!m.foto_path) continue;
      const { data: s } = await supabase.storage.from(BUCKET).createSignedUrl(m.foto_path, 3600);
      if (s?.signedUrl) novas[m.n] = s.signedUrl;
    }
    setUrls(novas);
  }, [programa]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const enviar = async (m: Marco, arquivo: File | null | undefined) => {
    if (!arquivo || !user) return;
    setErro(null);
    setSubindo(m.n);
    try {
      const otimizada = await optimizeImageToJpeg(arquivo, { maxWidth: 1600, quality: 0.85 });
      if (!otimizada.optimized && !/^image\/(jpeg|png|webp)$/.test(arquivo.type)) throw new Error("formato");
      const file = otimizada.file;
      const path = `${user.id}/${programa}/${m.n}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
      if (error) throw error;
      const { data, error: erroSalvar } = await (supabase as any).rpc("lingua_salvar", { p_programa: programa, p_n: m.n, p_foto_path: path });
      if (erroSalvar || !data?.ok) throw erroSalvar ?? new Error(String(data?.motivo));
      await carregar();
    } catch {
      setErro(m.n);
    } finally {
      setSubindo(null);
    }
  };

  if (falhou && !dados) {
    return (
      <p className="text-sm font-semibold" style={{ color: TINTA }}>
        Não consegui abrir agora. Tente de novo em instantes.
      </p>
    );
  }
  if (!dados) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: TINTA }}>
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
      </div>
    );
  }
  if (!dados.tem_direito || !dados.programa) return null;
  const p = dados.programa;

  return (
    <div className="space-y-3" style={{ color: TINTA }}>
      <div className="rounded-[20px] border-2 p-4" style={{ background: "#FFF6E0", borderColor: "#EBCB7C" }}>
        {p.chamada && <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A8661A" }}>{p.chamada}</p>}
        {p.titulo_tela && <h2 className="mt-1 font-serif text-[22px] font-bold leading-tight">{p.titulo_tela}</h2>}
        {p.descricao && <p className="mt-2 text-base leading-relaxed">{p.descricao}</p>}
      </div>
      {p.dica && <p className="px-1 text-[15px] leading-relaxed" style={{ color: "#4A4560" }}>{p.dica}</p>}

      {dados.marcos.map((m) => {
        const feita = Boolean(m.foto_path);
        const aberta = m.aberta;
        const borda = aberta && !feita ? "#E8935A" : "#EADBC6";
        const bolinha = feita ? "#2E7D4F" : aberta ? LARANJA : "#E7E3EE";
        const corNumero = feita || aberta ? "#fff" : "#6d6883";
        const selo = feita
          ? { texto: `Guardada em ${dataCurta(m.enviada_em)}`, fundo: "#E3F2E8", cor: "#2E7D4F" }
          : aberta
            ? { texto: `Aberta até ${dataCurta(m.fecha_em)}`, fundo: "#FDE7D3", cor: "#A8661A" }
            : m.estado === "futura"
              ? { texto: `Abre em ${dataCurta(m.abre_em)}`, fundo: "#EFEDF3", cor: "#6d6883" }
              : { texto: `Fechou em ${dataCurta(m.fecha_em)}`, fundo: "#EFEDF3", cor: "#6d6883" };
        return (
          <div key={m.n} className="rounded-[20px] bg-white p-4" style={{ border: `${aberta && !feita ? 2 : 1}px solid ${borda}` }}>
            <div className="flex items-center gap-3">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full font-bold" style={{ background: bolinha, color: corNumero }}>
                {feita ? <Check className="h-4 w-4" /> : m.n}
              </span>
              <div>
                <p className="font-serif text-lg font-bold leading-tight">{m.titulo}</p>
                <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: selo.fundo, color: selo.cor }}>
                  {selo.texto}
                </span>
              </div>
            </div>

            {feita && urls[m.n] && (
              <div className="mt-3">
                <img src={urls[m.n]} alt="A foto da sua língua" className="max-h-[260px] w-auto rounded-[16px]" />
                <p className="mt-2 text-[15px]" style={{ color: "#4A4560" }}>Só você vê essa foto.</p>
              </div>
            )}

            {aberta && (
              <div className="mt-3 space-y-3">
                {subindo === m.n ? (
                  <div className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-full text-sm font-bold uppercase text-white" style={{ background: LARANJA }}>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando a sua foto…
                  </div>
                ) : feita ? (
                  <label className="flex min-h-[60px] w-full cursor-pointer items-center justify-center rounded-full border-2 bg-white text-sm font-bold uppercase" style={{ borderColor: TINTA, color: TINTA }}>
                    Trocar a foto
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void enviar(m, e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                ) : (
                  <>
                    <label className="flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold uppercase text-white" style={{ background: LARANJA }}>
                      <Camera className="h-[18px] w-[18px]" /> Tirar a foto agora
                      <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => { void enviar(m, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                    <label className="flex min-h-[60px] w-full cursor-pointer items-center justify-center rounded-full border-2 bg-white text-sm font-bold uppercase" style={{ borderColor: TINTA, color: TINTA }}>
                      Escolher uma foto do celular
                      <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void enviar(m, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </>
                )}
                {erro === m.n && <p className="text-sm font-semibold text-destructive">Não consegui guardar a foto. Tente de novo.</p>}
              </div>
            )}

            {!aberta && !feita && m.estado === "futura" && m.texto && (
              <p className="mt-2.5 flex items-center gap-2 text-[15px]" style={{ color: "#6d6883" }}>
                <Lock className="h-4 w-4 shrink-0" /> {m.texto}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LinguaMomentos;
