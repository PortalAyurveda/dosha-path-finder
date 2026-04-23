import { motion } from "framer-motion";
import CheckMark from "./CheckMark";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["paraQuem"];
  branding: FormacaoData["branding"];
}

const ParaQuemSection = ({ data, branding }: Props) => (
  <section className="bg-white py-12 md:py-16">
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <ul className="space-y-4">
        {data.items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex items-start gap-3.5"
          >
            <CheckMark color={branding.darkColor} size={22} className="mt-1" />
            <span className="text-sm md:text-base text-gray-800 leading-relaxed">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  </section>
);

export default ParaQuemSection;
