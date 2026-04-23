import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["hero"];
  branding: FormacaoData["branding"];
  onCtaClick: () => void;
}

const FormacaoHero = ({ data, branding, onCtaClick }: Props) => (
  <section
    id="top"
    className="relative w-full py-14 md:py-20 overflow-hidden"
    style={{
      background: `linear-gradient(180deg, ${branding.lightColor} 0%, #FAF9F6 100%)`,
    }}
  >
    <div
      className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none"
      style={{ background: branding.primaryColor }}
      aria-hidden
    />
    <div
      className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none"
      style={{ background: branding.darkColor }}
      aria-hidden
    />

    <div className="relative max-w-4xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <img
          src={branding.bulletSvg}
          alt=""
          aria-hidden
          className="h-12 md:h-14 w-auto"
        />
        <span
          className="text-[11px] md:text-xs uppercase tracking-[0.25em] font-bold"
          style={{ color: branding.darkColor }}
        >
          Portal Ayurveda
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-serif italic font-bold text-[28px] md:text-[44px] leading-[1.15] mb-5"
        style={{ color: branding.darkColor }}
      >
        {data.headline}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-base md:text-lg max-w-2xl mx-auto mb-7 text-gray-700 leading-relaxed"
      >
        {data.subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="inline-flex flex-col items-center gap-2.5 mb-8 max-w-2xl"
      >
        <p
          className="text-xs md:text-sm font-bold tracking-wide px-4 py-2 rounded-full"
          style={{ background: `${branding.primaryColor}25`, color: branding.darkColor }}
        >
          {data.details}
        </p>
        <p
          className="inline-flex items-center gap-2 text-xs md:text-sm font-bold"
          style={{ color: branding.darkColor }}
        >
          <Calendar className="h-4 w-4" />
          {data.startDate}
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        onClick={onCtaClick}
        className="inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 md:py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto text-white"
        style={{ background: branding.darkColor }}
      >
        {data.ctaText}
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-xs md:text-sm text-gray-600 italic mt-4"
      >
        {data.ctaSubtext}
      </motion.p>
    </div>
  </section>
);

export default FormacaoHero;
