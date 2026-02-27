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
import Employees from "@/pages/employees";
import Candidates from "@/pages/candidates";
import Departments from "@/pages/departments";
import JobPostings from "@/pages/job-postings";
import LeaveManagement from "@/pages/leave-management";
import Attendance from "@/pages/attendance";
import Documents from "@/pages/documents";
import Payroll from "@/pages/payroll";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import StyleGuide from "@/pages/style-guide";
import ComponentsGuide from "@/pages/components-guide";
import IconsGuide from "@/pages/icons-guide";
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

function Router() {
  return (
    <Switch>
      <Route path="/hr" component={Dashboard} />
      <Route path="/hr/employees" component={Employees} />
      <Route path="/hr/candidates" component={Candidates} />
      <Route path="/hr/departments" component={Departments} />
      <Route path="/hr/job-postings" component={JobPostings} />
      <Route path="/hr/leave" component={LeaveManagement} />
      <Route path="/hr/attendance" component={Attendance} />
      <Route path="/hr/documents" component={Documents} />
      <Route path="/hr/payroll" component={Payroll} />
      <Route path="/hr/projects/:id" component={ProjectDetail} />
      <Route path="/hr/projects" component={Projects} />
      <Route path="/dev/style-guide" component={StyleGuide} />
      <Route path="/dev/components" component={ComponentsGuide} />
      <Route path="/dev/icons" component={IconsGuide} />
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
