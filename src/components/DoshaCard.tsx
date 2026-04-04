import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface DoshaCardProps {
  dosha: "vata" | "pitta" | "kapha";
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const doshaStyles = {
  vata: "border-vata/40 bg-vata/10",
  pitta: "border-pitta/40 bg-pitta/10",
  kapha: "border-kapha/40 bg-kapha/10",
};

const DoshaCard = ({ dosha, title, description, icon }: DoshaCardProps) => {
  return (
    <Link to={`/dosha/${dosha}`}>
      <Card className={`border-2 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm transition-all hover:shadow-lg hover:-translate-y-1 ${doshaStyles[dosha]}`}>
        <CardContent className="p-6 text-center">
          {icon && <div className="mb-4 flex justify-center text-primary">{icon}</div>}
          <h4 className="mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DoshaCard;
