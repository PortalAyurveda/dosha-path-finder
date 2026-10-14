import { useEffect, useMemo, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { rpc, sanitizar } from "@/components/atividades/base";
import { useUser } from "@/contexts/UserContext";

type Props = {
  slot: string;
  refId?: string;
  alturaMinima?: number;
  fallback?: ReactNode;
  aoRefazerTeste?: () => void;
};

const BUCKETS_FOTO = ["linguas-leituras", "linguas-jornada", "atividades-arquivos"];

const SecoesSlot = ({ slot, refId = "", alturaMinima = 0, fallback = null, aoRefazerTeste }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const raiz = useRef<HTMLDivElement>(null);
  const { user, isAnonymous } = useUser();
  const logado = !!user && !isAnonymous;

  const { data: slotsAtivos, isLoading: carregandoSlots } = useQuery({
    queryKey: ["secoes-lugares-ativos", user?.id],
    queryFn: async () => {
      const d = await rpc("secoes_lugares_ativos", {});
      return Array.isArray(d) ? (d as string[]) : [];
    },
    enabled: logado,
    staleTime: 10 * 60 * 1000,
  });
  const temSecao = !!slotsAtivos?.includes(slot);

  const { data, isLoading } = useQuery({
    queryKey: ["secoes-html", slot, refId, user?.id],
    queryFn: () => rpc("secoes_html", { p_slot: slot, p_ref: refId || null }),
    enabled: logado && temSecao,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const html = useMemo(() => (typeof data === "string" && data.trim() ? sanitizar(data) : ""), [data]);

  useEffect(() => {
    const el = raiz.current;
    if (!el || !html) return;
    el.querySelectorAll<HTMLImageElement>("img[data-foto-bucket][data-foto-path]").forEach((img) => {
      const bucket = img.dataset.fotoBucket ?? "";
      const caminho = img.dataset.fotoPath ?? "";
      if (!BUCKETS_FOTO.includes(bucket) || !caminho) return;
      void supabase.storage
        .from(bucket)
        .createSignedUrl(caminho, 3600)
        .then(({ data: assinado }) => {
          if (assinado?.signedUrl) img.src = assinado.signedUrl;
        });
    });
  }, [html]);

  useEffect(() => {
    const el = raiz.current;
    const alvoId = decodeURIComponent(location.hash.slice(1));
    if (!el || !html || !alvoId) return;
    const destino = el.querySelector<HTMLElement>(`[id="${CSS.escape(alvoId)}"]`);
    if (!destino) return;
    if (destino instanceof HTMLDetailsElement) destino.open = true;
    destino.scrollIntoView({ block: "start" });
  }, [html, location.hash]);

  if (!logado) return <>{fallback}</>;
  if (carregandoSlots || (temSecao && isLoading)) {
    return alturaMinima > 0 ? <div style={{ minHeight: alturaMinima }} aria-busy="true" /> : <>{fallback}</>;
  }
  if (!html) return <>{fallback}</>;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const alvo = e.target as HTMLElement;
    const marcado = alvo.closest<HTMLElement>("[data-md-evento]");
    if (marcado) {
      const [evento, secao] = (marcado.dataset.mdEvento ?? "").split(":");
      if (evento && secao) void rpc("secao_evento", { p_slug: secao, p_evento: evento });
    }
    if (alvo.closest('[data-acao="refazer-teste"]')) {
      e.preventDefault();
      if (aoRefazerTeste) aoRefazerTeste();
      else navigate("/teste-de-dosha");
      return;
    }
    const a = alvo.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/")) {
      e.preventDefault();
      const cartao = a.closest<HTMLElement>("[id^='mod-']");
      if (cartao) {
        window.history.replaceState(window.history.state, "", `${location.pathname}${location.search}#${cartao.id}`);
      }
      navigate(href);
    }
  };

  return (
    <div ref={raiz} className="bloco-html" data-clarity-mask="true" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default SecoesSlot;