import { Check } from "lucide-react";

interface Props {
  color: string;
  size?: number;
  className?: string;
}

const CheckMark = ({ color, size = 18, className = "" }: Props) => (
  <span
    aria-hidden
    className={`shrink-0 inline-flex items-center justify-center rounded-full ${className}`}
    style={{
      width: size,
      height: size,
      background: `${color}20`,
      color,
    }}
  >
    <Check style={{ width: size * 0.6, height: size * 0.6 }} strokeWidth={3} />
  </span>
);

export default CheckMark;
