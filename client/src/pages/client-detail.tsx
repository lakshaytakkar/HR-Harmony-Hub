import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Mail, Phone, Calendar, User, Building2, MapPin, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, type Column } from "@/components/hr/data-table";
import { StatusBadge } from "@/components/hr/status-badge";
import { StageStepper } from "@/components/hr/stage-stepper";
import { PageTransition } from "@/components/ui/animated";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import {
  formationClients,
  stageChecklists,
  clientDocuments,
  formationTasks,
} from "@/lib/mock-data";
import { stageDefinitions } from "@shared/schema";
import type { ClientDocument, FormationTask, StageChecklist } from "@shared/schema";

const riskVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  "on-track": "success",
  "delayed": "warning",
  "at-risk": "error",
};

const priorityVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

const taskStatusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  pending: "warning",
  "in-progress": "info",
  completed: "success",
  overdue: "error",
};

const docStatusVariantMap: Record<string, "success" | "error" | "warning" | "neutral" | "info"> = {
  uploaded: "info",
  pending: "warning",
  verified: "success",
};

export default function ClientDetailPage() {
  const [, params] = useRoute("/legalnations/clients/:id");
  const [, navigate] = useLocation();
  const loading = useSimulatedLoading();

  const clientId = params?.id;
  const client = formationClients.find((c) => c.id === clientId);

  const checklists = useMemo(
    () => stageChecklists.filter((c) => c.clientId === clientId),
    [clientId]
  );
  const documents = useMemo(
    () => clientDocuments.filter((d) => d.clientId === clientId),
    [clientId]
  );
  const tasks = useMemo(
    () => formationTasks.filter((t) => t.clientId === clientId),
    [clientId]
  );

  const checklistByStage = useMemo(() => {
    const map: Record<number, StageChecklist[]> = {};
    checklists.forEach((c) => {
      if (!map[c.stage]) map[c.stage] = [];
      map[c.stage].push(c);
    });
    return map;
  }, [checklists]);

  const docColumns: Column<ClientDocument>[] = [
    {
      key: "title",
      header: "Document",
      sortable: true,
      render: (item) => <span className="text-sm font-medium" data-testid={`text-doc-${item.id}`}>{item.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (item) => <StatusBadge status={item.category} variant="info" />,
    },
    {
      key: "stage",
      header: "Stage",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {stageDefinitions[item.stage]?.name || `Stage ${item.stage}`}
        </span>
      ),
    },
    {
      key: "uploadDate",
      header: "Uploaded",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.uploadDate}</span>,
    },
    {
      key: "uploadedBy",
      header: "By",
      render: (item) => <span className="text-sm text-muted-foreground">{item.uploadedBy}</span>,
    },
    {
      key: "fileSize",
      header: "Size",
      render: (item) => <span className="text-sm text-muted-foreground">{item.fileSize}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={docStatusVariantMap[item.status]}
        />
      ),
    },
  ];

  const taskColumns: Column<FormationTask>[] = [
    {
      key: "title",
      header: "Task",
      sortable: true,
      render: (item) => (
        <div>
          <p className="text-sm font-medium" data-testid={`text-task-${item.id}`}>{item.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
        </div>
      ),
    },
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (item) => <span className="text-sm text-muted-foreground">{item.assignedTo}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      render: (item) => <span className="text-sm text-muted-foreground">{item.dueDate}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge
          status={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          variant={priorityVariantMap[item.priority]}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status === "in-progress" ? "In Progress" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={taskStatusVariantMap[item.status]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="px-16 py-6 lg:px-24">
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="px-16 py-6 lg:px-24">
        <PageTransition>
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm font-medium" data-testid="text-not-found">Client not found</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/legalnations/clients")} data-testid="button-back">
              Back to Clients
            </Button>
          </div>
        </PageTransition>
      </div>
    );
  }

  const completedChecks = checklists.filter((c) => c.completed).length;
  const totalChecks = checklists.length;
  const completionPercent = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  return (
    <div className="px-16 py-6 lg:px-24">
      <PageTransition>
        <div className="mb-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/legalnations/clients")}
            data-testid="button-back-clients"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Clients
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-heading" data-testid="text-company-name">
                {client.companyName}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-client-name">
                {client.clientName} &middot; {client.companyType} &middot; {client.state}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50">
                  <SiWhatsapp className="size-3.5" /> WhatsApp
                </Button>
              </a>
              <a href={`mailto:${client.email}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Mail className="size-3.5" /> Email
                </Button>
              </a>
              <StatusBadge
                status={client.riskFlag === "on-track" ? "On Track" : client.riskFlag === "at-risk" ? "At Risk" : "Delayed"}
                variant={riskVariantMap[client.riskFlag]}
              />
              <StatusBadge
                status={client.priority.charAt(0).toUpperCase() + client.priority.slice(1) + " Priority"}
                variant={priorityVariantMap[client.priority]}
              />
              <StatusBadge status={client.packageType} variant="info" />
            </div>
          </div>

          <StageStepper
            currentStage={client.currentStage}
            stages={stageDefinitions}
            className="py-2"
          />
        </div>

        <Tabs defaultValue="overview" data-testid="client-tabs">
          <TabsList data-testid="client-tabs-list">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist ({completedChecks}/{totalChecks})</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks ({tasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card data-testid="card-client-info">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Information</CardTitle>
                  <User className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span data-testid="text-email">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span data-testid="text-phone">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span>{client.companyType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>{client.state}</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-formation-info">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Formation Details</CardTitle>
                  <Building2 className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>Started: {client.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Expected: {client.expectedCompletion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="size-3.5 text-muted-foreground" />
                    <span>Manager: {client.assignedManager}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Completion: </span>
                    <span className="font-medium">{completionPercent}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-notes">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground" data-testid="text-notes">
                    {client.notes || "No notes yet."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checklist">
            {Object.keys(checklistByStage).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground" data-testid="text-no-checklist">
                No checklist items found for this client.
              </p>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={stageDefinitions.map((s) => String(s.number))}
                className="rounded-lg border bg-background"
              >
                {stageDefinitions
                  .filter((s) => checklistByStage[s.number])
                  .map((stage) => {
                    const items = checklistByStage[stage.number] || [];
                    const done = items.filter((i) => i.completed).length;
                    return (
                      <AccordionItem
                        key={stage.number}
                        value={String(stage.number)}
                        data-testid={`accordion-stage-${stage.number}`}
                      >
                        <AccordionTrigger className="px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Stage {stage.number}: {stage.name}
                            </span>
                            <StatusBadge
                              status={`${done}/${items.length}`}
                              variant={done === items.length ? "success" : "neutral"}
                            />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="flex flex-col gap-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 rounded-md border px-3 py-2"
                                data-testid={`checklist-item-${item.id}`}
                              >
                                <Checkbox
                                  checked={item.completed}
                                  data-testid={`checkbox-${item.id}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {item.item}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.responsible} &middot; Due: {item.deadline}
                                  </p>
                                </div>
                                {item.documentAttachment && (
                                  <StatusBadge status={item.documentAttachment} variant="warning" />
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <DataTable
              data={documents}
              columns={docColumns}
              searchPlaceholder="Search documents..."
              searchKey="title"
            />
          </TabsContent>

          <TabsContent value="tasks">
            <DataTable
              data={tasks}
              columns={taskColumns}
              searchPlaceholder="Search tasks..."
              searchKey="title"
              filters={[
                { label: "Priority", key: "priority", options: ["high", "medium", "low"] },
                { label: "Status", key: "status", options: ["pending", "in-progress", "completed", "overdue"] },
              ]}
            />
          </TabsContent>
        </Tabs>
      </PageTransition>
    </div>
  );
}
