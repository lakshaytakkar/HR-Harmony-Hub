import { useState, useCallback, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { TopNavigation } from "@/components/layout/top-navigation";
import { VerticalContext, getStoredVertical, setStoredVerticalId } from "@/lib/vertical-store";
import { getVerticalById, detectVerticalFromUrl, type Vertical } from "@/lib/verticals-config";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import ClientIntake from "@/pages/client-intake";
import StageOverview from "@/pages/stage-overview";
import FormationPipeline from "@/pages/formation-pipeline";
import TaskBoard from "@/pages/task-board";
import Escalations from "@/pages/escalations";
import DocumentVault from "@/pages/document-vault";
import Templates from "@/pages/templates";
import ComplianceTracker from "@/pages/compliance-tracker";
import AnnualReports from "@/pages/annual-reports";
import FormationAnalytics from "@/pages/formation-analytics";
import TeamPerformance from "@/pages/team-performance";
import StyleGuide from "@/pages/dev/style-guide";
import ComponentsGuide from "@/pages/dev/components-guide";
import IconsGuide from "@/pages/dev/icons-guide";
import SalesDashboard from "@/pages/sales/dashboard";
import SalesProducts from "@/pages/sales/products";
import SalesCategories from "@/pages/sales/categories";
import SalesSuppliers from "@/pages/sales/suppliers";
import SalesWinningProducts from "@/pages/sales/winning-products";
import SalesUsers from "@/pages/sales/users";
import SalesLeads from "@/pages/sales/leads";
import SalesPlans from "@/pages/sales/plans";
import SalesSubscriptions from "@/pages/sales/subscriptions";
import SalesStores from "@/pages/sales/stores";
import SalesFulfillment from "@/pages/sales/fulfillment";
import SalesCompetitors from "@/pages/sales/competitors";
import SalesTickets from "@/pages/sales/tickets";
import SalesCourses from "@/pages/sales/courses";
import SalesHelpCenter from "@/pages/sales/help-center";
import SalesRevenue from "@/pages/sales/revenue";
import SalesUserAnalytics from "@/pages/sales/user-analytics";
import SalesProductPerformance from "@/pages/sales/product-performance";
import EventsDashboard from "@/pages/events/dashboard";
import EventsList from "@/pages/events/events-list";
import EventsVenues from "@/pages/events/venues";
import EventsCheckin from "@/pages/events/checkin";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTeam from "@/pages/admin/team";
import AdminSettings from "@/pages/admin/settings";
import AdminReports from "@/pages/admin/reports";
import DevDashboard from "@/pages/dev/dashboard";
import DevPrompts from "@/pages/dev/prompts";
import DevResources from "@/pages/dev/resources";
import DevToolkit from "@/pages/dev/toolkit";
import DevProjects from "@/pages/dev/projects";
import DevProjectBoard from "@/pages/dev/project-board";
import DevTasks from "@/pages/dev/tasks";
import EtsDashboard from "@/pages/ets/dashboard";
import EtsPipeline from "@/pages/ets/pipeline";
import EtsClientDetail from "@/pages/ets/client-detail";
import EtsProducts from "@/pages/ets/products";
import EtsCalculator from "@/pages/ets/calculator";
import EtsOrders from "@/pages/ets/orders";
import EtsPayments from "@/pages/ets/payments";
import EtsProposals from "@/pages/ets/proposals";
import EtsTemplates from "@/pages/ets/templates";
import EtsSettings from "@/pages/ets/settings";
import HubDashboard from "@/pages/eventhub/dashboard";
import HubEventsList from "@/pages/eventhub/events-list";
import HubEventDetail from "@/pages/eventhub/event-detail";
import HubAttendees from "@/pages/eventhub/attendees";
import HubCheckin from "@/pages/eventhub/checkin";
import HubVenues from "@/pages/eventhub/venues";
import HubVendors from "@/pages/eventhub/vendors";
import HubBudget from "@/pages/eventhub/budget";
import HubAnalytics from "@/pages/eventhub/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/hr" component={Dashboard} />
      <Route path="/hr/clients/:id" component={ClientDetail} />
      <Route path="/hr/clients" component={Clients} />
      <Route path="/hr/intake" component={ClientIntake} />
      <Route path="/hr/stages" component={StageOverview} />
      <Route path="/hr/pipeline" component={FormationPipeline} />
      <Route path="/hr/tasks" component={TaskBoard} />
      <Route path="/hr/escalations" component={Escalations} />
      <Route path="/hr/documents" component={DocumentVault} />
      <Route path="/hr/templates" component={Templates} />
      <Route path="/hr/compliance" component={ComplianceTracker} />
      <Route path="/hr/annual-reports" component={AnnualReports} />
      <Route path="/hr/analytics" component={FormationAnalytics} />
      <Route path="/hr/team-performance" component={TeamPerformance} />
      <Route path="/dev" component={DevDashboard} />
      <Route path="/dev/style-guide" component={StyleGuide} />
      <Route path="/dev/components" component={ComponentsGuide} />
      <Route path="/dev/icons" component={IconsGuide} />
      <Route path="/dev/prompts" component={DevPrompts} />
      <Route path="/dev/resources" component={DevResources} />
      <Route path="/dev/toolkit" component={DevToolkit} />
      <Route path="/dev/projects/:id" component={DevProjectBoard} />
      <Route path="/dev/projects" component={DevProjects} />
      <Route path="/dev/tasks" component={DevTasks} />
      <Route path="/sales" component={SalesDashboard} />
      <Route path="/sales/products" component={SalesProducts} />
      <Route path="/sales/categories" component={SalesCategories} />
      <Route path="/sales/suppliers" component={SalesSuppliers} />
      <Route path="/sales/winning-products" component={SalesWinningProducts} />
      <Route path="/sales/users" component={SalesUsers} />
      <Route path="/sales/leads" component={SalesLeads} />
      <Route path="/sales/plans" component={SalesPlans} />
      <Route path="/sales/subscriptions" component={SalesSubscriptions} />
      <Route path="/sales/stores" component={SalesStores} />
      <Route path="/sales/fulfillment" component={SalesFulfillment} />
      <Route path="/sales/competitors" component={SalesCompetitors} />
      <Route path="/sales/tickets" component={SalesTickets} />
      <Route path="/sales/courses" component={SalesCourses} />
      <Route path="/sales/help-center" component={SalesHelpCenter} />
      <Route path="/sales/revenue" component={SalesRevenue} />
      <Route path="/sales/user-analytics" component={SalesUserAnalytics} />
      <Route path="/sales/product-performance" component={SalesProductPerformance} />
      <Route path="/events" component={EventsDashboard} />
      <Route path="/events/list" component={EventsList} />
      <Route path="/events/venues" component={EventsVenues} />
      <Route path="/events/checkin" component={EventsCheckin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/team" component={AdminTeam} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/ets" component={EtsDashboard} />
      <Route path="/ets/pipeline" component={EtsPipeline} />
      <Route path="/ets/clients/:id" component={EtsClientDetail} />
      <Route path="/ets/products" component={EtsProducts} />
      <Route path="/ets/calculator" component={EtsCalculator} />
      <Route path="/ets/orders" component={EtsOrders} />
      <Route path="/ets/payments" component={EtsPayments} />
      <Route path="/ets/proposals" component={EtsProposals} />
      <Route path="/ets/templates" component={EtsTemplates} />
      <Route path="/ets/settings" component={EtsSettings} />
      <Route path="/hub" component={HubDashboard} />
      <Route path="/hub/events/:id" component={HubEventDetail} />
      <Route path="/hub/events" component={HubEventsList} />
      <Route path="/hub/attendees" component={HubAttendees} />
      <Route path="/hub/checkin" component={HubCheckin} />
      <Route path="/hub/venues" component={HubVenues} />
      <Route path="/hub/vendors" component={HubVendors} />
      <Route path="/hub/budget" component={HubBudget} />
      <Route path="/hub/analytics" component={HubAnalytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function VerticalSync({ setCurrentVertical }: { setCurrentVertical: (id: string) => void }) {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (location === "/") {
      setLocation("/hr", { replace: true });
      return;
    }
    const detected = detectVerticalFromUrl(location);
    if (detected) {
      setCurrentVertical(detected.id);
    }
  }, [location, setCurrentVertical, setLocation]);
  return null;
}

function App() {
  const [currentVertical, setVerticalState] = useState<Vertical>(getStoredVertical);

  const setCurrentVertical = useCallback((id: string) => {
    setVerticalState((prev) => {
      const v = getVerticalById(id);
      if (v && v.id !== prev.id) {
        setStoredVerticalId(id);
        return v;
      }
      return prev;
    });
  }, []);

  return (
    <VerticalContext.Provider value={{ currentVertical, setCurrentVertical }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <VerticalSync setCurrentVertical={setCurrentVertical} />
          <div className="flex h-screen w-full flex-col">
            <AnnouncementBanner />
            <TopNavigation />
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </VerticalContext.Provider>
  );
}

export default App;
