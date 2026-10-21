import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Gráfico "Seus próximos meses": Vata, Pitta, Kapha e Agni no mesmo eixo de meses.
// Os números e a previsão vêm prontos do banco (RPC meu_dosha_grafico).

type Mes = {
  rotulo: string;
  tipo: "feito" | "agora" | "previsto";
  vata: number;
  pitta: number;
  kapha: number;
  agni: number | null;
};
type Grafico = { frase: string; agni_tipo: string | null; meses: Mes[] };
type Dosha = "Vata" | "Pitta" | "Kapha";

const FAIXAS: Record<Dosha, [string, number, number][]> = {
  Vata: [["Pouco", 0, 16], ["Normal", 17, 24], ["Acúmulo", 25, 35], ["Adoecido", 36, 49], ["Fixado", 50, 70]],
  Pitta: [["Pouco", 0, 19], ["Normal", 20, 30], ["Acúmulo", 31, 40], ["Adoecido", 41, 49], ["Fixado", 50, 70]],
  Kapha: [["Pouco", 0, 14], ["Normal", 15, 35], ["Acúmulo", 36, 50], ["Adoecido", 51, 59], ["Fixado", 60, 70]],
};
const COR: Record<Dosha, string> = { Vata: "#6B8AFF", Pitta: "#FF7676", Kapha: "#9ED88B" };
const TINTA: Record<Dosha, string> = { Vata: "#3E5FD9", Pitta: "#D94444", Kapha: "#4E9A3A" };
const AGNI_COR = "#7B5EA7";
const AGNI_NIVEIS = ["Bom", "Iniciando", "Moderado", "Agravado"];
const NOMES = ["Pouco", "Normal", "Acúmulo", "Adoecido", "Fixado"];
const FONTE = "DM Sans, sans-serif";

function posicao(d: Dosha, v: number) {
  const fs = FAIXAS[d];
  for (let i = 0; i < fs.length; i++) {
    const [, lo, hi] = fs[i];
    if (v <= hi || i === fs.length - 1) {
      return i + Math.min(1, Math.max(0, (v - lo + 0.5) / (hi - lo + 1)));
    }
  }
  return 5;
}

const GraficoMeses = ({ idPublico }: { idPublico: string }) => {
  const compacto = useIsMobile();
  const futuros = compacto ? 5 : 6;

  const { data } = useQuery({
    queryKey: ["meu-dosha-grafico", idPublico, futuros],
    enabled: !!idPublico,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("meu_dosha_grafico" as any, {
        p_idpublico: idPublico,
        p_meses: futuros,
      });
      if (error) return null;
      return (data ?? null) as Grafico | null;
    },
  });

  if (!data || !data.meses?.length) return null;
  const meses = data.meses;

  const W = compacto ? 350 : 820;
  const L = compacto ? 66 : 84;
  const R = compacto ? 12 : 150;
  const T = 34;
  const linhaH = compacto ? 30 : 34;
  const agniH = compacto ? 17 : 19;
  const vao = compacto ? 30 : 34;
  const dTopo = T;
  const dAlt = linhaH * 5;
  const aTopo = dTopo + dAlt + vao;
  const aAlt = agniH * 4;
  const H = aTopo + aAlt + 30;
  const cw = (W - L - R) / meses.length;
  const x = (i: number) => L + cw * (i + 0.5);
  const yD = (p: number) => dTopo + dAlt - p * linhaH;
  const yA = (n: number) => aTopo + (3 - n + 0.5) * agniH;
  const iAgora = Math.max(0, meses.findIndex((m) => m.tipo === "agora"));

  // dosha em destaque: o que está mais acima do Normal
  const agora = meses[iAgora];
  const excessos = (["Vata", "Pitta", "Kapha"] as Dosha[])
    .map((d) => ({ d, e: agora[d.toLowerCase() as "vata"] - FAIXAS[d][1][2] }))
    .filter((o) => o.e > 0)
    .sort((a, b) => b.e - a.e);
  const principal: Dosha | null = excessos.length ? excessos[0].d : null;

  const ordem: Dosha[] = (["Kapha", "Pitta", "Vata"] as Dosha[]).sort((a, b) => (a === principal ? 1 : b === principal ? -1 : 0));

  // rótulos da direita sem encavalar
  const fim = ordem
    .map((d) => {
      const v = meses[meses.length - 1][d.toLowerCase() as "vata"];
      return { d, v, y: yD(posicao(d, v)) };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < fim.length; i++) if (fim[i].y - fim[i - 1].y < 13) fim[i].y = fim[i - 1].y + 13;

  const agniPts = meses.map((m, i) => (m.agni == null ? null : ([x(i), yA(m.agni)] as [number, number])));
  const agniValidos = agniPts.filter(Boolean) as [number, number][];
  const ultimoAgni = [...meses].reverse().find((m) => m.agni != null)?.agni ?? null;

  return (
    <section id="grafico" className="bg-card rounded-xl border border-border p-4 space-y-3 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif font-bold text-foreground text-lg">Seus próximos {futuros} meses</h2>
        <span className="text-xs text-muted-foreground">Normal: Vata 17–24 · Pitta 20–30 · Kapha 15–35</span>
      </div>
      <p className="text-sm text-foreground">{data.frase}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Gráfico dos próximos meses: Vata, Pitta, Kapha e Agni">
        {/* faixas dos doshas */}
        {NOMES.map((n, i) => {
          const yt = yD(i + 1);
          const normal = n === "Normal";
          return (
            <g key={n}>
              <rect x={L} y={yt} width={W - L - R} height={linhaH} fill={normal ? "#EEF6E8" : i % 2 ? "#F6F7FA" : "#FFFFFF"} />
              <text x={L - 8} y={yt + linhaH / 2 + 4} textAnchor="end" fontSize={compacto ? 10 : 11} fontFamily={FONTE} fill={normal ? "#3D7A2C" : "#8E8AA6"} fontWeight={normal ? 700 : 500}>
                {n}
              </text>
            </g>
          );
        })}
        <rect x={L} y={dTopo} width={W - L - R} height={dAlt} fill="none" stroke="#E1E4EC" />

        {/* régua do Agni */}
        <text x={L - 8} y={aTopo - 8} textAnchor="end" fontSize={compacto ? 10.5 : 12} fontFamily={FONTE} fontWeight={700} fill="#5B3E91">Agni</text>
        {data.agni_tipo && (
          <text x={L} y={aTopo - 8} fontSize={compacto ? 10 : 11} fontFamily={FONTE} fill="#6E6A86">
            tipo: <tspan fontWeight={700} fill="#5B3E91">{data.agni_tipo}</tspan>
          </text>
        )}
        {[3, 2, 1, 0].map((nivel, j) => {
          const yt = aTopo + j * agniH;
          const bom = nivel === 0;
          return (
            <g key={nivel}>
              <rect x={L} y={yt} width={W - L - R} height={agniH} fill={bom ? "#EEF6E8" : j % 2 ? "#F6F7FA" : "#FFFFFF"} />
              <text x={L - 8} y={yt + agniH / 2 + 3.5} textAnchor="end" fontSize={compacto ? 9 : 10} fontFamily={FONTE} fill={bom ? "#3D7A2C" : "#8E8AA6"} fontWeight={bom ? 700 : 500}>
                {AGNI_NIVEIS[nivel]}
              </text>
            </g>
          );
        })}
        <rect x={L} y={aTopo} width={W - L - R} height={aAlt} fill="none" stroke="#E1E4EC" />

        {/* meses e coluna de agora */}
        <rect x={x(iAgora) - cw / 2} y={dTopo} width={cw} height={aTopo + aAlt - dTopo} fill="#352F54" fillOpacity={0.045} />
        {meses.map((m, i) => (
          <g key={i}>
            {i !== iAgora && <line x1={x(i)} x2={x(i)} y1={dTopo} y2={aTopo + aAlt} stroke="#352F54" strokeOpacity={0.05} />}
            <text x={x(i)} y={H - 10} textAnchor="middle" fontSize={compacto ? 10 : 11} fontFamily={FONTE} fill={i === iAgora ? "#352F54" : "#8E8AA6"} fontWeight={i === iAgora ? 700 : 500}>
              {m.rotulo}
            </text>
          </g>
        ))}

        {/* linhas dos doshas */}
        {ordem.map((d) => {
          const destaque = d === principal;
          const chave = d.toLowerCase() as "vata";
          const pts = meses.map((m, i) => [x(i), yD(posicao(d, m[chave]))] as [number, number]);
          return (
            <g key={d}>
              <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={COR[d]} strokeWidth={destaque ? 3 : 2} strokeLinejoin="round" />
              {pts.map(([px, py], i) => {
                const previsto = meses[i].tipo === "previsto";
                const mostrar = destaque || i === iAgora || i === pts.length - 1;
                return (
                  <g key={i}>
                    <circle cx={px} cy={py} r={i === iAgora ? 6 : destaque ? 4.5 : 3.5} fill={previsto ? "#FFFFFF" : COR[d]} stroke={COR[d]} strokeWidth={2} />
                    {mostrar && (
                      <text x={px} y={d === "Kapha" ? py + 15 : py - 9} textAnchor="middle" fontSize={i === iAgora ? 12 : 10.5} fontWeight={700} fontFamily={FONTE} fill={TINTA[d]}>
                        {meses[i][chave]}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {!compacto &&
          fim.map(({ d, v, y }) => (
            <text key={d} x={W - R + 10} y={y + 4} fontSize={11.5} fontWeight={700} fontFamily={FONTE} fill={TINTA[d]}>
              {d} {v}
            </text>
          ))}

        {/* linha do Agni */}
        {agniValidos.length > 1 && (
          <polyline points={agniValidos.map((p) => p.join(",")).join(" ")} fill="none" stroke={AGNI_COR} strokeWidth={2.5} strokeLinejoin="round" />
        )}
        {agniPts.map((p, i) =>
          p ? <circle key={i} cx={p[0]} cy={p[1]} r={i === iAgora ? 5 : 3.5} fill={meses[i].tipo === "previsto" ? "#FFFFFF" : AGNI_COR} stroke={AGNI_COR} strokeWidth={2} /> : null
        )}
        {!compacto && ultimoAgni != null && agniValidos.length > 0 && (
          <text x={W - R + 10} y={agniValidos[agniValidos.length - 1][1] + 4} fontSize={11.5} fontWeight={700} fontFamily={FONTE} fill="#5B3E91">
            Agni {AGNI_NIVEIS[ultimoAgni]}
          </text>
        )}

        {/* legenda */}
        {([["Vata", COR.Vata], ["Pitta", COR.Pitta], ["Kapha", COR.Kapha], ["Agni", AGNI_COR]] as [string, string][]).map(([n, c], i) => {
          const lx = L + i * (compacto ? 62 : 74);
          return (
            <g key={n}>
              <circle cx={lx + 5} cy={12} r={5} fill={c} />
              <text x={lx + 14} y={16} fontSize={compacto ? 11 : 12} fontWeight={700} fontFamily={FONTE} fill="#352F54">{n}</text>
            </g>
          );
        })}
        {!compacto && (
          <text x={W - R} y={16} textAnchor="end" fontSize={11} fontFamily={FONTE} fill="#8E8AA6">● feito  ○ o que as revisões podem dar</text>
        )}
      </svg>
    </section>
  );
};

export default GraficoMeses;
