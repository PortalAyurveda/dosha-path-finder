import { useCallback, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { formacaoData } from "@/data/courses/formacao";
import { useHeaderCta } from "@/contexts/HeaderCtaContext";
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
  const { setCta } = useHeaderCta();
  const heroCtaRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const node = heroCtaRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCta(null);
        } else {
          setCta({
            label: data.hero.ctaText,
            mobileLabel: "Inscrever-se",
            className:
              "inline-flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs uppercase tracking-wide px-4 sm:px-6 py-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.03] rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm text-white whitespace-nowrap",
            style: { background: "#FF7676", color: "#FFFFFF" },
            onClick: () => {
              // eslint-disable-next-line no-console
              console.log("[formacao-cta]", { origin: "header", ts: Date.now(), status: "em-breve" });
              const target = document.getElementById("investimento");
              if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
            },
          });
        }
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setCta(null);
    };
  }, [setCta, data.hero.ctaText]);

  return (
    <div className="bg-white">
      <Helmet>
        <title>{data.meta.title}</title>
        <meta name="description" content={data.meta.description} />
        <meta property="og:title" content={data.meta.title} />
        <meta property="og:description" content={data.meta.description} />
        <meta property="og:image" content={data.branding.bulletSvg} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://dosha-path-finder.lovable.app/curso/formacao" />
      </Helmet>

      <main>
        <FormacaoHero data={data.hero} branding={data.branding} onCtaClick={handleEmBreve("hero")} ctaRef={heroCtaRef} />
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
