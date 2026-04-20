import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { CoursePricingData, CourseBranding } from "@/data/courses/courseTypes";

interface PricingSectionProps {
  data: CoursePricingData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const PricingSection = ({ data, branding, onCtaClick }: PricingSectionProps) => {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white border border-gray-200 shadow-sm p-7 md:p-10 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
        >
          <span
            className="text-[11px] md:text-xs uppercase tracking-widest font-bold"
            style={{ color: branding.darkColor }}
          >
            Investimento
          </span>

          <p className="text-base md:text-lg line-through text-gray-400 mt-4 mb-1">
            {data.priceOld}
          </p>

          <p
            className="font-serif font-bold text-4xl md:text-5xl mb-2.5 leading-none"
            style={{ color: "#352F54" }}
          >
            {data.priceNew}
          </p>

          <p className="text-sm md:text-base text-gray-700 mb-1.5">
            ou <span className="font-bold">{data.installments}</span>
          </p>

          <p className="text-xs md:text-sm text-gray-500 italic mb-7">
            {data.highlight}
          </p>

          <motion.button
            onClick={onCtaClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-md hover:shadow-xl transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center text-white"
            style={{ background: branding.darkColor }}
          >
            {data.ctaText}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="mt-7 inline-flex items-start gap-3 p-3.5 max-w-lg mx-auto border border-gray-200 bg-gray-50 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm text-left">
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: branding.darkColor }}
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
              {data.guarantee}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
