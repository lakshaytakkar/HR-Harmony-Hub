import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/hr/status-badge";
import { categories } from "@/lib/mock-data-sales";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import {
  Cpu, Sparkles, Dumbbell, Home, Watch, Camera, Heart, Shirt, PawPrint, Plane, Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  Sparkles,
  Dumbbell,
  Home,
  Watch,
  Camera,
  Heart,
  Shirt,
  PawPrint,
  Plane,
};

export default function CategoriesPage() {
  const loading = useSimulatedLoading();

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Package;
              return (
                <StaggerItem key={cat.id}>
                  <Card className="p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" data-testid={`card-category-${cat.id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <h3 className="text-base font-semibold font-heading">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                        </p>
                      </div>
                      <StatusBadge
                        status={cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                        variant={cat.status === "active" ? "success" : "error"}
                      />
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </PageTransition>
    </div>
  );
}
