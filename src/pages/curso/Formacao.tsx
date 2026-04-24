import { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { formacaoData } from "@/data/courses/formacao";
import FormacaoHero from "@/components/formacao/FormacaoHero";
import ParaQuemSection from "@/components/formacao/ParaQuemSection";
import ProblemaSection from "@/components/formacao/ProblemaSection";
import SolucaoSection from "@/components/formacao/SolucaoSection";
import ProgramaSection from "@/components/formacao/ProgramaSection";
import DiferenciaisSection from "@/components/formacao/DiferenciaisSection";
import ProfessorSection from "@/components/formacao/ProfessorSection";
import InvestimentoSection from "@/components/formacao/InvestimentoSection";
import FaqSection from "@/components/formacao/FaqSection";
import FinalCtaSection from "@/components/formacao/FinalCtaSection";

const Formacao = () => {
  const data = formacaoData;

  const handleEmBreve = useCallback(
    (origin: string) => () => {
      // eslint-disable-next-line no-console
      console.log("[formacao-cta]", { origin, ts: Date.now(), status: "em-breve" });
      const target = document.getElementById("investimento");
      if (target && origin !== "investimento") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  return (
    <div className="bg-white">
      <Helmet>
        <title>{data.meta.title}</title>
        <meta name="description" content={data.meta.description} />
        <meta property="og:title" content={data.meta.title} />
        <meta property="og:description" content={data.meta.description} />
        <meta property="og:image" content={data.branding.bulletSvg} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.portalayurveda.com/curso/formacao" />
      </Helmet>

      <main>
        <FormacaoHero data={data.hero} branding={data.branding} onCtaClick={handleEmBreve("hero")} />
        <ParaQuemSection data={data.paraQuem} branding={data.branding} />
        <ProblemaSection data={data.problema} branding={data.branding} />
        <SolucaoSection data={data.solucao} branding={data.branding} />
        <ProgramaSection data={data.programa} branding={data.branding} />
        <DiferenciaisSection
          data={data.diferenciais}
          branding={data.branding}
          onCtaClick={handleEmBreve("diferenciais")}
          ctaText="Quero garantir minha vaga"
        />
        <ProfessorSection data={data.professor} branding={data.branding} />
        <InvestimentoSection
          data={data.investimento}
          branding={data.branding}
          onCtaClick={handleEmBreve("investimento")}
          ctaText={data.hero.ctaText}
          ctaSubtext={data.hero.ctaSubtext}
        />
        <FaqSection data={data.faq} branding={data.branding} />
        <FinalCtaSection
          data={data.finalCta}
          branding={data.branding}
          onPrimary={handleEmBreve("final-primary")}
          onSecondary={handleEmBreve("final-secondary")}
        />
      </main>
    </div>
  );
};

export default Formacao;
