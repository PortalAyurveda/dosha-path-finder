interface BulletProps {
  src: string;
  size?: number;
  className?: string;
}

const Bullet = ({ src, size = 20, className = "" }: BulletProps) => (
  <img
    src={src}
    alt=""
    aria-hidden
    width={size}
    height={size}
    className={`shrink-0 select-none ${className}`}
    style={{ width: size, height: size }}
    loading="lazy"
  />
);

export default Bullet;
