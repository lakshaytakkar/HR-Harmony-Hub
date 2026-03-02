import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, ShoppingBag, Truck, Package, DollarSign, Users, FileCheck, Settings, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useVertical } from "@/lib/vertical-store";
import { faireNotifications, type AppNotification, type NotificationType } from "@/lib/mock-data-shared";

export const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  order:       { icon: ShoppingBag,    color: "#2563EB", bg: "#EFF6FF", label: "Orders" },
  fulfillment: { icon: Truck,          color: "#D97706", bg: "#FFFBEB", label: "Fulfillment" },
  inventory:   { icon: Package,        color: "#EA580C", bg: "#FFF7ED", label: "Inventory" },
  finance:     { icon: DollarSign,     color: "#16A34A", bg: "#F0FDF4", label: "Finance" },
  retailer:    { icon: Users,          color: "#7C3AED", bg: "#F5F3FF", label: "Retailers" },
  application: { icon: FileCheck,      color: "#0891B2", bg: "#ECFEFF", label: "Applications" },
  quotation:   { icon: MessageSquare,  color: "#BE185D", bg: "#FDF2F8", label: "Quotations" },
  system:      { icon: Settings,       color: "#64748B", bg: "#F8FAFC", label: "System" },
};

export const NOTIFICATION_SOURCES: Record<string, AppNotification[]> = {
  faire: faireNotifications,
};

export function NotificationRow({
  n,
  onRead,
  compact = true,
}: {
  n: AppNotification;
  onRead: (id: string, url: string) => void;
  compact?: boolean;
}) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => onRead(n.id, n.url)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 border-b last:border-b-0",
        !n.isRead && "bg-blue-50/40 dark:bg-blue-950/20"
      )}
      data-testid={`notification-item-${n.id}`}
    >
      <div
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", !n.isRead ? "font-semibold" : "font-medium")}>
          {n.title}
        </p>
        <p className={cn("text-xs text-muted-foreground mt-0.5 leading-relaxed", compact && "line-clamp-2")}>
          {n.description}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
      </div>
      {!n.isRead && (
        <div className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}

export function NotificationPanel() {
  const [, setLocation] = useLocation();
  const { currentVertical } = useVertical();
  const [open, setOpen] = useState(false);

  const source = NOTIFICATION_SOURCES[currentVertical.id] ?? faireNotifications;
  const [notifications, setNotifications] = useState<AppNotification[]>(source);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const todayNotifs = notifications.slice(0, 5);
  const earlierNotifs = notifications.slice(5);

  function markRead(id: string, url: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setOpen(false);
    setLocation(url);
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span
              className="absolute right-1 top-1 min-w-[16px] h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none"
              data-testid="notification-badge"
            >
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-96 p-0 shadow-lg"
        data-testid="notification-panel"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="h-5 min-w-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-mark-all-read"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
          {todayNotifs.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-muted/40 sticky top-0 z-10 border-b">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Today
                </span>
              </div>
              {todayNotifs.map((n) => (
                <NotificationRow key={n.id} n={n} onRead={markRead} compact />
              ))}
            </div>
          )}
          {earlierNotifs.length > 0 && (
            <div>
              <div className="px-4 py-1.5 bg-muted/40 sticky top-0 z-10 border-b">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Earlier
                </span>
              </div>
              {earlierNotifs.map((n) => (
                <NotificationRow key={n.id} n={n} onRead={markRead} compact />
              ))}
            </div>
          )}
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>

        <div className="border-t px-4 py-2.5 text-center">
          <button
            onClick={() => {
              setOpen(false);
              setLocation(`/${currentVertical.id}/notifications`);
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            data-testid="btn-view-all-notifications"
          >
            View all notifications →
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
