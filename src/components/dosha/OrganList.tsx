interface OrganItem {
  name: string;
  description: string;
}

interface OrganListProps {
  intro: string;
  organs: OrganItem[];
}

const OrganList = ({ intro, organs }: OrganListProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <div className="space-y-3">
        {organs.map((organ, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">{organ.name}:</span>{" "}
              {organ.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganList;
