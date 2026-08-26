import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { rotinasData } from "@/data/courses/rotinas";
import CourseHero from "@/components/course/CourseHero";
import ProblemSection from "@/components/course/ProblemSection";
import OpportunitySection from "@/components/course/OpportunitySection";
import SolutionSection from "@/components/course/SolutionSection";
import ModulesSection from "@/components/course/ModulesSection";
import PricingSection from "@/components/course/PricingSection";
import TestimonialsSection from "@/components/course/TestimonialsSection";
import AudienceSection from "@/components/course/AudienceSection";
import ProfessorSection from "@/components/course/ProfessorSection";
import FinalCTASection from "@/components/course/FinalCTASection";

const Rotinas = () => {
  const data = rotinasData;
  const navigate = useNavigate();
  const { user, isAnonymous } = useUser();

  const handleCtaClick = useCallback(
    (origin: string) => async () => {
      // eslint-disable-next-line no-console
      console.log("[course-cta]", { course: data.meta.slug, origin, ts: Date.now() });
      if (!user || isAnonymous) {
        navigate(`/entrar?redirect=/curso/rotinas`);
        return;
      }
      try {
        const { data: resp, error } = await supabase.functions.invoke("create-cartao-curso", {
          body: { curso_slug: data.meta.slug },
        });
        if (error) throw error;
        if (resp?.ja_matriculado) {
          navigate("/escola");
          return;
        }
        if (resp?.checkout_url) {
          window.location.href = resp.checkout_url;
          return;
        }
        if (resp?.error) throw new Error(resp.error);
        throw new Error("Resposta inesperada do servidor");
      } catch (e) {
        const msg =
          (e as { message?: string; error?: string })?.message ??
          (e as { error?: string })?.error ??
          "Não conseguimos processar agora. Tente de novo em instantes.";
        toast({ title: "Ops", description: String(msg), variant: "destructive" });
      }
    },
    [data.meta.slug, user, isAnonymous, navigate],
  );

  return (
    <div className="bg-white">
      <Helmet>
        <title>{data.meta.title}</title>
        <meta name="description" content={data.meta.description} />
        <meta property="og:title" content={data.meta.title} />
        <meta property="og:description" content={data.meta.description} />
        <meta property="og:image" content={data.branding.logo} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main>
        <CourseHero
          data={data.hero}
          branding={data.branding}
          onCtaClick={handleCtaClick("hero")}
          heroImage="https://api.portalayurveda.com/storage/v1/object/public/portal_images/cursos/484ad355-42ec-42af-b696-8d0282a43dd1/1782844024946-capa-rotina-site.webp"
        />
        <ProblemSection data={data.problem} />
        {data.opportunity && <OpportunitySection data={data.opportunity} branding={data.branding} />}
        <SolutionSection data={data.solution} branding={data.branding} />
        <ModulesSection data={data.modules} branding={data.branding} />
        <div id="pricing">
          <PricingSection
            data={data.pricing}
            branding={data.branding}
            bonus={data.bonus}
            onCtaClick={handleCtaClick("pricing")}
          />
        </div>
        <TestimonialsSection testimonials={data.testimonials} branding={data.branding} />
        <AudienceSection data={data.audience} branding={data.branding} />
        <ProfessorSection data={data.professor} branding={data.branding} />
        <FinalCTASection
          data={data.finalCta}
          branding={data.branding}
          onCtaClick={handleCtaClick("final")}
        />
      </main>
    </div>
  );
};

export default Rotinas;
