import { ReactNode } from "react";

interface DoshaSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

const DoshaSection = ({ icon, title, children }: DoshaSectionProps) => {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <h2 className="font-serif text-2xl md:text-3xl font-bold italic text-primary mb-6">
        {icon} {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
};

export default DoshaSection;
