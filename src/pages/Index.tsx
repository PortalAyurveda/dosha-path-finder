import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/home/Hero";
import QuickAccessCards from "@/components/home/QuickAccessCards";
import SamkhyaBanner from "@/components/home/SamkhyaBanner";
import { useUser } from "@/contexts/UserContext";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Portal Ayurveda",
      url: "https://portalayurveda.com.br",
      description:
        "Descubra e cuide dos seus Doshas (Vata, Pitta e Kapha) por meio da medicina milenar. Teste de Dosha gratuito, receitas e mais de 900 aulas.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://portalayurveda.com.br/busca?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Portal Ayurveda",
      url: "https://portalayurveda.com.br",
      logo: "https://portalayurveda.com.br/logo.png",
      sameAs: [
        "https://www.instagram.com/portalayurveda",
        "https://www.youtube.com/@portalayurveda",
      ],
    },
  ],
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Portal Ayurveda: Seu guia completo para saúde e longevidade</title>
        <meta
          name="description"
          content="Descubra e cuide dos seus Doshas (Vata, Pitta e Kapha) por meio da medicina milenar. Teste de Dosha gratuito, receitas e mais de 900 aulas."
        />
        <link rel="canonical" href="https://portalayurveda.com.br/" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Hero />
      <QuickAccessCards />
      <SamkhyaBanner />
    </>
  );
};

export default Index;
