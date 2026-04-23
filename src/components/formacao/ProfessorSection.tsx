import { motion } from "framer-motion";
import CheckMark from "./CheckMark";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["professor"];
  branding: FormacaoData["branding"];
}

const FormacaoProfessorSection = ({ data, branding }: Props) => (
  <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
    <div className="max-w-4xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto md:mx-0"
        >
          <div
            className="w-[230px] h-[230px] md:w-[280px] md:h-[280px] overflow-hidden shadow-md rounded-t-full rounded-b-none"
            style={{ border: `5px solid ${branding.primaryColor}` }}
          >
            <img
              src={data.photo}
              alt={data.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p
            className="text-[11px] uppercase tracking-widest font-bold mb-2"
            style={{ color: branding.primaryColor }}
          >
            Sobre o Professor
          </p>
          <h2
            className="font-serif italic font-bold text-2xl md:text-3xl mb-1"
            style={{ color: branding.darkColor }}
          >
            {data.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-600 mb-5">{data.role}</p>

          <ul className="space-y-2.5 mb-5">
            {data.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckMark color={branding.darkColor} size={20} className="mt-0.5" />
                <span className="text-sm md:text-base text-gray-800 leading-relaxed">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-sm md:text-base text-gray-700 leading-relaxed italic">
            {data.text}
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FormacaoProfessorSection;
