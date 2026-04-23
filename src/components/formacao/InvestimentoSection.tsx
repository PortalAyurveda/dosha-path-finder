import { motion } from "framer-motion";
import { X } from "lucide-react";
import CheckMark from "./CheckMark";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["investimento"];
  branding: FormacaoData["branding"];
  onCtaClick: () => void;
  ctaText: string;
  ctaSubtext: string;
}

const InvestimentoSection = ({ data, branding, onCtaClick, ctaText, ctaSubtext }: Props) => (
  <section className="py-12 md:py-16" id="investimento" style={{ background: "#F0F4FF" }}>
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-4 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
        {data.subtitle}
      </p>

      <div
        className="p-6 md:p-7 mb-6 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border"
        style={{ background: "#FAF9F6", borderColor: `${branding.primaryColor}40` }}
      >
        <h3
          className="font-bold text-base md:text-lg mb-4"
          style={{ color: branding.darkColor }}
        >
          {data.breakdownTitle}
        </h3>
        <ul className="space-y-2 mb-5">
          {data.breakdown.map((b, i) => (
            <li key={i} className="text-sm md:text-base text-gray-800">
              {b}
            </li>
          ))}
        </ul>
        <p
          className="font-serif font-bold text-lg md:text-xl pt-4 border-t border-gray-200"
          style={{ color: branding.darkColor }}
        >
          {data.total}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-7 mb-8 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-l-4"
        style={{
          background: branding.lightColor,
          borderColor: branding.darkColor,
          color: branding.darkColor,
        }}
      >
        <p
          className="text-[11px] uppercase tracking-widest font-bold mb-3"
          style={{ color: branding.darkColor }}
        >
          {data.condicoesTitle}
        </p>
        <ul className="space-y-2.5 mb-4">
          {data.condicoes.map((c, i) => (
            <li key={i} className="flex items-start gap-3 text-sm md:text-base">
              <CheckMark color={branding.darkColor} size={20} className="mt-0.5" />
              <span className="leading-relaxed" style={{ color: branding.darkColor }}>
                {c}
              </span>
            </li>
          ))}
        </ul>
        <p
          className="text-xs md:text-sm italic"
          style={{ color: branding.darkColor, opacity: 0.8 }}
        >
          {data.condicoesNote}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div>
          <h3 className="font-bold text-base mb-3" style={{ color: branding.darkColor }}>
            {data.inclusoTitle}
          </h3>
          <ul className="space-y-2.5">
            {data.incluso.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckMark color={branding.darkColor} size={18} className="mt-0.5" />
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-3" style={{ color: branding.darkColor }}>
            {data.naoInclusoTitle}
          </h3>
          <ul className="space-y-2.5">
            {data.naoIncluso.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="shrink-0 w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mt-1">
                  <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <button
          onClick={onCtaClick}
          className="inline-flex items-center justify-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-8 md:px-12 py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto text-white"
          style={{ background: "#FF7676" }}
        >
          {ctaText}
        </button>
        <p className="text-xs md:text-sm text-gray-600 italic mt-3">{ctaSubtext}</p>
      </div>
    </div>
  </section>
);

export default InvestimentoSection;
