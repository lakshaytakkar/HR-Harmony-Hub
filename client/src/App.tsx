import { useState, useCallback, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { TopNavigation } from "@/components/layout/top-navigation";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";
import { AIChatWidget } from "@/components/ai-chat/AIChatWidget";
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
import DesignSystem from "@/pages/dev/design-system";
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
import SalesCourseDetail from "@/pages/sales/course-detail";
import SalesHelpCenter from "@/pages/sales/help-center";
import SalesRevenue from "@/pages/sales/revenue";
import SalesUserAnalytics from "@/pages/sales/user-analytics";
import SalesProductPerformance from "@/pages/sales/product-performance";
import SalesClients from "@/pages/sales/clients";
import SalesLLCTracker from "@/pages/sales/llc-tracker";
import SalesUserDetail from "@/pages/sales/user-detail";
import SalesFreeLearning from "@/pages/sales/content-free-learning";
import SalesMentorshipSessions from "@/pages/sales/content-sessions";
import EventsDashboard from "@/pages/events/dashboard";
import EventsPackages from "@/pages/events/packages";
import EventsPackageDetail from "@/pages/events/package-detail";
import EventsLeads from "@/pages/events/leads";
import EventsBookings from "@/pages/events/bookings";
import EventsBookingDetail from "@/pages/events/booking-detail";
import EventsCalendar from "@/pages/events/calendar";
import EventsHotels from "@/pages/events/hotels";
import EventsVendors from "@/pages/events/vendors";
import EventsAnalytics from "@/pages/events/analytics";
import UniversalImportantContacts from "@/pages/universal/important-contacts";
import UniversalImageStudio from "@/pages/universal/image-studio";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTeam from "@/pages/admin/team";
import AdminSettings from "@/pages/admin/settings";

import DevDashboard from "@/pages/dev/dashboard";
import DevPrompts from "@/pages/dev/prompts";
import DevSkills from "@/pages/dev/skills";
import UniversalAppsCredentials from "@/pages/universal/apps-credentials";
import DevProjects from "@/pages/dev/projects";
import DevProjectBoard from "@/pages/dev/project-board";
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
import UniversalChat from "@/pages/universal/chat";
import UniversalTeam from "@/pages/universal/team";
import UniversalResources from "@/pages/universal/resources";
import UniversalTasks from "@/pages/universal/tasks";
import UniversalReports from "@/pages/universal/reports";
import UniversalNotifications from "@/pages/universal/notifications";
import UniversalTickets from "@/pages/universal/tickets";
import UniversalUsers from "@/pages/universal/users";
import UniversalUserGroups from "@/pages/universal/user-groups";
import UniversalTicketDetail from "@/pages/universal/ticket-detail";
import HrmsDashboard from "@/pages/hrms/dashboard";
import HrmsEmployees from "@/pages/hrms/employees";
import HrmsEmployeeDetail from "@/pages/hrms/employee-detail";
import HrmsOnboarding from "@/pages/hrms/onboarding";
import HrmsOrgChart from "@/pages/hrms/org-chart";
import HrmsDepartments from "@/pages/hrms/departments";
import HrmsAttendance from "@/pages/hrms/attendance";
import HrmsLeaves from "@/pages/hrms/leaves";
import HrmsHolidays from "@/pages/hrms/holidays";
import HrmsPayroll from "@/pages/hrms/payroll";
import HrmsPayslips from "@/pages/hrms/payslips";
import HrmsPerformance from "@/pages/hrms/performance";
import HrmsGoals from "@/pages/hrms/goals";
import HrmsPolicies from "@/pages/hrms/policies";
import AtsDashboard from "@/pages/ats/dashboard";
import AtsJobs from "@/pages/ats/jobs";
import AtsJobDetail from "@/pages/ats/job-detail";
import AtsCandidates from "@/pages/ats/candidates";
import AtsCandidateDetail from "@/pages/ats/candidate-detail";
import AtsPool from "@/pages/ats/pool";
import AtsApplications from "@/pages/ats/applications";
import AtsInterviews from "@/pages/ats/interviews";
import AtsEvaluations from "@/pages/ats/evaluations";
import AtsOffers from "@/pages/ats/offers";
import AtsAnalytics from "@/pages/ats/analytics";
import CrmDashboard from "@/pages/crm/dashboard";
import CrmLeads from "@/pages/crm/leads";
import CrmProspects from "@/pages/crm/prospects";
import CrmPipeline from "@/pages/crm/pipeline";
import CrmContacts from "@/pages/crm/contacts";
import CrmDeals from "@/pages/crm/deals";
import CrmActivities from "@/pages/crm/activities";
import CrmPerformance from "@/pages/crm/performance";
import CrmTemplates from "@/pages/crm/templates";
import CrmPaymentLinks from "@/pages/crm/payment-links";
import CrmAppointments from "@/pages/crm/appointments";
import FinanceDashboard from "@/pages/finance/dashboard";
import FinanceLedger from "@/pages/finance/ledger";
import FinanceTransactions from "@/pages/finance/transactions";
import FinanceJournal from "@/pages/finance/journal";
import FinanceIntercompany from "@/pages/finance/intercompany";
import FinancePayments from "@/pages/finance/payments";
import FinanceSharedExpenses from "@/pages/finance/shared-expenses";
import FinanceCashBook from "@/pages/finance/cashbook";
import FinanceCompliance from "@/pages/finance/compliance";

import OmsDashboard from "@/pages/oms/dashboard";
import OmsOrders from "@/pages/oms/orders";
import OmsInventory from "@/pages/oms/inventory";
import OmsProducts from "@/pages/oms/products";
import OmsShipments from "@/pages/oms/shipments";
import OmsPurchaseOrders from "@/pages/oms/purchase-orders";
import OmsSuppliers from "@/pages/oms/suppliers";
import OmsReturns from "@/pages/oms/returns";
import OmsLocations from "@/pages/oms/locations";

import SocialDashboard from "@/pages/social/dashboard";
import SocialPosts from "@/pages/social/posts";
import SocialPostDetail from "@/pages/social/post-detail";
import SocialComposer from "@/pages/social/composer";
import SocialCalendar from "@/pages/social/calendar";
import SocialMedia from "@/pages/social/media";
import SocialCampaigns from "@/pages/social/campaigns";
import SocialCampaignDetail from "@/pages/social/campaign-detail";
import SocialApprovals from "@/pages/social/approvals";
import SocialAssignments from "@/pages/social/assignments";
import SocialAnalytics from "@/pages/social/analytics";
import FaireDashboard from "@/pages/faire/dashboard";
import FaireStores from "@/pages/faire/stores";
import FaireProducts from "@/pages/faire/products";
import FaireProductDetail from "@/pages/faire/product-detail";
import FaireOrders from "@/pages/faire/orders";
import FaireOrderDetail from "@/pages/faire/order-detail";
import FaireFulfillment from "@/pages/faire/fulfillment";
import FaireShipments from "@/pages/faire/shipments";
import FaireRetailers from "@/pages/faire/retailers";
import FaireRetailerDetail from "@/pages/faire/retailer-detail";
import FaireAnalytics from "@/pages/faire/analytics";
import FaireQuotations from "@/pages/faire/quotations";
import FaireQuotationDetail from "@/pages/faire/quotation-detail";
import FairePartnerPortal from "@/pages/faire/partner-portal";
import FaireLedger from "@/pages/faire/ledger";
import FaireBankTransactions from "@/pages/faire/bank-transactions";

import PortalLayout from "@/components/portal/portal-layout";
import PortalLNDashboard from "@/pages/portal/legalnations/dashboard";
import PortalLNCompanies from "@/pages/portal/legalnations/companies";
import PortalLNDocuments from "@/pages/portal/legalnations/documents";
import PortalLNInvoices from "@/pages/portal/legalnations/invoices";
import PortalLNMessages from "@/pages/portal/legalnations/messages";
import FairePricing from "@/pages/faire/pricing";
import FaireVendors from "@/pages/faire/vendors";
import FaireInventory from "@/pages/faire/inventory";
import FaireApplications from "@/pages/faire/applications";
import FaireApplicationDetail from "@/pages/faire/application-detail";
import VendorQuotations from "@/pages/vendor-portal/quotations";
import VendorLedger from "@/pages/vendor-portal/ledger";
import SupransDashboard from "@/pages/suprans/dashboard";
import SupransInbound from "@/pages/suprans/inbound";
import SupransEnrichment from "@/pages/suprans/enrichment";
import SupransAssignments from "@/pages/suprans/assignments";
import EventHubLeads from "@/pages/eventhub/leads";

import RndDashboard from "@/pages/rnd/dashboard";
import RndProjectReports from "@/pages/rnd/project-reports";
import RndPitchIdeas from "@/pages/rnd/pitch-ideas";
import RndProductResearch from "@/pages/rnd/product-research";
import RndMarketIntelligence from "@/pages/rnd/market-intelligence";
import RndKeyFindings from "@/pages/rnd/key-findings";
import RndSaasReferences from "@/pages/rnd/saas-references";

function Router() {
  return (
    <Switch>
      <Route path="/suprans" component={SupransDashboard} />
      <Route path="/suprans/notifications" component={UniversalNotifications} />
      <Route path="/suprans/chat" component={UniversalChat} />
      <Route path="/suprans/team" component={UniversalTeam} />
      <Route path="/suprans/resources" component={UniversalResources} />
      <Route path="/suprans/tasks" component={UniversalTasks} />
      <Route path="/suprans/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/suprans/tickets" component={UniversalTickets} />
      <Route path="/suprans/inbound" component={SupransInbound} />
      <Route path="/suprans/enrichment" component={SupransEnrichment} />
      <Route path="/suprans/assignments" component={SupransAssignments} />
      <Route path="/suprans/reports" component={UniversalReports} />
      <Route path="/suprans/contacts" component={UniversalImportantContacts} />
      <Route path="/suprans/image-studio" component={UniversalImageStudio} />
      <Route path="/suprans/user-management" component={UniversalUsers} />
      <Route path="/suprans/user-groups" component={UniversalUserGroups} />
      <Route path="/suprans/apps" component={UniversalAppsCredentials} />
      <Route path="/legalnations" component={Dashboard} />
      <Route path="/legalnations/notifications" component={UniversalNotifications} />
      <Route path="/legalnations/chat" component={UniversalChat} />
      <Route path="/legalnations/team" component={UniversalTeam} />
      <Route path="/legalnations/resources" component={UniversalResources} />
      <Route path="/legalnations/tasks" component={UniversalTasks} />
      <Route path="/legalnations/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/legalnations/tickets" component={UniversalTickets} />
      <Route path="/legalnations/contacts" component={UniversalImportantContacts} />
      <Route path="/legalnations/reports" component={UniversalReports} />
      <Route path="/legalnations/image-studio" component={UniversalImageStudio} />
      <Route path="/legalnations/user-management" component={UniversalUsers} />
      <Route path="/legalnations/user-groups" component={UniversalUserGroups} />
      <Route path="/legalnations/apps" component={UniversalAppsCredentials} />
      <Route path="/legalnations/clients/:id" component={ClientDetail} />
      <Route path="/legalnations/clients" component={Clients} />
      <Route path="/legalnations/intake" component={ClientIntake} />
      <Route path="/legalnations/stages" component={StageOverview} />
      <Route path="/legalnations/pipeline" component={FormationPipeline} />
      <Route path="/legalnations/task-board" component={TaskBoard} />
      <Route path="/legalnations/escalations" component={Escalations} />
      <Route path="/legalnations/documents" component={DocumentVault} />
      <Route path="/legalnations/templates" component={Templates} />
      <Route path="/legalnations/compliance" component={ComplianceTracker} />
      <Route path="/legalnations/annual-reports" component={AnnualReports} />
      <Route path="/legalnations/analytics" component={FormationAnalytics} />
      <Route path="/legalnations/team-performance" component={TeamPerformance} />
      <Route path="/usdrop" component={SalesDashboard} />
      <Route path="/usdrop/notifications" component={UniversalNotifications} />
      <Route path="/usdrop/chat" component={UniversalChat} />
      <Route path="/usdrop/team" component={UniversalTeam} />
      <Route path="/usdrop/resources" component={UniversalResources} />
      <Route path="/usdrop/tasks" component={UniversalTasks} />
      <Route path="/usdrop/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/usdrop/contacts" component={UniversalImportantContacts} />
      <Route path="/usdrop/reports" component={UniversalReports} />
      <Route path="/usdrop/image-studio" component={UniversalImageStudio} />
      <Route path="/usdrop/user-management" component={UniversalUsers} />
      <Route path="/usdrop/user-groups" component={UniversalUserGroups} />
      <Route path="/usdrop/apps" component={UniversalAppsCredentials} />
      <Route path="/usdrop/products" component={SalesProducts} />
      <Route path="/usdrop/categories" component={SalesCategories} />
      <Route path="/usdrop/suppliers" component={SalesSuppliers} />
      <Route path="/usdrop/winning-products" component={SalesWinningProducts} />
      <Route path="/usdrop/users/:id" component={SalesUserDetail} />
      <Route path="/usdrop/users" component={SalesUsers} />
      <Route path="/usdrop/clients" component={SalesClients} />
      <Route path="/usdrop/llc" component={SalesLLCTracker} />
      <Route path="/usdrop/leads" component={SalesLeads} />
      <Route path="/usdrop/plans" component={SalesPlans} />
      <Route path="/usdrop/subscriptions" component={SalesSubscriptions} />
      <Route path="/usdrop/stores" component={SalesStores} />
      <Route path="/usdrop/fulfillment" component={SalesFulfillment} />
      <Route path="/usdrop/competitors" component={SalesCompetitors} />
      <Route path="/usdrop/tickets" component={UniversalTickets} />
      <Route path="/usdrop/courses/:id" component={SalesCourseDetail} />
      <Route path="/usdrop/courses" component={SalesCourses} />
      <Route path="/usdrop/content/free-learning" component={SalesFreeLearning} />
      <Route path="/usdrop/content/sessions" component={SalesMentorshipSessions} />
      <Route path="/usdrop/help-center" component={SalesHelpCenter} />
      <Route path="/usdrop/revenue" component={SalesRevenue} />
      <Route path="/usdrop/user-analytics" component={SalesUserAnalytics} />
      <Route path="/usdrop/product-performance" component={SalesProductPerformance} />
      <Route path="/goyotours" component={EventsDashboard} />
      <Route path="/goyotours/notifications" component={UniversalNotifications} />
      <Route path="/goyotours/chat" component={UniversalChat} />
      <Route path="/goyotours/team" component={UniversalTeam} />
      <Route path="/goyotours/resources" component={UniversalResources} />
      <Route path="/goyotours/tasks" component={UniversalTasks} />
      <Route path="/goyotours/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/goyotours/tickets" component={UniversalTickets} />
      <Route path="/goyotours/packages/:id" component={EventsPackageDetail} />
      <Route path="/goyotours/packages" component={EventsPackages} />
      <Route path="/goyotours/leads" component={EventsLeads} />
      <Route path="/goyotours/bookings/:id" component={EventsBookingDetail} />
      <Route path="/goyotours/calendar" component={EventsCalendar} />
      <Route path="/goyotours/bookings" component={EventsBookings} />
      <Route path="/goyotours/hotels" component={EventsHotels} />
      <Route path="/goyotours/vendors" component={EventsVendors} />
      <Route path="/goyotours/analytics" component={EventsAnalytics} />
      <Route path="/goyotours/contacts" component={UniversalImportantContacts} />
      <Route path="/goyotours/reports" component={UniversalReports} />
      <Route path="/goyotours/image-studio" component={UniversalImageStudio} />
      <Route path="/goyotours/user-management" component={UniversalUsers} />
      <Route path="/goyotours/user-groups" component={UniversalUserGroups} />
      <Route path="/goyotours/apps" component={UniversalAppsCredentials} />
      <Route path="/eventhub" component={HubDashboard} />
      <Route path="/eventhub/notifications" component={UniversalNotifications} />
      <Route path="/eventhub/chat" component={UniversalChat} />
      <Route path="/eventhub/team" component={UniversalTeam} />
      <Route path="/eventhub/resources" component={UniversalResources} />
      <Route path="/eventhub/tasks" component={UniversalTasks} />
      <Route path="/eventhub/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/eventhub/tickets" component={UniversalTickets} />
      <Route path="/eventhub/contacts" component={UniversalImportantContacts} />
      <Route path="/eventhub/reports" component={UniversalReports} />
      <Route path="/eventhub/image-studio" component={UniversalImageStudio} />
      <Route path="/eventhub/user-management" component={UniversalUsers} />
      <Route path="/eventhub/user-groups" component={UniversalUserGroups} />
      <Route path="/eventhub/apps" component={UniversalAppsCredentials} />
      <Route path="/eventhub/events/:id" component={HubEventDetail} />
      <Route path="/eventhub/events" component={HubEventsList} />
      <Route path="/eventhub/attendees" component={HubAttendees} />
      <Route path="/eventhub/checkin" component={HubCheckin} />
      <Route path="/eventhub/venues" component={HubVenues} />
      <Route path="/eventhub/vendors" component={HubVendors} />
      <Route path="/eventhub/budget" component={HubBudget} />
      <Route path="/eventhub/analytics" component={HubAnalytics} />
      <Route path="/eventhub/leads" component={EventHubLeads} />
      <Route path="/lbm" component={AdminDashboard} />
      <Route path="/lbm/notifications" component={UniversalNotifications} />
      <Route path="/lbm/chat" component={UniversalChat} />
      <Route path="/lbm/team" component={UniversalTeam} />
      <Route path="/lbm/resources" component={UniversalResources} />
      <Route path="/lbm/tasks" component={UniversalTasks} />
      <Route path="/lbm/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/lbm/tickets" component={UniversalTickets} />
      <Route path="/lbm/contacts" component={UniversalImportantContacts} />
      <Route path="/lbm/team-reports" component={UniversalReports} />
      <Route path="/lbm/image-studio" component={UniversalImageStudio} />
      <Route path="/lbm/user-management" component={UniversalUsers} />
      <Route path="/lbm/user-groups" component={UniversalUserGroups} />
      <Route path="/lbm/apps" component={UniversalAppsCredentials} />
      <Route path="/lbm/settings" component={AdminSettings} />
      <Route path="/lbm/reports" component={UniversalReports} />
      <Route path="/dev" component={DevDashboard} />
      <Route path="/dev/notifications" component={UniversalNotifications} />
      <Route path="/dev/chat" component={UniversalChat} />
      <Route path="/dev/team" component={UniversalTeam} />
      <Route path="/dev/resources" component={UniversalResources} />
      <Route path="/dev/tasks" component={UniversalTasks} />
      <Route path="/dev/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/dev/tickets" component={UniversalTickets} />
      <Route path="/dev/contacts" component={UniversalImportantContacts} />
      <Route path="/dev/reports" component={UniversalReports} />
      <Route path="/dev/image-studio" component={UniversalImageStudio} />
      <Route path="/dev/user-management" component={UniversalUsers} />
      <Route path="/dev/user-groups" component={UniversalUserGroups} />
      <Route path="/dev/apps" component={UniversalAppsCredentials} />
      <Route path="/dev/design-system" component={DesignSystem} />
      <Route path="/dev/prompts" component={DevPrompts} />
      <Route path="/dev/skills" component={DevSkills} />
      <Route path="/dev/projects/:id" component={DevProjectBoard} />
      <Route path="/dev/projects" component={DevProjects} />

      <Route path="/ets" component={EtsDashboard} />
      <Route path="/ets/notifications" component={UniversalNotifications} />
      <Route path="/ets/chat" component={UniversalChat} />
      <Route path="/ets/team" component={UniversalTeam} />
      <Route path="/ets/resources" component={UniversalResources} />
      <Route path="/ets/tasks" component={UniversalTasks} />
      <Route path="/ets/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/ets/tickets" component={UniversalTickets} />
      <Route path="/ets/contacts" component={UniversalImportantContacts} />
      <Route path="/ets/reports" component={UniversalReports} />
      <Route path="/ets/image-studio" component={UniversalImageStudio} />
      <Route path="/ets/user-management" component={UniversalUsers} />
      <Route path="/ets/user-groups" component={UniversalUserGroups} />
      <Route path="/ets/apps" component={UniversalAppsCredentials} />
      <Route path="/ets/pipeline" component={EtsPipeline} />
      <Route path="/ets/clients/:id" component={EtsClientDetail} />
      <Route path="/ets/products" component={EtsProducts} />
      <Route path="/ets/calculator" component={EtsCalculator} />
      <Route path="/ets/orders" component={EtsOrders} />
      <Route path="/ets/payments" component={EtsPayments} />
      <Route path="/ets/proposals" component={EtsProposals} />
      <Route path="/ets/templates" component={EtsTemplates} />
      <Route path="/ets/settings" component={EtsSettings} />
      <Route path="/hrms" component={HrmsDashboard} />
      <Route path="/hrms/notifications" component={UniversalNotifications} />
      <Route path="/hrms/chat" component={UniversalChat} />
      <Route path="/hrms/team" component={UniversalTeam} />
      <Route path="/hrms/resources" component={UniversalResources} />
      <Route path="/hrms/tasks" component={UniversalTasks} />
      <Route path="/hrms/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/hrms/tickets" component={UniversalTickets} />
      <Route path="/hrms/contacts" component={UniversalImportantContacts} />
      <Route path="/hrms/reports" component={UniversalReports} />
      <Route path="/hrms/image-studio" component={UniversalImageStudio} />
      <Route path="/hrms/user-management" component={UniversalUsers} />
      <Route path="/hrms/user-groups" component={UniversalUserGroups} />
      <Route path="/hrms/apps" component={UniversalAppsCredentials} />
      <Route path="/hrms/employees/:id" component={HrmsEmployeeDetail} />
      <Route path="/hrms/employees" component={HrmsEmployees} />
      <Route path="/hrms/onboarding" component={HrmsOnboarding} />
      <Route path="/hrms/org" component={HrmsOrgChart} />
      <Route path="/hrms/departments" component={HrmsDepartments} />
      <Route path="/hrms/attendance" component={HrmsAttendance} />
      <Route path="/hrms/leaves" component={HrmsLeaves} />
      <Route path="/hrms/holidays" component={HrmsHolidays} />
      <Route path="/hrms/payroll" component={HrmsPayroll} />
      <Route path="/hrms/payslips" component={HrmsPayslips} />
      <Route path="/hrms/performance" component={HrmsPerformance} />
      <Route path="/hrms/goals" component={HrmsGoals} />
      <Route path="/hrms/policies" component={HrmsPolicies} />
      <Route path="/ats" component={AtsDashboard} />
      <Route path="/ats/notifications" component={UniversalNotifications} />
      <Route path="/ats/chat" component={UniversalChat} />
      <Route path="/ats/team" component={UniversalTeam} />
      <Route path="/ats/resources" component={UniversalResources} />
      <Route path="/ats/tasks" component={UniversalTasks} />
      <Route path="/ats/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/ats/tickets" component={UniversalTickets} />
      <Route path="/ats/contacts" component={UniversalImportantContacts} />
      <Route path="/ats/reports" component={UniversalReports} />
      <Route path="/ats/image-studio" component={UniversalImageStudio} />
      <Route path="/ats/user-management" component={UniversalUsers} />
      <Route path="/ats/user-groups" component={UniversalUserGroups} />
      <Route path="/ats/apps" component={UniversalAppsCredentials} />
      <Route path="/ats/jobs/:id" component={AtsJobDetail} />
      <Route path="/ats/jobs" component={AtsJobs} />
      <Route path="/ats/candidates/:id" component={AtsCandidateDetail} />
      <Route path="/ats/candidates" component={AtsCandidates} />
      <Route path="/ats/pool" component={AtsPool} />
      <Route path="/ats/applications" component={AtsApplications} />
      <Route path="/ats/interviews" component={AtsInterviews} />
      <Route path="/ats/evaluations" component={AtsEvaluations} />
      <Route path="/ats/offers" component={AtsOffers} />
      <Route path="/ats/analytics" component={AtsAnalytics} />
      <Route path="/crm" component={CrmDashboard} />
      <Route path="/crm/notifications" component={UniversalNotifications} />
      <Route path="/crm/chat" component={UniversalChat} />
      <Route path="/crm/team" component={UniversalTeam} />
      <Route path="/crm/resources" component={UniversalResources} />
      <Route path="/crm/tasks" component={UniversalTasks} />
      <Route path="/crm/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/crm/tickets" component={UniversalTickets} />
      <Route path="/crm/reports" component={UniversalReports} />
      <Route path="/crm/image-studio" component={UniversalImageStudio} />
      <Route path="/crm/user-management" component={UniversalUsers} />
      <Route path="/crm/user-groups" component={UniversalUserGroups} />
      <Route path="/crm/apps" component={UniversalAppsCredentials} />
      <Route path="/crm/contacts-important" component={UniversalImportantContacts} />
      <Route path="/crm/leads" component={CrmLeads} />
      <Route path="/crm/prospects" component={CrmProspects} />
      <Route path="/crm/pipeline" component={CrmPipeline} />
      <Route path="/crm/contacts" component={CrmContacts} />
      <Route path="/crm/deals" component={CrmDeals} />
      <Route path="/crm/activities" component={CrmActivities} />
      <Route path="/crm/performance" component={CrmPerformance} />
      <Route path="/crm/payment-links" component={CrmPaymentLinks} />
      <Route path="/crm/appointments" component={CrmAppointments} />
      <Route path="/crm/templates" component={CrmTemplates} />
      <Route path="/finance" component={FinanceDashboard} />
      <Route path="/finance/notifications" component={UniversalNotifications} />
      <Route path="/finance/chat" component={UniversalChat} />
      <Route path="/finance/team" component={UniversalTeam} />
      <Route path="/finance/resources" component={UniversalResources} />
      <Route path="/finance/tasks" component={UniversalTasks} />
      <Route path="/finance/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/finance/tickets" component={UniversalTickets} />
      <Route path="/finance/contacts-important" component={UniversalImportantContacts} />
      <Route path="/finance/image-studio" component={UniversalImageStudio} />
      <Route path="/finance/user-management" component={UniversalUsers} />
      <Route path="/finance/user-groups" component={UniversalUserGroups} />
      <Route path="/finance/apps" component={UniversalAppsCredentials} />
      <Route path="/finance/ledger" component={FinanceLedger} />
      <Route path="/finance/transactions" component={FinanceTransactions} />
      <Route path="/finance/journal" component={FinanceJournal} />
      <Route path="/finance/intercompany" component={FinanceIntercompany} />
      <Route path="/finance/payments" component={FinancePayments} />
      <Route path="/finance/shared-expenses" component={FinanceSharedExpenses} />
      <Route path="/finance/cashbook" component={FinanceCashBook} />
      <Route path="/finance/compliance" component={FinanceCompliance} />
      <Route path="/finance/reports" component={UniversalReports} />
      <Route path="/oms" component={OmsDashboard} />
      <Route path="/oms/notifications" component={UniversalNotifications} />
      <Route path="/oms/chat" component={UniversalChat} />
      <Route path="/oms/team" component={UniversalTeam} />
      <Route path="/oms/resources" component={UniversalResources} />
      <Route path="/oms/tasks" component={UniversalTasks} />
      <Route path="/oms/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/oms/tickets" component={UniversalTickets} />
      <Route path="/oms/contacts-important" component={UniversalImportantContacts} />
      <Route path="/oms/image-studio" component={UniversalImageStudio} />
      <Route path="/oms/user-management" component={UniversalUsers} />
      <Route path="/oms/user-groups" component={UniversalUserGroups} />
      <Route path="/oms/apps" component={UniversalAppsCredentials} />
      <Route path="/oms/orders" component={OmsOrders} />
      <Route path="/oms/inventory" component={OmsInventory} />
      <Route path="/oms/products" component={OmsProducts} />
      <Route path="/oms/shipments" component={OmsShipments} />
      <Route path="/oms/purchase-orders" component={OmsPurchaseOrders} />
      <Route path="/oms/suppliers" component={OmsSuppliers} />
      <Route path="/oms/returns" component={OmsReturns} />
      <Route path="/oms/locations" component={OmsLocations} />
      <Route path="/oms/reports" component={UniversalReports} />
      <Route path="/social" component={SocialDashboard} />
      <Route path="/social/notifications" component={UniversalNotifications} />
      <Route path="/social/chat" component={UniversalChat} />
      <Route path="/social/team" component={UniversalTeam} />
      <Route path="/social/resources" component={UniversalResources} />
      <Route path="/social/tasks" component={UniversalTasks} />
      <Route path="/social/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/social/tickets" component={UniversalTickets} />
      <Route path="/social/contacts" component={UniversalImportantContacts} />
      <Route path="/social/reports" component={UniversalReports} />
      <Route path="/social/image-studio" component={UniversalImageStudio} />
      <Route path="/social/user-management" component={UniversalUsers} />
      <Route path="/social/user-groups" component={UniversalUserGroups} />
      <Route path="/social/apps" component={UniversalAppsCredentials} />
      <Route path="/social/posts/:id" component={SocialPostDetail} />
      <Route path="/social/posts" component={SocialPosts} />
      <Route path="/social/composer" component={SocialComposer} />
      <Route path="/social/calendar" component={SocialCalendar} />
      <Route path="/social/media" component={SocialMedia} />
      <Route path="/social/campaigns/:id" component={SocialCampaignDetail} />
      <Route path="/social/campaigns" component={SocialCampaigns} />
      <Route path="/social/approvals" component={SocialApprovals} />
      <Route path="/social/assignments" component={SocialAssignments} />
      <Route path="/social/analytics" component={SocialAnalytics} />
      <Route path="/faire" component={FaireDashboard} />
      <Route path="/faire/notifications" component={UniversalNotifications} />
      <Route path="/faire/chat" component={UniversalChat} />
      <Route path="/faire/team" component={UniversalTeam} />
      <Route path="/faire/resources" component={UniversalResources} />
      <Route path="/faire/tasks" component={UniversalTasks} />
      <Route path="/faire/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/faire/tickets" component={UniversalTickets} />
      <Route path="/faire/contacts" component={UniversalImportantContacts} />
      <Route path="/faire/reports" component={UniversalReports} />
      <Route path="/faire/image-studio" component={UniversalImageStudio} />
      <Route path="/faire/user-management" component={UniversalUsers} />
      <Route path="/faire/user-groups" component={UniversalUserGroups} />
      <Route path="/faire/apps" component={UniversalAppsCredentials} />
      <Route path="/faire/stores" component={FaireStores} />
      <Route path="/faire/products/:id" component={FaireProductDetail} />
      <Route path="/faire/products" component={FaireProducts} />
      <Route path="/faire/orders/:id" component={FaireOrderDetail} />
      <Route path="/faire/orders" component={FaireOrders} />
      <Route path="/faire/fulfillment" component={FaireFulfillment} />
      <Route path="/faire/shipments" component={FaireShipments} />
      <Route path="/faire/retailers/:id" component={FaireRetailerDetail} />
      <Route path="/faire/retailers" component={FaireRetailers} />
      <Route path="/faire/quotations/:id" component={FaireQuotationDetail} />
      <Route path="/faire/quotations" component={FaireQuotations} />
      <Route path="/faire/partner-portal" component={FairePartnerPortal} />
      <Route path="/faire/ledger" component={FaireLedger} />
      <Route path="/faire/bank-transactions" component={FaireBankTransactions} />
      <Route path="/faire/vendors" component={FaireVendors} />
      <Route path="/faire/inventory" component={FaireInventory} />
      <Route path="/faire/pricing" component={FairePricing} />
      <Route path="/faire/analytics" component={FaireAnalytics} />
      <Route path="/faire/applications/:id" component={FaireApplicationDetail} />
      <Route path="/faire/applications" component={FaireApplications} />
      <Route path="/vendor/quotations" component={VendorQuotations} />
      <Route path="/vendor/ledger" component={VendorLedger} />
      <Route path="/vendor/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/vendor/tickets" component={UniversalTickets} />
      <Route path="/rnd" component={RndDashboard} />
      <Route path="/rnd/notifications" component={UniversalNotifications} />
      <Route path="/rnd/chat" component={UniversalChat} />
      <Route path="/rnd/team" component={UniversalTeam} />
      <Route path="/rnd/resources" component={UniversalResources} />
      <Route path="/rnd/tasks" component={UniversalTasks} />
      <Route path="/rnd/tickets/:id" component={UniversalTicketDetail} />
      <Route path="/rnd/tickets" component={UniversalTickets} />
      <Route path="/rnd/contacts" component={UniversalImportantContacts} />
      <Route path="/rnd/reports" component={UniversalReports} />
      <Route path="/rnd/image-studio" component={UniversalImageStudio} />
      <Route path="/rnd/user-management" component={UniversalUsers} />
      <Route path="/rnd/user-groups" component={UniversalUserGroups} />
      <Route path="/rnd/apps" component={UniversalAppsCredentials} />
      <Route path="/rnd/project-reports" component={RndProjectReports} />
      <Route path="/rnd/pitch-ideas" component={RndPitchIdeas} />
      <Route path="/rnd/product-research" component={RndProductResearch} />
      <Route path="/rnd/market-intelligence" component={RndMarketIntelligence} />
      <Route path="/rnd/key-findings" component={RndKeyFindings} />
      <Route path="/rnd/saas-references" component={RndSaasReferences} />
      <Route component={NotFound} />
    </Switch>
  );
}

function PortalRouter() {
  return (
    <Switch>
      <Route path="/portal/legalnations/companies" component={PortalLNCompanies} />
      <Route path="/portal/legalnations/documents" component={PortalLNDocuments} />
      <Route path="/portal/legalnations/invoices" component={PortalLNInvoices} />
      <Route path="/portal/legalnations/messages" component={PortalLNMessages} />
      <Route path="/portal/legalnations" component={PortalLNDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function VerticalSync({ setCurrentVertical }: { setCurrentVertical: (id: string) => void }) {
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (location === "/") {
      setLocation("/legalnations", { replace: true });
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

  const [loc] = useLocation();
  const isPortal = loc.startsWith("/portal/");

  return (
    <VerticalContext.Provider value={{ currentVertical, setCurrentVertical }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <VerticalSync setCurrentVertical={setCurrentVertical} />
          {isPortal ? (
            <PortalLayout>
              <PortalRouter />
            </PortalLayout>
          ) : (
            <div className="flex h-screen w-full flex-col">
              <AnnouncementBanner />
              <TopNavigation />
              <main className="flex-1 overflow-auto">
                <Router />
              </main>
            </div>
          )}
          <Toaster />
          {!isPortal && <PwaInstallPrompt />}
          {!isPortal && <AIChatWidget />}
        </TooltipProvider>
      </QueryClientProvider>
    </VerticalContext.Provider>
  );
}

export default App;
