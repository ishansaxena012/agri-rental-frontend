import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in">
      <div className="w-20 h-20 bg-earth-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={36} className="text-earth-400" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl text-bark mb-2">{title}</h3>
      <p className="text-earth-500 text-sm leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}
