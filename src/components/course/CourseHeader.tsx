import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface CourseHeaderProps {
  courseLogo: string;
  courseColor: string;
  darkColor: string;
  ctaText: string;
  onCtaClick: () => void;
}

const CourseHeader = ({ courseLogo, courseColor, darkColor, ctaText, onCtaClick }: CourseHeaderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md shadow-lg"
      style={{ background: `${courseColor}F2` }}
    >
      <div className="max-w-6xl mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        <a href="#top" className="flex items-center gap-2 shrink-0">
          <img
            src={courseLogo}
            alt="Curso de Alimentação Ayurveda"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </a>

        {/* Desktop CTA */}
        <button
          onClick={onCtaClick}
          className="hidden md:inline-flex items-center justify-center font-bold text-sm uppercase tracking-wide px-6 py-3 bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
          style={{ color: darkColor }}
        >
          {ctaText}
        </button>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 border-none text-white"
            style={{ background: darkColor }}
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <img src={courseLogo} alt="" className="h-14 w-auto object-contain self-start" />
              <button
                onClick={() => {
                  setOpen(false);
                  onCtaClick();
                }}
                className="w-full font-bold text-sm uppercase tracking-wide px-6 py-4 bg-white shadow-md rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                style={{ color: darkColor }}
              >
                {ctaText}
              </button>
              <a href="/" className="text-white/80 hover:text-white text-sm underline">
                Voltar ao Portal
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default CourseHeader;
