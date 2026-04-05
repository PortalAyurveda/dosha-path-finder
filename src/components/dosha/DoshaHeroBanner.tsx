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

const doshaSubtitle = {
  vata: "text-vata/70",
  pitta: "text-pitta/70",
  kapha: "text-kapha/70",
};

const DoshaHeroBanner = ({ dosha, emoji, title, elements, subtitle, description, badges }: DoshaHeroBannerProps) => {
  return (
    <section className={`bg-gradient-to-b ${doshaGradients[dosha]} border-b ${doshaBorder[dosha]}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
        <p className="text-sm font-medium text-muted-foreground mb-1">{elements}</p>
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        <h1 className="text-4xl md:text-6xl font-serif font-bold italic text-primary mb-2">
          {title} {emoji}
        </h1>
        <p className={`text-sm font-medium ${doshaSubtitle[dosha]} mb-6`}>
          {badges.join(" · ")}
        </p>
        <p className="text-base md:text-lg text-foreground max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
};

export default DoshaHeroBanner;
