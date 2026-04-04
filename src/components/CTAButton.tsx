import { Button, ButtonProps } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CTAButtonProps extends ButtonProps {
  to?: string;
  children: React.ReactNode;
}

const CTAButton = ({ to, children, className = "", ...props }: CTAButtonProps) => {
  const classes = `bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all ${className}`;

  if (to) {
    return (
      <Button asChild className={classes} {...props}>
        <Link to={to}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button className={classes} {...props}>
      {children}
    </Button>
  );
};

export default CTAButton;
