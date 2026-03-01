import { useState } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { verticals } from "@/lib/verticals-config";
import { useVertical } from "@/lib/vertical-store";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const businessProducts = verticals.filter((v) => !v.isDepartment);
const departments = verticals.filter((v) => v.isDepartment);

export function VerticalSwitcher() {
  const { currentVertical, setCurrentVertical } = useVertical();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const handleSwitch = (verticalId: string) => {
    const target = verticals.find((v) => v.id === verticalId);
    if (target && target.id !== currentVertical.id) {
      setCurrentVertical(verticalId);
      setLocation(target.navCategories[0].defaultUrl);
    }
    setOpen(false);
  };

  const CurrentLogo = currentVertical.logo;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2.5 shrink-0 rounded-md px-1.5 py-1 transition-colors hover:bg-accent outline-none"
          data-testid="vertical-switcher"
        >
          <CurrentLogo size={36} />
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-base font-bold font-heading tracking-tight leading-tight">
              {currentVertical.shortName}
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              {currentVertical.tagline}
            </span>
          </div>
          <ChevronsUpDown className="size-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-0 w-auto shadow-xl border border-border rounded-xl overflow-hidden"
        data-testid="vertical-switcher-menu"
      >
        <div className="flex">
          <div className="w-60 p-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1.5 pb-2">
              Business Products
            </p>
            <div className="space-y-0.5">
              {businessProducts.map((v) => {
                const isActive = currentVertical.id === v.id;
                const LogoComponent = v.logo;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSwitch(v.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                    data-testid={`vertical-option-${v.id}`}
                  >
                    <LogoComponent size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{v.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.tagline}</p>
                    </div>
                    {isActive && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-60 bg-muted/40 border-l border-border p-2">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1.5 pb-2">
              <Building2 className="size-3" />
              Departments
            </p>
            <div className="space-y-0.5">
              {departments.map((v) => {
                const isActive = currentVertical.id === v.id;
                const LogoComponent = v.logo;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSwitch(v.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                    data-testid={`vertical-option-${v.id}`}
                  >
                    <LogoComponent size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{v.shortName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.tagline}</p>
                    </div>
                    {isActive && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 mx-2 pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Departments are shared across all business verticals.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
