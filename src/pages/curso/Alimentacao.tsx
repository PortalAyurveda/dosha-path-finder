import { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { alimentacaoData } from "@/data/courses/alimentacao";
import CourseHero from "@/components/course/CourseHero";
import ProblemSection from "@/components/course/ProblemSection";
import SolutionSection from "@/components/course/SolutionSection";
import ModulesSection from "@/components/course/ModulesSection";
import BonusSection from "@/components/course/BonusSection";
import PricingSection from "@/components/course/PricingSection";
import TestimonialsSection from "@/components/course/TestimonialsSection";
import AudienceSection from "@/components/course/AudienceSection";
import ProfessorSection from "@/components/course/ProfessorSection";
import FinalCTASection from "@/components/course/FinalCTASection";
import CourseFooter from "@/components/course/CourseFooter";

const Alimentacao = () => {
  const data = alimentacaoData;

  const handleCtaClick = useCallback(
    (origin: string) => () => {
      // eslint-disable-next-line no-console
      console.log("[course-cta]", { course: data.meta.slug, origin, ts: Date.now() });
      if (data.checkoutUrl && data.checkoutUrl !== "#checkout") {
        window.location.href = data.checkoutUrl;
      } else {
        const target = document.getElementById("pricing");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [data.checkoutUrl, data.meta.slug],
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
        />
        <ProblemSection data={data.problem} />
        <SolutionSection data={data.solution} branding={data.branding} />
        <ModulesSection data={data.modules} branding={data.branding} />
        <BonusSection data={data.bonus} branding={data.branding} />
        <div id="pricing">
          <PricingSection
            data={data.pricing}
            branding={data.branding}
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
        <CourseFooter data={data.footer} branding={data.branding} />
      </main>
    </div>
  );
};

export default Alimentacao;
