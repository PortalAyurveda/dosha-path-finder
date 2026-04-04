interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  centered?: boolean;
  as?: "h1" | "h2" | "h3";
}

const SectionTitle = ({ children, subtitle, centered = true, as: Tag = "h2" }: SectionTitleProps) => {
  return (
    <div className={`mb-8 md:mb-12 ${centered ? "text-center" : "text-left"}`}>
      <Tag>{children}</Tag>
      {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
