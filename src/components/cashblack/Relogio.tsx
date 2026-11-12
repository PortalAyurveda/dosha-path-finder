import { partesRestantes, useAgora } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const dd = (n: number) => String(n).padStart(2, "0");

/** Relógio em plaquinhas laranja até `fimMs`. */
const Relogio = ({ fimMs, pequeno = false }: { fimMs: number; pequeno?: boolean }) => {
  const agora = useAgora(true);
  const p = partesRestantes(fimMs, agora);
  const itens: [string, number][] = [["d", p.d], ["h", p.h], ["m", p.m], ["s", p.s]];
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" aria-label={`Faltam ${p.d} dias, ${p.h} horas, ${p.m} minutos e ${p.s} segundos`}>
      {itens.map(([u, v]) => (
        <span
          key={u}
          className={`inline-flex items-baseline rounded font-semibold leading-none ${pequeno ? "px-1 py-0.5 text-[11px]" : "px-1.5 py-1 text-xs"}`}
          style={{ background: samkhyaTokens.ouro, color: samkhyaTokens.footerTexto }}
        >
          {dd(v)}
          <span className="ml-0.5 text-[9px] font-normal opacity-90">{u}</span>
        </span>
      ))}
    </span>
  );
};
export default Relogio;
