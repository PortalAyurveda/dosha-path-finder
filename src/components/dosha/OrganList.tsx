import { Brain, Heart, Bone, Ear, Activity, Droplets, Stethoscope, CircleDot, Eye, type LucideIcon } from "lucide-react";

interface OrganItem {
  name: string;
  description: string;
}

interface OrganListProps {
  intro: string;
  organs: OrganItem[];
}

const organIcons: Record<string, LucideIcon> = {
  "Intestino Grosso": Activity,
  "Mente": Brain,
  "Manas": Brain,
  "Sistema Circulatório": Heart,
  "Coração": Heart,
  "Tecido Ósseo": Bone,
  "Ouvidos": Ear,
  "Metabolismo": Stethoscope,
  "Metabolismo Digestivo": Stethoscope,
  "Sangue": Droplets,
  "Pele": CircleDot,
  "Discernimento": Eye,
  "Pulmões": Activity,
  "Estômago": Stethoscope,
  "Articulações": Bone,
  "Sistema Linfático": Droplets,
  "Nariz": Activity,
};

function getOrganIcon(name: string): LucideIcon {
  for (const key of Object.keys(organIcons)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return organIcons[key];
    }
  }
  return CircleDot;
}

const OrganList = ({ intro, organs }: OrganListProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <div className="space-y-3">
        {organs.map((organ, i) => {
          const Icon = getOrganIcon(organ.name);
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">
                <span className="font-bold text-primary">{organ.name}:</span>{" "}
                {organ.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrganList;
