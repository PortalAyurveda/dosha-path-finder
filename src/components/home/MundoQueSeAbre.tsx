import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

const C = {
  primary: "#352F54",
  muted: "#7C7189",
  border: "#EDE8F5",
  kaphaSoft: "#DCF5E4",
  kaphaInk: "#1F7A3A",
};
const SERIF = "'Roboto Serif', serif";
const SANS = "'DM Sans', sans-serif";
const LEAF = "4px 24px 4px 24px";

type Stats = {
  aulas: number | null;
  aulas_30d: number | null;
  artigos: number | null;
  artigos_30d: number | null;
  receitas: number | null;
  receitas_30d: number | null;
  testes: number | null;
};

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : Number(n).toLocaleString("pt-BR");

// easeOutCubic
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const isInViewport = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const h = window.innerHeight || document.documentElement.clientHeight;
  const w = window.innerWidth || document.documentElement.clientWidth;
  return rect.bottom > 0 && rect.right > 0 && rect.top < h && rect.left < w;
};

const useCountUp = (
  target: number | null | undefined,
  run: boolean,
  forceFinal: boolean,
  duration = 1200,
) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (target == null) {
      setVal(0);
      return;
    }

    const final = Math.max(0, Number(target) || 0);

    if (final === 0) {
      setVal(0);
      return;
    }

    if (forceFinal) {
      setVal(final);
      return;
    }

    if (!run) {
      setVal((current) => (current > 0 ? current : 1));
      return;
    }

    const startedAt = performance.now();
    let raf = 0;
    let hardFallback = 0;
    let active = true;

    const finish = () => {
      if (!active) return;
      setVal(final);
    };

    const step = (now: number) => {
      if (!active) return;
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));

      if (progress >= 1) {
        finish();
        return;
      }

      setVal(Math.max(1, Math.round(final * ease(progress))));
      raf = requestAnimationFrame(step);
    };

    setVal(1);
    raf = requestAnimationFrame(step);
    hardFallback = window.setTimeout(finish, 3000);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(hardFallback);
    };
  }, [run, target, forceFinal, duration]);

  return val;
};

const NumberBlock = ({
  value,
  label,
  delta,
  run,
  forceFinal,
}: {
  value: number | null | undefined;
  label: string;
  delta: number | null | undefined;
  run: boolean;
  forceFinal: boolean;
}) => {
  const n = useCountUp(value, run, forceFinal);
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <span
        className="text-[34px] md:text-[42px] leading-none font-bold tabular-nums"
        style={{ color: C.primary, fontFamily: SERIF }}
      >
        {fmt(n)}
      </span>
      <span
        className="text-[11px] md:text-xs mt-1 uppercase tracking-wider font-semibold"
        style={{ color: C.muted }}
      >
        {label}
      </span>
      {delta != null && delta > 0 && (
        <span
          className="mt-1.5 inline-flex items-center px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: C.kaphaSoft,
            color: C.kaphaInk,
            borderRadius: "2px 10px 2px 10px",
          }}
        >
          +{fmt(delta)} este mês
        </span>
      )}
    </div>
  );
};

const MundoQueSeAbre = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["acervo-stats"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("acervo_stats");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row ?? null) as Stats | null;
    },
    staleTime: 60 * 60 * 1000,
  });

  const [visible, setVisible] = useState(false);
  const [forceFinal, setForceFinal] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dataReady = !isLoading && !!data;

  useEffect(() => {
    if (!dataReady) {
      setForceFinal(false);
      return;
    }

    const checkVisibility = () => {
      if (ref.current && isInViewport(ref.current)) setVisible(true);
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);

    const fallback = window.setTimeout(() => {
      if (ref.current && isInViewport(ref.current)) {
        setVisible(true);
        setForceFinal(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      window.clearTimeout(fallback);
    };
  }, [dataReady]);

  if (error) return null;

  return (
    <div
      ref={ref}
      className="w-full max-w-xl mx-auto bg-card/80 backdrop-blur-sm border shadow-lg px-5 md:px-6 py-3 md:py-4 flex flex-col gap-3"
      style={{ borderRadius: LEAF, borderColor: C.border, fontFamily: SANS }}
    >
      {isLoading || !data ? (
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 md:gap-4 items-start">
          <NumberBlock value={data.aulas} label="aulas" delta={data.aulas_30d} run={visible && dataReady} forceFinal={forceFinal} />
          <NumberBlock value={data.artigos} label="artigos" delta={data.artigos_30d} run={visible && dataReady} forceFinal={forceFinal} />
          <NumberBlock value={data.receitas} label="receitas" delta={data.receitas_30d} run={visible && dataReady} forceFinal={forceFinal} />
        </div>
      )}

      <div
        className="flex items-start gap-2 px-3 pt-2 border-t"
        style={{ borderColor: C.border }}
      >
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.primary }} />
        <p
          className="text-[13px] leading-snug font-semibold"
          style={{ color: C.primary, fontFamily: SERIF }}
        >
          E a Akasha — a inteligência que estudou tudo isso e está pronta para te guiar durante toda a jornada.
        </p>
      </div>
    </div>
  );
};


export default MundoQueSeAbre;
