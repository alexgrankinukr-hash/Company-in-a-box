import Link from "next/link";
import { ListTodo, DollarSign, Activity, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    href: "/tasks",
    label: "Tasks",
    description: "View and manage company tasks",
    icon: ListTodo,
  },
  {
    href: "/costs",
    label: "Costs",
    description: "Track spending and budgets",
    icon: DollarSign,
  },
  {
    href: "/activity",
    label: "Activity",
    description: "Full activity log",
    icon: Activity,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Configure your AI company",
    icon: Settings,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="transition-colors hover:border-muted-foreground/25">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
