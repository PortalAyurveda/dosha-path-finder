import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Webinar = lazy(() => import("./Webinar"));
const Aula = lazy(() => import("./Aula"));

type Kind = "loading" | "webinar" | "aula";

/**
 * /aula/:slug resolves to either:
 *  - a CMS webinar landing (aulas_webinar), or
 *  - the legacy live aula (aulas_ao_vivo) — fallback
 */
const AulaDispatcher = () => {
  const { slug } = useParams<{ slug: string }>();
  const [kind, setKind] = useState<Kind>("loading");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("aulas_webinar")
        .select("id")
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();
      if (cancelled) return;
      setKind(data ? "webinar" : "aula");
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fallback = (
    <div className="min-h-screen w-full bg-background py-12 px-4">
      <Skeleton className="mx-auto max-w-[560px] h-[480px] rounded-3xl" />
    </div>
  );

  if (kind === "loading") return fallback;
  return (
    <Suspense fallback={fallback}>{kind === "webinar" ? <Webinar /> : <Aula />}</Suspense>
  );
};

export default AulaDispatcher;
