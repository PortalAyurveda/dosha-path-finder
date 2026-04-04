interface DoshaHeroBannerProps {
  dosha: "vata" | "pitta" | "kapha";
  emoji: string;
  title: string;
  elements: string;
  subtitle: string;
  description: string;
  badges: string[];
}

const doshaGradients = {
  vata: "from-vata/20 to-vata/5",
  pitta: "from-pitta/20 to-pitta/5",
  kapha: "from-kapha/20 to-kapha/5",
};

const doshaBorder = {
  vata: "border-vata/40",
  pitta: "border-pitta/40",
  kapha: "border-kapha/40",
};

const doshaBadge = {
  vata: "bg-vata/20 text-vata",
  pitta: "bg-pitta/20 text-pitta",
  kapha: "bg-kapha/20 text-kapha",
};

const DoshaHeroBanner = ({ dosha, emoji, title, elements, subtitle, description, badges }: DoshaHeroBannerProps) => {
  return (
    <section className={`bg-gradient-to-b ${doshaGradients[dosha]} border-b ${doshaBorder[dosha]}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">{elements}</p>
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        <h1 className="text-4xl md:text-6xl font-serif font-bold italic text-primary mb-6">
          {title} {emoji}
        </h1>
        <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex justify-center gap-3">
          {badges.map((b) => (
            <span key={b} className={`px-4 py-1.5 rounded-full text-sm font-medium ${doshaBadge[dosha]}`}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoshaHeroBanner;
