import type { CourseFooterData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseFooterProps {
  data: CourseFooterData;
  branding: CourseBranding;
}

const CourseFooter = ({ data, branding }: CourseFooterProps) => {
  return (
    <section className="bg-white py-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p
          className="font-serif italic text-sm md:text-base leading-snug whitespace-pre-line"
          style={{ color: branding.darkColor }}
        >
          "{data.tagline}"
        </p>
      </div>
    </section>
  );
};

export default CourseFooter;
