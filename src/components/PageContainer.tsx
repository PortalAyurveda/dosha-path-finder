import { Helmet } from "react-helmet-async";
import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  noindex?: boolean;
}

const PageContainer = ({ title, description, children, className = "", noindex = false }: PageContainerProps) => {
  const fullTitle = `${title} — Portal Ayurveda`;
  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
      </Helmet>
      <main className={`w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 ${className}`}>
        {children}
      </main>
    </>
  );
};

export default PageContainer;
