import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Candidates from "@/pages/candidates";
import Departments from "@/pages/departments";
import JobPostings from "@/pages/job-postings";
import LeaveManagement from "@/pages/leave-management";
import Attendance from "@/pages/attendance";
import Documents from "@/pages/documents";
import StyleGuide from "@/pages/style-guide";
import ComponentsGuide from "@/pages/components-guide";
import IconsGuide from "@/pages/icons-guide";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/departments" component={Departments} />
      <Route path="/job-postings" component={JobPostings} />
      <Route path="/leave" component={LeaveManagement} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/documents" component={Documents} />
      <Route path="/dev/style-guide" component={StyleGuide} />
      <Route path="/dev/components" component={ComponentsGuide} />
      <Route path="/dev/icons" component={IconsGuide} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "3rem",
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-hidden">
              <Router />
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
