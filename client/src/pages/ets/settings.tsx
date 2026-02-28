import { useState } from "react";
import {
  Settings,
  Pencil,
  Save,
  X,
  DollarSign,
  Percent,
  Package,
  ShoppingBag,
  Truck,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/hr/status-badge";
import { PageTransition, Fade, Stagger, StaggerItem } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  defaultPriceSettings,
  ETS_PRODUCT_CATEGORIES,
  ETS_CATEGORY_DUTY_RATES,
  etsProposalTemplates,
  type EtsPriceSetting,
  type EtsProductCategory,
} from "@/lib/mock-data-ets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const settingIcons: Record<string, typeof DollarSign> = {
  exchange_rate: DollarSign,
  sourcing_commission: Percent,
  freight_per_cbm: Truck,
  insurance_percent: Shield,
  sw_surcharge_percent: Package,
  our_markup_percent: TrendingUp,
  target_store_margin: Target,
};

const categoryLabels: Record<EtsProductCategory, string> = {
  toys: "Toys",
  kitchenware: "Kitchenware",
  stationery: "Stationery",
  decor: "Decor",
  bags: "Bags",
  household: "Household",
  gifts: "Gifts",
};

const tierColors: Record<string, "info" | "success" | "warning"> = {
  lite: "info",
  pro: "success",
  elite: "warning",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EtsSettingsPage() {
  const loading = useSimulatedLoading();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState<EtsPriceSetting[]>([...defaultPriceSettings]);
  const [editSettings, setEditSettings] = useState<EtsPriceSetting[]>([...defaultPriceSettings]);
  const [categoryRates, setCategoryRates] = useState<Record<EtsProductCategory, { duty: number; igst: number }>>({ ...ETS_CATEGORY_DUTY_RATES });
  const [editCategoryRates, setEditCategoryRates] = useState<Record<EtsProductCategory, { duty: number; igst: number }>>({ ...ETS_CATEGORY_DUTY_RATES });

  const handleEdit = () => {
    setEditSettings([...settings]);
    setEditCategoryRates({ ...categoryRates });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setSettings([...editSettings]);
    setCategoryRates({ ...editCategoryRates });
    setIsEditing(false);
    toast({ title: "Settings saved", description: "Pricing defaults have been updated." });
  };

  const updateSettingValue = (key: string, value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    setEditSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value: numVal } : s))
    );
  };

  const updateCategoryRate = (cat: EtsProductCategory, field: "duty" | "igst", value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;
    setEditCategoryRates((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: numVal },
    }));
  };

  if (loading) {
    return (
      <div className="px-16 py-6 lg:px-24">
        <Skeleton className="h-24 w-full rounded-xl mb-5" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
<div className="flex items-center justify-end gap-2 mb-6">
          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} data-testid="button-cancel-edit">
                <X className="mr-1.5 size-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} data-testid="button-save-settings">
                <Save className="mr-1.5 size-3.5" />
                Save Changes
              </Button>
            </>
          )}
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit} data-testid="button-edit-settings">
              <Pencil className="mr-1.5 size-3.5" />
              Edit Mode
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <Fade direction="up" delay={0.05}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <div>
                  <CardTitle className="text-base font-semibold" data-testid="text-pricing-defaults-title">Pricing Defaults</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Core parameters used in the price calculator and product cost engine</p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Stagger staggerInterval={0.04} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(isEditing ? editSettings : settings).map((setting) => {
                    const IconComp = settingIcons[setting.key] || Settings;
                    return (
                      <StaggerItem key={setting.key}>
                        <div
                          className="rounded-lg border bg-background p-4"
                          data-testid={`card-setting-${setting.key}`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <IconComp className="size-3.5" />
                            </div>
                            <span className="text-sm font-medium truncate">{setting.label}</span>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={setting.value}
                                onChange={(e) => updateSettingValue(setting.key, e.target.value)}
                                className="text-sm"
                                data-testid={`input-setting-${setting.key}`}
                              />
                              <span className="text-sm text-muted-foreground shrink-0">{setting.unit}</span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-semibold font-heading tracking-tight" data-testid={`text-setting-value-${setting.key}`}>
                                {setting.value}
                              </span>
                              <span className="text-sm text-muted-foreground">{setting.unit}</span>
                            </div>
                          )}
                        </div>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </CardContent>
            </Card>
          </Fade>

          <Fade direction="up" delay={0.1}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <div>
                  <CardTitle className="text-base font-semibold" data-testid="text-duty-rates-title">Category Duty Rates</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Customs duty and IGST percentages per product category</p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Customs Duty %</TableHead>
                        <TableHead className="text-right">IGST %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ETS_PRODUCT_CATEGORIES.map((cat) => {
                        const rates = isEditing ? editCategoryRates[cat] : categoryRates[cat];
                        return (
                          <TableRow key={cat} data-testid={`row-category-${cat}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={categoryLabels[cat]} variant="neutral" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="1"
                                  value={rates.duty}
                                  onChange={(e) => updateCategoryRate(cat, "duty", e.target.value)}
                                  className="ml-auto w-20 text-right text-sm"
                                  data-testid={`input-duty-${cat}`}
                                />
                              ) : (
                                <span className="text-sm font-medium" data-testid={`text-duty-${cat}`}>{rates.duty}%</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isEditing ? (
                                <Input
                                  type="number"
                                  step="1"
                                  value={rates.igst}
                                  onChange={(e) => updateCategoryRate(cat, "igst", e.target.value)}
                                  className="ml-auto w-20 text-right text-sm"
                                  data-testid={`input-igst-${cat}`}
                                />
                              ) : (
                                <span className="text-sm font-medium" data-testid={`text-igst-${cat}`}>{rates.igst}%</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </Fade>

          <Fade direction="up" delay={0.15}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <div>
                  <CardTitle className="text-base font-semibold" data-testid="text-package-tiers-title">Package Tier Configs</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Investment, SKU count, and store size details per franchise tier</p>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <Stagger staggerInterval={0.06} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {etsProposalTemplates.map((tmpl) => (
                    <StaggerItem key={tmpl.id}>
                      <div
                        className="rounded-lg border bg-background p-5"
                        data-testid={`card-tier-${tmpl.packageTier}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <h4 className="text-lg font-semibold font-heading capitalize" data-testid={`text-tier-name-${tmpl.packageTier}`}>
                            {tmpl.packageTier}
                          </h4>
                          <StatusBadge
                            status={tmpl.packageTier.charAt(0).toUpperCase() + tmpl.packageTier.slice(1)}
                            variant={tierColors[tmpl.packageTier]}
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">Base Investment</span>
                            <span className="text-sm font-semibold" data-testid={`text-tier-investment-${tmpl.packageTier}`}>
                              {formatCurrency(tmpl.totalInvestment)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">Target SKUs</span>
                            <span className="text-sm font-semibold" data-testid={`text-tier-skus-${tmpl.packageTier}`}>
                              {tmpl.skuCount}+
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">Store Size</span>
                            <span className="text-sm font-semibold" data-testid={`text-tier-size-${tmpl.packageTier}`}>
                              {tmpl.storeSize} sq ft
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Category Mix Defaults</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(tmpl.categoryMix).map(([cat, pct]) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="text-xs"
                                data-testid={`badge-mix-${tmpl.packageTier}-${cat}`}
                              >
                                {categoryLabels[cat as EtsProductCategory] || cat} {pct}%
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Payment Schedule</p>
                          <div className="space-y-1.5">
                            {tmpl.paymentSchedule.map((ps, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground">{ps.milestone}</span>
                                <span className="text-xs font-medium">{ps.percent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </CardContent>
            </Card>
          </Fade>
        </div>
      </PageTransition>
    </div>
  );
}
