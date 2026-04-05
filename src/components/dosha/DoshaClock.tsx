interface DoshaClockProps {
  variant?: "neutral" | "vata" | "pitta" | "kapha";
  centerLabel?: string;
  centerValue?: string;
}

const gradients = {
  neutral: `conic-gradient(
    from 330deg,
    #FF7676 0deg 60deg,
    #6B8AFF 60deg 120deg,
    #4ADE80 120deg 180deg,
    #FF7676 180deg 240deg,
    #6B8AFF 240deg 300deg,
    #4ADE80 300deg 360deg
  )`,
  vata: `conic-gradient(
    from 330deg,
    rgba(255, 118, 118, 0.15) 0deg 60deg,
    #6B8AFF 60deg 120deg,
    rgba(74, 222, 128, 0.15) 120deg 180deg,
    rgba(255, 118, 118, 0.15) 180deg 240deg,
    #6B8AFF 240deg 300deg,
    rgba(74, 222, 128, 0.15) 300deg 360deg
  )`,
  pitta: `conic-gradient(
    from 330deg,
    #FF7676 0deg 60deg,
    rgba(107, 138, 255, 0.15) 60deg 120deg,
    rgba(74, 222, 128, 0.15) 120deg 180deg,
    #FF7676 180deg 240deg,
    rgba(107, 138, 255, 0.15) 240deg 300deg,
    rgba(74, 222, 128, 0.15) 300deg 360deg
  )`,
  kapha: `conic-gradient(
    from 330deg,
    rgba(255, 118, 118, 0.15) 0deg 60deg,
    rgba(107, 138, 255, 0.15) 60deg 120deg,
    #4ADE80 120deg 180deg,
    rgba(255, 118, 118, 0.15) 180deg 240deg,
    rgba(107, 138, 255, 0.15) 240deg 300deg,
    #4ADE80 300deg 360deg
  )`,
};

// Which hour markers are highlighted per variant
const highlightedMarkers: Record<string, string[]> = {
  neutral: [],
  vata: ["14h", "18h", "02h", "06h"],
  pitta: ["12h", "14h", "22h", "00h", "02h", "10h"],
  kapha: ["18h", "22h", "06h", "10h"],
};

// Which dosha labels are highlighted per variant
const highlightedLabels: Record<string, string[]> = {
  neutral: ["Pitta", "Vata", "Kapha"],
  vata: ["Vata"],
  pitta: ["Pitta"],
  kapha: ["Kapha"],
};

const markers = [
  { label: "12h", className: "top-[-10px] left-1/2 -translate-x-1/2" },
  { label: "14h", className: "top-[7%] right-[22%] translate-x-1/2 -translate-y-1/2" },
  { label: "18h", className: "top-1/2 right-[-25px] -translate-y-1/2" },
  { label: "22h", className: "bottom-[7%] right-[22%] translate-x-1/2 translate-y-1/2" },
  { label: "00h", className: "bottom-[-10px] left-1/2 -translate-x-1/2" },
  { label: "02h", className: "bottom-[7%] left-[22%] -translate-x-1/2 translate-y-1/2" },
  { label: "06h", className: "top-1/2 left-[-25px] -translate-y-1/2" },
  { label: "10h", className: "top-[7%] left-[22%] -translate-x-1/2 -translate-y-1/2" },
];

const doshaLabels = [
  { label: "Pitta", className: "top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { label: "Vata", className: "top-[35%] left-[80%] -translate-x-1/2 -translate-y-1/2" },
  { label: "Kapha", className: "top-[65%] left-[80%] -translate-x-1/2 -translate-y-1/2" },
  { label: "Pitta", className: "top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { label: "Vata", className: "top-[65%] left-[20%] -translate-x-1/2 -translate-y-1/2" },
  { label: "Kapha", className: "top-[35%] left-[20%] -translate-x-1/2 -translate-y-1/2" },
];

const markerHighlightBorder: Record<string, string> = {
  vata: "border-[1.5px] border-vata",
  pitta: "border-[1.5px] border-pitta",
  kapha: "border-[1.5px] border-kapha",
};

const DoshaClock = ({ variant = "neutral", centerLabel = "Ciclo", centerValue = "24h" }: DoshaClockProps) => {
  const highlighted = highlightedMarkers[variant];
  const highlightedDoshas = highlightedLabels[variant];

  return (
    <div className="relative w-full max-w-[440px] aspect-square mx-auto">
      {/* Hour markers */}
      {markers.map((m) => {
        const isHighlighted = variant === "neutral" || highlighted.includes(m.label);
        return (
          <div
            key={m.label}
            className={`absolute font-sans font-bold text-primary bg-white px-2 py-0.5 rounded-md text-xs z-20 shadow-sm ${m.className} ${
              isHighlighted
                ? (variant !== "neutral" ? markerHighlightBorder[variant] : "")
                : "opacity-40 grayscale"
            }`}
          >
            {m.label}
          </div>
        );
      })}

      {/* Conic gradient circle */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center border-4 border-white relative"
        style={{
          background: gradients[variant],
          boxShadow: "0 20px 40px -10px hsla(var(--primary), 0.2)",
        }}
      >
        {/* Glass overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, transparent 30%, hsla(var(--primary), 0.05) 100%)" }}
        />

        {/* Dosha labels */}
        {doshaLabels.map((dl, i) => {
          const isHighlighted = highlightedDoshas.includes(dl.label);
          return (
            <div
              key={i}
              className={`absolute font-sans font-extrabold uppercase tracking-wide z-[15] ${dl.className} ${
                isHighlighted
                  ? "text-white text-base drop-shadow-md"
                  : "text-white/60 text-xs"
              }`}
            >
              {dl.label}
            </div>
          );
        })}

        {/* Center */}
        <div className="w-[46%] h-[46%] bg-surface-sun rounded-full flex flex-col items-center justify-center text-center z-10 border-2 border-white shadow-inner">
          <span className="font-sans text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
            {centerLabel}
          </span>
          <span className="font-serif italic font-bold text-primary text-4xl tracking-tighter">
            {centerValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoshaClock;
