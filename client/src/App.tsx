import { useState, useCallback, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { TopNavigation } from "@/components/layout/top-navigation";
import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";
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
import AdminDashboard from "@/pages/admin/dashboard";
import AdminTeam from "@/pages/admin/team";
import AdminSettings from "@/pages/admin/settings";

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
import UniversalChat from "@/pages/universal/chat";
import UniversalTeam from "@/pages/universal/team";
import UniversalResources from "@/pages/universal/resources";
import UniversalTasks from "@/pages/universal/tasks";
import UniversalReports from "@/pages/universal/reports";
import UniversalNotifications from "@/pages/universal/notifications";
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
import FaireVendors from "@/pages/faire/vendors";
import FaireInventory from "@/pages/faire/inventory";
import FaireApplications from "@/pages/faire/applications";
import FaireApplicationDetail from "@/pages/faire/application-detail";
import SupransDashboard from "@/pages/suprans/dashboard";
import SupransInbound from "@/pages/suprans/inbound";
import SupransEnrichment from "@/pages/suprans/enrichment";
import SupransAssignments from "@/pages/suprans/assignments";
import EventHubLeads from "@/pages/eventhub/leads";

function Router() {
  return (
    <Switch>
      <Route path="/suprans" component={SupransDashboard} />
      <Route path="/suprans/notifications" component={UniversalNotifications} />
      <Route path="/suprans/chat" component={UniversalChat} />
      <Route path="/suprans/team" component={UniversalTeam} />
      <Route path="/suprans/resources" component={UniversalResources} />
      <Route path="/suprans/tasks" component={UniversalTasks} />
      <Route path="/suprans/inbound" component={SupransInbound} />
      <Route path="/suprans/enrichment" component={SupransEnrichment} />
      <Route path="/suprans/assignments" component={SupransAssignments} />
      <Route path="/suprans/reports" component={UniversalReports} />
      <Route path="/suprans/contacts-important" component={UniversalImportantContacts} />
      <Route path="/hr" component={Dashboard} />
      <Route path="/hr/notifications" component={UniversalNotifications} />
      <Route path="/hr/chat" component={UniversalChat} />
      <Route path="/hr/team" component={UniversalTeam} />
      <Route path="/hr/resources" component={UniversalResources} />
      <Route path="/hr/tasks" component={UniversalTasks} />
      <Route path="/hr/contacts" component={UniversalImportantContacts} />
      <Route path="/hr/reports" component={UniversalReports} />
      <Route path="/hr/clients/:id" component={ClientDetail} />
      <Route path="/hr/clients" component={Clients} />
      <Route path="/hr/intake" component={ClientIntake} />
      <Route path="/hr/stages" component={StageOverview} />
      <Route path="/hr/pipeline" component={FormationPipeline} />
      <Route path="/hr/task-board" component={TaskBoard} />
      <Route path="/hr/escalations" component={Escalations} />
      <Route path="/hr/documents" component={DocumentVault} />
      <Route path="/hr/templates" component={Templates} />
      <Route path="/hr/compliance" component={ComplianceTracker} />
      <Route path="/hr/annual-reports" component={AnnualReports} />
      <Route path="/hr/analytics" component={FormationAnalytics} />
      <Route path="/hr/team-performance" component={TeamPerformance} />
      <Route path="/sales" component={SalesDashboard} />
      <Route path="/sales/chat" component={UniversalChat} />
      <Route path="/sales/team" component={UniversalTeam} />
      <Route path="/sales/resources" component={UniversalResources} />
      <Route path="/sales/tasks" component={UniversalTasks} />
      <Route path="/sales/contacts" component={UniversalImportantContacts} />
      <Route path="/sales/reports" component={UniversalReports} />
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
      <Route path="/events/chat" component={UniversalChat} />
      <Route path="/events/team" component={UniversalTeam} />
      <Route path="/events/resources" component={UniversalResources} />
      <Route path="/events/tasks" component={UniversalTasks} />
      <Route path="/events/packages/:id" component={EventsPackageDetail} />
      <Route path="/events/packages" component={EventsPackages} />
      <Route path="/events/leads" component={EventsLeads} />
      <Route path="/events/bookings/:id" component={EventsBookingDetail} />
      <Route path="/events/calendar" component={EventsCalendar} />
      <Route path="/events/bookings" component={EventsBookings} />
      <Route path="/events/hotels" component={EventsHotels} />
      <Route path="/events/vendors" component={EventsVendors} />
      <Route path="/events/analytics" component={EventsAnalytics} />
      <Route path="/events/contacts" component={UniversalImportantContacts} />
      <Route path="/events/reports" component={UniversalReports} />
      <Route path="/hub" component={HubDashboard} />
      <Route path="/hub/chat" component={UniversalChat} />
      <Route path="/hub/team" component={UniversalTeam} />
      <Route path="/hub/resources" component={UniversalResources} />
      <Route path="/hub/tasks" component={UniversalTasks} />
      <Route path="/hub/contacts" component={UniversalImportantContacts} />
      <Route path="/hub/reports" component={UniversalReports} />
      <Route path="/hub/events/:id" component={HubEventDetail} />
      <Route path="/hub/events" component={HubEventsList} />
      <Route path="/hub/attendees" component={HubAttendees} />
      <Route path="/hub/checkin" component={HubCheckin} />
      <Route path="/hub/venues" component={HubVenues} />
      <Route path="/hub/vendors" component={HubVendors} />
      <Route path="/hub/budget" component={HubBudget} />
      <Route path="/hub/analytics" component={HubAnalytics} />
      <Route path="/hub/leads" component={EventHubLeads} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/chat" component={UniversalChat} />
      <Route path="/admin/team" component={UniversalTeam} />
      <Route path="/admin/resources" component={UniversalResources} />
      <Route path="/admin/tasks" component={UniversalTasks} />
      <Route path="/admin/contacts" component={UniversalImportantContacts} />
      <Route path="/admin/team-reports" component={UniversalReports} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={UniversalReports} />
      <Route path="/dev" component={DevDashboard} />
      <Route path="/dev/chat" component={UniversalChat} />
      <Route path="/dev/team" component={UniversalTeam} />
      <Route path="/dev/resources" component={UniversalResources} />
      <Route path="/dev/tasks" component={UniversalTasks} />
      <Route path="/dev/contacts" component={UniversalImportantContacts} />
      <Route path="/dev/reports" component={UniversalReports} />
      <Route path="/dev/style-guide" component={StyleGuide} />
      <Route path="/dev/components" component={ComponentsGuide} />
      <Route path="/dev/icons" component={IconsGuide} />
      <Route path="/dev/prompts" component={DevPrompts} />
      <Route path="/dev/knowledge-base" component={DevResources} />
      <Route path="/dev/toolkit" component={DevToolkit} />
      <Route path="/dev/projects/:id" component={DevProjectBoard} />
      <Route path="/dev/projects" component={DevProjects} />
      <Route path="/dev/board" component={DevTasks} />
      <Route path="/ets" component={EtsDashboard} />
      <Route path="/ets/notifications" component={UniversalNotifications} />
      <Route path="/ets/chat" component={UniversalChat} />
      <Route path="/ets/team" component={UniversalTeam} />
      <Route path="/ets/resources" component={UniversalResources} />
      <Route path="/ets/tasks" component={UniversalTasks} />
      <Route path="/ets/contacts" component={UniversalImportantContacts} />
      <Route path="/ets/reports" component={UniversalReports} />
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
      <Route path="/hrms/contacts" component={UniversalImportantContacts} />
      <Route path="/hrms/reports" component={UniversalReports} />
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
      <Route path="/ats/contacts" component={UniversalImportantContacts} />
      <Route path="/ats/reports" component={UniversalReports} />
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
      <Route path="/crm/reports" component={UniversalReports} />
      <Route path="/crm/contacts-important" component={UniversalImportantContacts} />
      <Route path="/crm/leads" component={CrmLeads} />
      <Route path="/crm/prospects" component={CrmProspects} />
      <Route path="/crm/pipeline" component={CrmPipeline} />
      <Route path="/crm/contacts" component={CrmContacts} />
      <Route path="/crm/deals" component={CrmDeals} />
      <Route path="/crm/activities" component={CrmActivities} />
      <Route path="/crm/performance" component={CrmPerformance} />
      <Route path="/crm/payment-links" component={CrmPaymentLinks} />
      <Route path="/crm/templates" component={CrmTemplates} />
      <Route path="/finance" component={FinanceDashboard} />
      <Route path="/finance/notifications" component={UniversalNotifications} />
      <Route path="/finance/chat" component={UniversalChat} />
      <Route path="/finance/team" component={UniversalTeam} />
      <Route path="/finance/resources" component={UniversalResources} />
      <Route path="/finance/tasks" component={UniversalTasks} />
      <Route path="/finance/contacts-important" component={UniversalImportantContacts} />
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
      <Route path="/oms/contacts-important" component={UniversalImportantContacts} />
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
      <Route path="/social/contacts" component={UniversalImportantContacts} />
      <Route path="/social/reports" component={UniversalReports} />
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
      <Route path="/faire/contacts" component={UniversalImportantContacts} />
      <Route path="/faire/reports" component={UniversalReports} />
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
      <Route path="/faire/analytics" component={FaireAnalytics} />
      <Route path="/faire/applications/:id" component={FaireApplicationDetail} />
      <Route path="/faire/applications" component={FaireApplications} />
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
          <PwaInstallPrompt />
        </TooltipProvider>
      </QueryClientProvider>
    </VerticalContext.Provider>
  );
}

export default App;
