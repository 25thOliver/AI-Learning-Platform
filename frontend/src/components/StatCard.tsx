import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "success" | "destructive" | "warning";
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
};

const StatCard = ({ title, value, icon: Icon, variant = "default" }: StatCardProps) => (
  <div className="rounded-lg bg-card p-6 card-shadow animate-slide-up">
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
