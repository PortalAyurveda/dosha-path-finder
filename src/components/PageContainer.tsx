import { Helmet } from "react-helmet-async";
import { ReactNode } from "react";

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const PageContainer = ({ title, description, children, className = "" }: PageContainerProps) => {
  return (
    <>
      <Helmet>
        <title>{title} — Portal Ayurveda</title>
        <meta name="description" content={description} />
      </Helmet>
      <main className={`w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 ${className}`}>
        {children}
      </main>
    </>
  );
};

export default PageContainer;
