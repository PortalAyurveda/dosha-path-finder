import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_URL =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg";
const BANNER_URL_MOBILE =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/bananer-smk-portal-mobile.jpg?v=2";

const PURPLE = "#352F54";

const SamkhyaCTA = ({ className = "" }: { className?: string }) => (
  <Button
    asChild
    className={`rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm px-8 py-6 text-base font-bold text-white shadow-lg transition-all hover:opacity-90 ${className}`}
    style={{ backgroundColor: PURPLE }}
  >
    <a href="https://lojasamkhya.com.br" target="_blank" rel="noopener noreferrer">
      Acessar Loja Samkhya
      <ExternalLink className="ml-2 h-4 w-4" />
    </a>
  </Button>
);

const SamkhyaBanner = () => {
  return (
    <section className="relative overflow-hidden border-t border-secondary/20">
      {/* Background image — mobile (positioned to reveal the drawing) */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover md:hidden"
        style={{ backgroundImage: `url(${BANNER_URL_MOBILE})`, backgroundPosition: "center 30%" }}
        aria-hidden
      />
      {/* Background image — desktop */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${BANNER_URL})` }}
        aria-hidden
      />
      {/* Subtle wash to keep text legible without hiding the elephant on the right (desktop only) */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,247,232,0.85) 0%, rgba(255,247,232,0.55) 38%, rgba(255,247,232,0) 60%)",
        }}
        aria-hidden
      />

      {/* DESKTOP layout */}
      <div className="relative hidden md:block max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 min-h-[360px]">
        <div className="grid grid-cols-12 gap-6 items-center">
          {/* Left: text shifted toward center */}
          <div className="col-span-7 lg:col-span-6 lg:pl-24 xl:pl-32">
            <h3 className="mb-3">Leve o Ayurveda para a sua rotina</h3>
            <p className="text-foreground/80">
              Conheça as fórmulas e produtos exclusivos da Samkhya — desenvolvidos com base nos textos clássicos do Ayurveda.
            </p>
          </div>

          {/* Right: CTA floats above the elephant (without covering it) */}
          <div className="col-span-5 lg:col-span-6 flex justify-center lg:justify-end lg:pr-32 -mt-24 lg:-mt-32">
            <SamkhyaCTA />
          </div>
        </div>
      </div>

      {/* MOBILE layout */}
      <div
        className="relative md:hidden px-4 sm:px-6 pt-10 pb-8 flex flex-col justify-between min-h-[520px] gap-6"
        style={{ backgroundPosition: "center 20%" }}
      >
        <div>
          <h3 className="mb-3">Leve o Ayurveda para a sua rotina</h3>
          <p className="text-foreground/80">
            Conheça as fórmulas e produtos exclusivos da Samkhya — desenvolvidos com base nos textos clássicos do Ayurveda.
          </p>
        </div>
        <div className="flex justify-center">
          <SamkhyaCTA />
        </div>
      </div>
    </section>
  );
};

export default SamkhyaBanner;
