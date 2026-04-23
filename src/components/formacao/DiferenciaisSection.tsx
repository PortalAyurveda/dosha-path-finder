import { motion } from "framer-motion";
import Bullet from "./Bullet";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["diferenciais"];
  branding: FormacaoData["branding"];
}

const DiferenciaisSection = ({ data, branding }: Props) => (
  <section className="bg-white py-12 md:py-16">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <div className="space-y-5">
        {data.items.map((d, i) => (
          <motion.article
            key={d.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            className="grid grid-cols-[auto_1fr] gap-4 md:gap-5 p-5 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            style={{ background: "#FAF9F6" }}
          >
            <span
              className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-serif font-bold text-xl md:text-2xl text-white"
              style={{ background: branding.darkColor }}
            >
              {d.number}
            </span>
            <div>
              <h3
                className="font-serif font-bold text-lg md:text-xl mb-2 leading-snug"
                style={{ color: branding.darkColor }}
              >
                {d.title}
              </h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-2">
                {d.body}
              </p>
              {d.bullets && (
                <ul className="space-y-2 mt-3">
                  {d.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2.5">
                      <Bullet src={branding.bulletSvg} size={18} className="mt-0.5" />
                      <span className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default DiferenciaisSection;
