import { motion } from "framer-motion";
import CheckMark from "./CheckMark";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["solucao"];
  branding: FormacaoData["branding"];
}

const SolucaoSection = ({ data, branding }: Props) => (
  <section className="bg-white py-12 md:py-16">
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

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto text-center mb-7 leading-relaxed"
      >
        {data.subtitle}
      </motion.p>

      <p
        className="font-bold text-base md:text-lg mb-5"
        style={{ color: branding.darkColor }}
      >
        {data.listIntro}
      </p>

      <ul className="space-y-4 mb-8">
        {data.items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex items-start gap-3.5"
          >
            <CheckMark color={branding.darkColor} size={22} className="mt-1" />
            <span className="text-sm md:text-base text-gray-800 leading-relaxed">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="border-t border-gray-200 pt-6 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line italic"
      >
        {data.closing}
      </motion.div>
    </div>
  </section>
);

export default SolucaoSection;
