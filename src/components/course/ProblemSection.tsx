import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { CourseProblemData } from "@/data/courses/courseTypes";

interface ProblemSectionProps {
  data: CourseProblemData;
}

const ProblemSection = ({ data }: ProblemSectionProps) => {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-2xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-5 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm md:text-base text-gray-700 leading-relaxed mb-8 whitespace-pre-line"
        >
          {data.intro}
        </motion.div>

        <ul className="space-y-2.5 mb-8">
          {data.bullets.map((bullet, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-3 p-3.5 bg-red-50 border-l-4 border-red-400 rounded-r-md"
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-sm md:text-base text-gray-800 leading-relaxed">
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
          className="font-serif font-bold italic text-lg md:text-xl text-center leading-snug border-t border-gray-200 pt-7"
          style={{ color: "#352F54" }}
        >
          {data.closing}
        </motion.p>
      </div>
    </section>
  );
};

export default ProblemSection;
