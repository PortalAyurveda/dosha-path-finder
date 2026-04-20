import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { CourseProblemData } from "@/data/courses/courseTypes";

interface ProblemSectionProps {
  data: CourseProblemData;
}

const ProblemSection = ({ data }: ProblemSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-8 text-center"
        >
          {data.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-lg text-foreground/80 leading-relaxed mb-10 whitespace-pre-line"
        >
          {data.intro}
        </motion.div>

        <ul className="space-y-4 mb-10">
          {data.bullets.map((bullet, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4 p-4 md:p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                <X className="h-5 w-5 text-white" strokeWidth={3} />
              </span>
              <span className="text-base md:text-lg text-foreground/90 leading-relaxed">
                {bullet}
              </span>
            </motion.li>
          ))}
        </ul>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-serif font-bold italic text-xl md:text-2xl text-foreground text-center leading-snug border-t border-border pt-8"
        >
          {data.closing}
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;
