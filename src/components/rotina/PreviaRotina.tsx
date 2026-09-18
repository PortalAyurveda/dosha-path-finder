import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Lock, LockOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import NuggetIscaDialog from "@/components/rotina/NuggetIscaDialog";
import type { Nugget } from "@/components/rotina/NuggetDetalhe";

type Linha = { slot: string; nugget_id: string | null };

interface PreviaRotinaProps {
  linhas: Linha[] | undefined;
  temTeste: boolean;
  nuggetAlvo: Nugget | null;
  abrirItem: boolean;
  dataLabel: string;
  doshaNome: string | null;
}

const SLOTS = [
  { slot: "rotina_manha", label: "Ritual da manhã", hora: "6h", ate: 7 },
  { slot: "cafe_manha", label: "Café da manhã", hora: "7h", ate: 10 },
  { slot: "lanche_manha", label: "Lanche da manhã", hora: "10h", ate: 12 },
  { slot: "almoco", label: "Almoço", hora: "12h", ate: 15 },
  { slot: "lanche_tarde", label: "Lanche da tarde", hora: "16h", ate: 18 },
  { slot: "jantar", label: "Jantar", hora: "19h", ate: 21 },
  { slot: "tonico_noite", label: "Tônico da noite", hora: "21h", ate: 24 },
  { slot: "bonus_diario", label: "Bônus do dia", hora: "", ate: 99 },
];

const slotDaHora = (h: number) =>
  SLOTS.find((s) => s.slot !== "bonus_diario" && h < s.ate)?.slot ?? "tonico_noite";

const PRIMARY = "#352F54";
const VERDE = "#15803D";
const SALMAO = "#E8806A";

const PreviaRotina = ({ linhas, temTeste, nuggetAlvo, abrirItem, dataLabel, doshaNome }: PreviaRotinaProps) => {
  const { user, isAnonymous, profile, doshaResult } = useUser();
  const navigate = useNavigate();
  const planoRef = useRef<HTMLDivElement | null>(null);
  const [aberto, setAberto] = useState<Nugget | null>(null);
  const [carregando, setCarregando] = useState(false);

  const registrar = (evento: string, plano?: string) => {
    void (supabase.from("assinar_eventos" as any) as any)
      .insert({
        evento,
        plano: plano ?? null,
        user_id: user?.id ?? null,
        origem: "previa_rotina",
        pagina: window.location.pathname + window.location.search,
      })
      .then(undefined, () => {});
  };

  useEffect(() => {
    registrar("visita");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (abrirItem && nuggetAlvo) setAberto(nuggetAlvo);
  }, [abrirItem, nuggetAlvo]);

  const ids = useMemo(
    () => (linhas ?? []).map((l) => l.nugget_id).filter(Boolean) as string[],
    [linhas],
  );

  const { data: nuggets } = useQuery({
    queryKey: ["previa-rotina-nuggets", ids.join(",")],
    enabled: ids.length > 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rotina_nuggets")
        .select("id, slug, titulo, icone_lucide, imagem_url, video_id, video_timestamp, vata, pitta, kapha, nugget_json")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as Nugget[];
    },
  });

  const porId = useMemo(() => new Map((nuggets ?? []).map((n) => [n.id, n])), [nuggets]);
  const slotAgora = slotDaHora(new Date().getHours());

  const assinar = async () => {
    registrar("clique_plano", "rotina");
    if (!user || isAnonymous) {
      const claim = doshaResult?.idPublico || localStorage.getItem("activeDoshaId");
      navigate(`/entrar?${claim ? `claim=${claim}&` : ""}redirect=${encodeURIComponent("/assinar?plano=rotina")}`);
      return;
    }
    setCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plano: "rotina", user_id: user.id, email: (profile as any)?.email ?? user.email },
      });
      if (error) throw error;
      if (data?.url) {
        registrar("checkout", "rotina");
        window.location.href = data.url;
        return;
      }
      throw new Error("sem url");
    } catch {
      navigate("/assinar?plano=rotina");
    } finally {
      setCarregando(false);
    }
  };

  const irParaPlano = () => planoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  if (!temTeste) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center rounded-3xl border border-border bg-card p-8">
          <h1 className="font-serif font-bold text-2xl" style={{ color: PRIMARY }}>
            Sua rotina começa pelo teste
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            O teste de dosha leva 5 minutos e é ele que monta a sua semana.
          </p>
          <button
            type="button"
            onClick={() => navigate("/teste-de-dosha")}
            className="mt-6 w-full min-h-[56px] rounded-full font-semibold text-white"
            style={{ background: SALMAO }}
          >
            Fazer meu teste grátis
          </button>
        </div>
      </div>
    );
  }

  if (!linhas) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const itens = SLOTS.map((s) => {
    const linha = linhas.find((l) => l.slot === s.slot);
    const nugget = linha?.nugget_id ? porId.get(linha.nugget_id) : undefined;
    return nugget ? { ...s, nugget } : null;
  }).filter(Boolean) as (typeof SLOTS[number] & { nugget: Nugget })[];

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground capitalize">{dataLabel}</p>
        <h1 className="font-serif font-bold text-2xl md:text-3xl" style={{ color: PRIMARY }}>
          Sua rotina de hoje
        </h1>
        {doshaNome ? (
          <p className="text-sm text-muted-foreground">
            Montada pro seu <span className="font-semibold capitalize">{doshaNome}</span>
          </p>
        ) : null}
      </div>

      {itens.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Sua rotina de hoje está sendo montada. Volte em alguns minutos.
        </div>
      ) : (
        <div className="space-y-2">
          {itens.map((it) => {
            const abertoAgora = it.slot === slotAgora;
            return abertoAgora ? (
              <button
                key={it.slot}
                type="button"
                onClick={() => setAberto(it.nugget)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left"
                style={{ borderColor: SALMAO }}
              >
                {it.nugget.imagem_url ? (
                  <img src={it.nugget.imagem_url} alt="" className="h-12 w-12 rounded-xl object-cover" loading="lazy" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: SALMAO }}>
                    {it.label} · agora
                  </p>
                  <p className="truncate text-sm font-semibold" style={{ color: PRIMARY }}>{it.nugget.titulo}</p>
                  <p className="text-xs text-muted-foreground">Receita completa, aberta pra você</p>
                </div>
                <LockOpen className="h-4 w-4 shrink-0" style={{ color: SALMAO }} />
              </button>
            ) : (
              <button
                key={it.slot}
                type="button"
                onClick={irParaPlano}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left opacity-80"
              >
                {it.nugget.imagem_url ? (
                  <img src={it.nugget.imagem_url} alt="" className="h-12 w-12 rounded-xl object-cover" loading="lazy" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {it.label}{it.hora ? ` · ${it.hora}` : ""}
                  </p>
                  <p className="truncate text-sm font-semibold" style={{ color: PRIMARY }}>{it.nugget.titulo}</p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      )}

      <div ref={planoRef} className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif font-bold text-xl" style={{ color: PRIMARY }}>
            Minha Rotina
          </h2>
          <p className="font-serif font-bold text-xl" style={{ color: VERDE }}>
            R$ 30/mês
          </p>
        </div>
        <ul className="space-y-2 text-sm" style={{ color: PRIMARY }}>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: VERDE }} />
            Os 8 momentos do dia, os 7 dias da semana
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: VERDE }} />
            Montada pro seu dosha, com preparo e porquê de cada item
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: VERDE }} />
            Cancele quando quiser
          </li>
        </ul>
        <button
          type="button"
          onClick={assinar}
          disabled={carregando}
          className="w-full min-h-[56px] rounded-full font-semibold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
          style={{ background: SALMAO }}
        >
          {carregando ? "Abrindo o pagamento…" : "Liberar minha rotina"}
          {!carregando && <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => navigate("/assinar?ir=planos")}
          className="mt-3 w-full text-center text-sm underline underline-offset-4 text-muted-foreground"
        >
          Ver todos os planos
        </button>
      </div>

      {aberto ? (
        <NuggetIscaDialog nugget={aberto} open={!!aberto} onOpenChange={(o) => { if (!o) setAberto(null); }} />
      ) : null}
    </div>
  );
};

export default PreviaRotina;
