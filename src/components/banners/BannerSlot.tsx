import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

interface BannerSlotProps {
  slot: string;
  className?: string;
}

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

const BannerSlot = ({ slot, className }: BannerSlotProps) => {
  const { user, profile, doshaResult } = useUser();

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

  const { data: banners } = useQuery({
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
    // Acesso
    if (temAcessoRotina(profile)) set.add("tem_rotina");
    else set.add("sem_rotina");
    if (!profile?.is_premium) set.add("nao_premium");
    // Vínculo
    if (user) set.add("tem_conta");
    else set.add("sem_conta");
    // Dosha
    const dt = normalizarDoshaTag(doshaResult?.doshaprincipal);
    if (dt) set.add(dt);
    // Agni
    const at = agniTag(agniPrincipal);
    if (at) set.add(at);
    return set;
  }, [user, profile, doshaResult, agniPrincipal]);

  const escolhido = useMemo(() => {
    if (!banners || banners.length === 0) return null;
    return banners.find((b) => {
      const tags = (b.tags ?? []) as string[];
      return tags.every((t) => userTags.has(t));
    }) ?? null;
  }, [banners, userTags]);

  const cleanHtml = useMemo(() => {
    if (!escolhido?.html) return "";
    return DOMPurify.sanitize(escolhido.html, {
      ADD_ATTR: ["target", "class"],
      ADD_TAGS: ["svg", "path", "circle", "rect", "g", "line", "polyline", "polygon", "defs", "use"],
    });
  }, [escolhido]);

  if (!escolhido) return null;

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: cleanHtml }} />
  );
};

export default BannerSlot;
