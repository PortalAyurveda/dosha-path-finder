import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_URL =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg";
const BANNER_URL_MOBILE =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/bananer-smk-portal-mobile.jpg";

const SamkhyaBanner = () => {
  return (
    <section className="relative overflow-hidden border-t border-secondary/20">
      {/* Background image — mobile */}
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center md:hidden"
        style={{ backgroundImage: `url(${BANNER_URL_MOBILE})` }}
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

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 min-h-[260px] md:min-h-[320px]">
        {/* Desktop layout: text + CTA stacked on the left */}
        <div className="hidden md:flex max-w-md md:max-w-lg flex-col gap-5">
          <div>
            <h3 className="mb-3">Leve o Ayurveda para a sua rotina</h3>
            <p className="text-foreground/80">
              Conheça as fórmulas e produtos exclusivos da Samkhya — desenvolvidos com base nos textos clássicos do Ayurveda.
            </p>
          </div>
          <div>
            <Button
              variant="outline"
              className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm px-8 py-6 text-base font-bold border-2 border-secondary text-secondary bg-card/80 backdrop-blur-sm hover:bg-secondary hover:text-white transition-all"
              asChild
            >
              <a href="https://lojasamkhya.com.br" target="_blank" rel="noopener noreferrer">
                Acessar Loja Samkhya
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Mobile layout: text on top (empty space area), CTA pushed to bottom (above the elephant) */}
        <div className="md:hidden flex flex-col justify-between min-h-[420px] gap-6">
          <div>
            <h3 className="mb-3">Leve o Ayurveda para a sua rotina</h3>
            <p className="text-foreground/80">
              Conheça as fórmulas e produtos exclusivos da Samkhya — desenvolvidos com base nos textos clássicos do Ayurveda.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm px-8 py-6 text-base font-bold border-2 border-secondary text-secondary bg-card/90 backdrop-blur-sm hover:bg-secondary hover:text-white transition-all shadow-lg"
              asChild
            >
              <a href="https://lojasamkhya.com.br" target="_blank" rel="noopener noreferrer">
                Acessar Loja Samkhya
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SamkhyaBanner;
