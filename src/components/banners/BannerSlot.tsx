import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";


interface BannerSlotProps {
  slot: string;
  className?: string;
  fallback?: React.ReactNode;
  /** Altura reservada (px) enquanto o banner carrega — evita pulo de layout (CLS). */
  minHeight?: number;
  /** "diaria" (padrão): mesmo banner o dia todo. "pageview": sorteia a cada carregamento. */
  rotacao?: "diaria" | "pageview";
  /** Renderiza o fallback enquanto carrega (em vez de reservar espaço vazio). */
  fallbackWhileLoading?: boolean;
}

/** Altura típica medida de cada slot em mobile. */
const SLOT_MIN_HEIGHT: Record<string, number> = {
  biblioteca: 140,
  samkhya_home: 160,
  samkhya_hero: 105,
  blog_fim: 140,
  video: 140,
  video_fim: 140,
  meu_dosha_meio: 150,
  pesquisa_pos: 140,
  home_topo: 150,
  home_meio: 150,
};
const DEFAULT_MIN_HEIGHT = 140;



const PRIORIDADE: Record<string, number> = { Vata: 0, Pitta: 1, Kapha: 2 };

function normalizarDoshaTag(nome: string | null | undefined): string | null {
  if (!nome) return null;
  const partes = nome.split("-").map((s) => s.trim()).filter(Boolean);
  const doshas = partes.filter((p) => p in PRIORIDADE).sort((a, b) => PRIORIDADE[a] - PRIORIDADE[b]);
  if (doshas.length === 0) return null;
  return doshas.map((d) => d.toLowerCase()).join("-");
}

function temAcessoRotina(profile: any): boolean {
  if (!profile) return false;
  if (profile.is_premium === true) return true;
  const planosOk = ["rotina", "mensal", "anual"];
  if (
    profile.subscription_status === "active" &&
    planosOk.includes(profile.plano) &&
    (!profile.premium_until || new Date(profile.premium_until) > new Date())
  ) {
    return true;
  }
  return false;
}

function agniTag(agni: string | null | undefined): string | null {
  if (!agni) return null;
  const s = agni.toLowerCase();
  if (s.includes("irregular") || s.includes("inconstante")) return "agni_irregular";
  if (s.includes("forte") || s.includes("intensa")) return "agni_forte";
  if (s.includes("fraca") || s.includes("lenta")) return "agni_fraco";
  if (s.includes("constante") || s.includes("regular") || s.includes("boa")) return "agni_bom";
  return null;
}

const BannerSlot = ({ slot, className, fallback, minHeight, rotacao = "diaria", fallbackWhileLoading }: BannerSlotProps) => {
  const { user, profile, doshaResult } = useUser();

  const location = useLocation();
  const sorteioRef = useRef(Math.random());



  // Fetch agniPrincipal apart (não está no DoshaResult padrão)
  const { data: agniPrincipal } = useQuery({
    queryKey: ["banner-agni", doshaResult?.idPublico],
    queryFn: async () => {
      if (!doshaResult?.idPublico) return null;
      const { data } = await supabase
        .from("doshas_registros")
        .select("agniPrincipal")
        .eq("idPublico", doshaResult.idPublico)
        .maybeSingle();
      return data?.agniPrincipal ?? null;
    },
    enabled: !!doshaResult?.idPublico,
    staleTime: 10 * 60 * 1000,
  });

  const { data: banners, isLoading: bannersLoading } = useQuery({
    queryKey: ["banners-slot", slot],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("id, slot, html, tags, ordem, ativo")
        .eq("slot", slot)
        .eq("ativo", true)
        .order("ordem", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const userTags = useMemo(() => {
    const set = new Set<string>();
    // Sempre elegível
    set.add("todos");
    // Acesso
    if (temAcessoRotina(profile)) set.add("tem_rotina");
    else set.add("sem_rotina");
    if (!profile?.is_premium) set.add("nao_premium");
    // Vínculo
    if (user) set.add("tem_conta");
    else set.add("sem_conta");
    // Dosha
    const dt = normalizarDoshaTag(doshaResult?.doshaprincipal);
    if (dt) {
      set.add(dt);
      // Combo (ex "vata-pitta") também elegível aos banners de cada dosha individual
      if (dt.includes("-")) {
        dt.split("-").forEach((d) => d && set.add(d));
      }
    }
    // Agni
    const at = agniTag(agniPrincipal);
    if (at) set.add(at);
    return set;
  }, [user, profile, doshaResult, agniPrincipal]);

  const escolhido = useMemo(() => {
    if (!banners || banners.length === 0) return null;
    const elegiveis = banners.filter((b) => {
      const tags = (b.tags ?? []) as string[];
      return tags.every((t) => userTags.has(t));
    });
    if (elegiveis.length === 0) return null;
    if (elegiveis.length === 1) return elegiveis[0];
    if (rotacao === "pageview") {
      return elegiveis[Math.floor(sorteioRef.current * elegiveis.length)];
    }
    // Estável durante o dia, gira no dia seguinte: dia_do_ano % n
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return elegiveis[dayOfYear % elegiveis.length];
  }, [banners, userTags, rotacao]);


  const cleanHtml = useMemo(() => {
    if (!escolhido?.html) return "";
    return DOMPurify.sanitize(escolhido.html, {
      ADD_ATTR: ["target", "class"],
      ADD_TAGS: ["svg", "path", "circle", "rect", "g", "line", "polyline", "polygon", "defs", "use"],
    });
  }, [escolhido]);

  // Tag de dosha que motivou a escolha (se houver)
  const doshaTagEscolhido = useMemo(() => {
    const tags = (escolhido?.tags ?? []) as string[];
    return tags.find((t) => /^(vata|pitta|kapha)(-(vata|pitta|kapha))*$/.test(t)) ?? null;
  }, [escolhido]);

  const registrarEvento = (evento: "impressao" | "clique") => {
    if (!escolhido?.id) return;
    // fire-and-forget: nunca bloqueia UI/navegação
    void (supabase.from("banner_eventos" as any) as any)
      .insert({
        banner_id: escolhido.id,
        slot,
        evento,
        user_id: user?.id ?? null,
        dosha_tag: doshaTagEscolhido,
        pagina: location.pathname,
      })
      .then(undefined, () => {});
  };

  const impressaoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!escolhido?.id) return;
    if (impressaoRef.current === escolhido.id) return;
    impressaoRef.current = escolhido.id;
    registrarEvento("impressao");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escolhido?.id]);

  const alturaReservada = minHeight ?? SLOT_MIN_HEIGHT[slot] ?? DEFAULT_MIN_HEIGHT;

  // Enquanto o banner não chega, o espaço já fica reservado (evita CLS).
  if (bannersLoading) {
    if (fallbackWhileLoading) return <>{fallback ?? null}</>;
    return (
      <div className={className} aria-hidden="true">
        {/* filho vazio garante que o `[&:empty]:hidden` dos slots não esconda a reserva */}
        <span className="block" style={{ minHeight: alturaReservada }} />
      </div>
    );
  }

  // Slot vazio no banco: colapsa de vez (sem flash de espaço vazio).
  if (!escolhido) return <>{fallback ?? null}</>;

  return (
    <div
      className={className}
      onClick={() => registrarEvento("clique")}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};


export default BannerSlot;
