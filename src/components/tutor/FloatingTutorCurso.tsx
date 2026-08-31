import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import TutorChatBody, { TutorAvatar, type TutorCurso } from "@/components/tutor/TutorChatBody";

export const matchCursoEstudarSlug = (pathname: string): string | null => {
  const m = pathname.match(/^\/cursos\/([^/]+)\/estudar\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
};

const FloatingTutorCurso = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useUser();

  const slug = matchCursoEstudarSlug(location.pathname);
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    onFs();
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!slug) return;
    try {
      setEngaged(localStorage.getItem(`tutor_engaged_${slug}`) === "1");
    } catch {
      setEngaged(false);
    }
  }, [slug]);

  const markEngaged = useCallback(() => {
    setEngaged(true);
    if (!slug) return;
    try {
      localStorage.setItem(`tutor_engaged_${slug}`, "1");
    } catch {
      /* noop */
    }
  }, [slug]);

  const { data: curso } = useQuery({
    queryKey: ["tutor-curso", slug],
    enabled: !!slug && !!user,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data: c } = await supabase
        .from("cursos")
        .select("id,slug,titulo,card_logo_url,card_cor_primaria,card_cor_secundaria")
        .eq("slug", slug!)
        .maybeSingle();
      if (!c) return null;
      const { data: acesso } = await supabase.rpc("tem_acesso_curso", { p_curso_id: (c as any).id });
      if (!acesso) return null;
      return c as unknown as TutorCurso;
    },
  });

  if (!slug || !user || !curso) return null;
  if (fullscreen) return null;
  if (searchParams.get("tab") === "tutor") return null;

  const cor = curso.card_cor_primaria || "#352F54";

  return (
    <>
      <div
        className={`fixed z-[60] transition-all duration-200 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        } bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[560px] max-h-[640px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        role="dialog"
        aria-label={`Tutor do curso ${curso.titulo}`}
        aria-hidden={!open}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border"
          style={{ background: `${cor}0F` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <TutorAvatar curso={curso} className="w-8 h-8" />
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="font-serif text-sm font-bold truncate" style={{ color: cor }}>
                Tutor · {curso.titulo}
              </h3>
              <p className="text-[10px] truncate" style={{ color: curso.card_cor_secundaria || undefined }}>
                Especialista neste curso
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <TutorChatBody curso={curso} className="flex-1" onNavigate={() => setOpen(false)} />
      </div>

      <button
        onClick={() => {
          markEngaged();
          setOpen((o) => !o);
        }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border flex items-center justify-center hover:scale-105 transition-all overflow-hidden ${
          !open && !engaged ? "akasha-call" : ""
        }`}
        style={{ borderColor: `${cor}33`, boxShadow: `0 0 22px -4px ${cor}73` }}
        aria-label={open ? "Fechar tutor" : "Abrir tutor"}
      >
        {open ? (
          <X className="w-6 h-6" style={{ color: cor }} />
        ) : (
          <TutorAvatar curso={curso} className="w-full h-full" />
        )}
      </button>
    </>
  );
};

export default FloatingTutorCurso;
