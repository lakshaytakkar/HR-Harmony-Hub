import { useState } from "react";
import { Search, Mail, Phone, MoreHorizontal, Plus, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { PageTransition, Fade } from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { getPersonAvatar } from "@/lib/avatars";
import { crmContacts, crmCompanies, ALL_VERTICALS_IN_CRM } from "@/lib/mock-data-crm";

const BRAND = "#0369A1";

const sizeConfig: Record<string, string> = {
  "1-10": "bg-slate-50 text-slate-600",
  "11-50": "bg-sky-50 text-sky-700",
  "51-200": "bg-blue-50 text-blue-700",
  "201-500": "bg-amber-50 text-amber-700",
  "500+": "bg-violet-50 text-violet-700",
};

export default function CrmContacts() {
  const isLoading = useSimulatedLoading(600);
  const [verticalFilter, setVerticalFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  const getVertical = (id: string) => ALL_VERTICALS_IN_CRM.find(v => v.id === id);

  const filteredContacts = crmContacts.filter(c => {
    if (verticalFilter !== "all" && c.vertical !== verticalFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredCompanies = crmCompanies.filter(co => {
    if (verticalFilter !== "all" && co.vertical !== verticalFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!co.name.toLowerCase().includes(q) && !co.industry.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getCompanyContacts = (companyName: string) =>
    crmContacts.filter(c => c.company === companyName);

  if (isLoading) {
    return (
      <div className="px-16 py-6 lg:px-24 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded" />
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}</div>
      </div>
    );
  }

  const FilterBar = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[{ id: "all", name: "All Verticals", color: BRAND }, ...ALL_VERTICALS_IN_CRM].map(v => (
          <button
            key={v.id}
            onClick={() => setVerticalFilter(v.id)}
            data-testid={`pill-vertical-${v.id}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              verticalFilter === v.id ? "text-white border-transparent" : "bg-background border-border text-muted-foreground hover:border-foreground/30"
            }`}
            style={verticalFilter === v.id ? { backgroundColor: v.color, borderColor: v.color } : {}}
          >
            {v.name}
          </button>
        ))}
      </div>
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9 rounded-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-search"
        />
      </div>
    </div>
  );

  return (
    <PageTransition className="px-16 py-6 lg:px-24 space-y-5">
      <Fade>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Contacts</h1>
          <Button size="sm" className="rounded-full gap-1.5 text-white" style={{ backgroundColor: BRAND }} data-testid="btn-add-contact">
            <Plus className="size-4" /> Add Contact
          </Button>
        </div>
      </Fade>

      <Fade>
        <Tabs defaultValue="people" className="space-y-5">
          <TabsList className="rounded-xl">
            <TabsTrigger value="people" className="rounded-lg" data-testid="tab-people">
              People <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{crmContacts.length}</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="rounded-lg" data-testid="tab-companies">
              Companies <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">{crmCompanies.length}</span>
            </TabsTrigger>
          </TabsList>

          <FilterBar />

          <TabsContent value="people">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Phone</th>
                        <th className="text-left p-4 font-medium">Role & Company</th>
                        <th className="text-left p-4 font-medium">Vertical</th>
                        <th className="text-left p-4 font-medium">Source</th>
                        <th className="text-left p-4 font-medium">Assigned To</th>
                        <th className="text-left p-4 font-medium">Last Activity</th>
                        <th className="p-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredContacts.map(c => {
                        const vert = getVertical(c.vertical);
                        return (
                          <tr key={c.id} className="hover:bg-muted/30 transition-colors" data-testid={`contact-row-${c.id}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5">
                                <img src={getPersonAvatar(c.name, 32)} alt={c.name} className="size-8 rounded-full shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{c.name}</p>
                                  <p className="text-xs text-muted-foreground">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{c.phone}</td>
                            <td className="p-4">
                              <p className="text-sm">{c.designation}</p>
                              <p className="text-xs text-muted-foreground">{c.company}</p>
                            </td>
                            <td className="p-4">
                              {vert && (
                                <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                                  {vert.name}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="text-xs capitalize text-muted-foreground">{c.source.replace("-", " ")}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <img src={getPersonAvatar(c.assignedTo, 24)} alt={c.assignedTo} className="size-6 rounded-full" />
                                <span className="text-sm">{c.assignedTo}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{c.lastActivity}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <a href={`mailto:${c.email}`} data-testid={`btn-email-${c.id}`}>
                                  <Button variant="ghost" size="icon" className="size-7"><Mail className="size-3.5" /></Button>
                                </a>
                                <Button variant="ghost" size="icon" className="size-7" data-testid={`btn-call-${c.id}`}>
                                  <Phone className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7" data-testid={`btn-more-${c.id}`}>
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredContacts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-12 text-center text-sm text-muted-foreground">No contacts match the filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left p-4 font-medium">Company</th>
                        <th className="text-left p-4 font-medium">Industry</th>
                        <th className="text-left p-4 font-medium">Size</th>
                        <th className="text-left p-4 font-medium">Vertical</th>
                        <th className="text-left p-4 font-medium">Contacts</th>
                        <th className="text-left p-4 font-medium">Deals</th>
                        <th className="text-left p-4 font-medium">Assigned To</th>
                        <th className="text-left p-4 font-medium">Added</th>
                        <th className="p-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredCompanies.map(co => {
                        const vert = getVertical(co.vertical);
                        const linkedContacts = getCompanyContacts(co.name);
                        const isExpanded = expandedCompany === co.id;
                        return (
                          <>
                            <tr
                              key={co.id}
                              className="hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => setExpandedCompany(isExpanded ? null : co.id)}
                              data-testid={`company-row-${co.id}`}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-2.5">
                                  {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                  <div>
                                    <p className="text-sm font-medium">{co.name}</p>
                                    <a
                                      href={`https://${co.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {co.website} <ExternalLink className="size-3" />
                                    </a>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{co.industry}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sizeConfig[co.size] ?? ""}`}>{co.size} emp.</span>
                              </td>
                              <td className="p-4">
                                {vert && (
                                  <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: vert.color }}>
                                    {vert.name}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-sm font-medium">{linkedContacts.length}</td>
                              <td className="p-4 text-sm font-medium">{co.dealCount}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <img src={getPersonAvatar(co.assignedTo, 24)} alt={co.assignedTo} className="size-6 rounded-full" />
                                  <span className="text-sm">{co.assignedTo}</span>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{co.addedDate}</td>
                              <td className="p-4">
                                <Button variant="ghost" size="icon" className="size-7" onClick={e => e.stopPropagation()} data-testid={`btn-more-co-${co.id}`}>
                                  <MoreHorizontal className="size-3.5" />
                                </Button>
                              </td>
                            </tr>
                            {isExpanded && linkedContacts.length > 0 && (
                              <tr key={`${co.id}-expanded`}>
                                <td colSpan={9} className="bg-muted/30 px-8 py-3">
                                  <p className="text-xs text-muted-foreground font-medium mb-2">Linked Contacts</p>
                                  <div className="flex flex-wrap gap-3">
                                    {linkedContacts.map(lc => (
                                      <div key={lc.id} className="flex items-center gap-2 bg-background rounded-lg px-3 py-1.5 border">
                                        <img src={getPersonAvatar(lc.name, 24)} alt={lc.name} className="size-6 rounded-full" />
                                        <div>
                                          <p className="text-xs font-medium">{lc.name}</p>
                                          <p className="text-xs text-muted-foreground">{lc.designation}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                      {filteredCompanies.length === 0 && (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-sm text-muted-foreground">No companies match the filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Fade>
    </PageTransition>
  );
}
