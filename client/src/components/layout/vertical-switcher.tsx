import { Check, ChevronsUpDown } from "lucide-react";
import { useLocation } from "wouter";
import { verticals } from "@/lib/verticals-config";
import { useVertical } from "@/lib/vertical-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function VerticalSwitcher() {
  const { currentVertical, setCurrentVertical } = useVertical();
  const [, setLocation] = useLocation();

  const handleSwitch = (verticalId: string) => {
    const target = verticals.find((v) => v.id === verticalId);
    if (target && target.id !== currentVertical.id) {
      setCurrentVertical(verticalId);
      setLocation(target.navCategories[0].defaultUrl);
    }
  };

  const CurrentLogo = currentVertical.logo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64" data-testid="vertical-switcher-menu">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
          Switch Product
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {verticals.map((v) => {
          const isActive = currentVertical.id === v.id;
          const LogoComponent = v.logo;
          return (
            <DropdownMenuItem
              key={v.id}
              onClick={() => handleSwitch(v.id)}
              className={cn(
                "flex items-center gap-3 py-2.5 cursor-pointer",
                isActive && "bg-accent"
              )}
              data-testid={`vertical-option-${v.id}`}
            >
              <LogoComponent size={42} />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate">{v.name}</p>
                <p className="text-xs text-muted-foreground truncate">{v.tagline} · {v.description}</p>
              </div>
              {isActive && <Check className="size-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
