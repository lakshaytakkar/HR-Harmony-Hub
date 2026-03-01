import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  MoreVertical
} from "lucide-react";
import { detectVerticalFromUrl } from "@/lib/verticals-config";
import { verticalMembers, type VerticalMember } from "@/lib/mock-data-shared";
import { getPersonAvatar } from "@/lib/avatars";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { PageTransition, Stagger, StaggerItem, Fade } from "@/components/ui/animated";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormDialog } from "@/components/hr/form-dialog";
import { Label } from "@/components/ui/label";
import { 
  PageHeader, 
  PageShell,
  DetailModal,
  DetailSection
} from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function UniversalTeam() {
  const [location] = useLocation();
  const vertical = detectVerticalFromUrl(location);
  const isLoading = useSimulatedLoading(800);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const members = useMemo(() => {
    if (!vertical) return [];
    return verticalMembers.filter(m => m.verticalId === vertical.id);
  }, [vertical]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter === "all" || m.department === deptFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [members, searchQuery, deptFilter, statusFilter]);

  const departments = useMemo(() => {
    const depts = new Set(members.map(m => m.department));
    return Array.from(depts);
  }, [members]);

  const stats = useMemo(() => {
    return {
      total: members.length,
      online: members.filter(m => m.status === "online").length,
      departments: departments.length
    };
  }, [members, departments]);

  const getStatusColor = (status: VerticalMember["status"]) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "away": return "bg-amber-500";
      case "offline": return "bg-slate-400";
      default: return "bg-slate-400";
    }
  };

  const getAvatarFallbackColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-cyan-500", "bg-teal-500",
      "bg-emerald-500", "bg-orange-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!vertical) return null;

  return (
    <PageShell>
      <PageHeader
        title="Team Members"
        subtitle={`Manage and connect with the ${vertical.name} team.`}
        actions={
          <Button 
            onClick={() => setIsInviteOpen(true)}
            style={{ backgroundColor: vertical.color }}
            className="text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        }
      />

      {/* Stats Row — compact inline strip */}
      {isLoading ? (
        <div className="h-[54px] animate-pulse bg-muted rounded-lg border" />
      ) : (
        <div className="flex items-stretch bg-card border rounded-lg overflow-hidden">
          <div className="flex-1 px-5 py-3 flex flex-col justify-center border-r">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Members</span>
            <span className="text-lg font-semibold">{stats.total}</span>
          </div>
          <div className="flex-1 px-5 py-3 flex flex-col justify-center border-r">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Online Now</span>
            <span className="text-lg font-semibold text-emerald-600">{stats.online}</span>
          </div>
          <div className="flex-1 px-5 py-3 flex flex-col justify-center">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Departments</span>
            <span className="text-lg font-semibold">{stats.departments}</span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="bg-card/50 border-dashed">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px]" data-testid="filter-dept">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="filter-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Member Grid */}
      <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
                <div className="space-y-2 text-center">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredMembers.map((member) => (
            <StaggerItem key={member.id}>
              <Card 
                className="group relative overflow-hidden hover-elevate transition-all border shadow-sm rounded-xl p-5"
                data-testid={`card-member-${member.id}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                        <AvatarImage src={getPersonAvatar(member.name, 80)} alt={member.name} />
                        <AvatarFallback className={cn("text-xl font-bold text-white", getAvatarFallbackColor(member.name))}>
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background shadow-sm",
                        getStatusColor(member.status)
                      )} />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold leading-none" data-testid={`text-name-${member.id}`}>
                        {member.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-role-${member.id}`}>
                        {member.role}
                      </p>
                      <Badge variant="secondary" className="mt-1 font-medium">
                        {member.department}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{member.location}</span>
                    </div>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 no-default-hover-elevate">
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 no-default-hover-elevate">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 no-default-hover-elevate">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
              </Card>
            </StaggerItem>
          ))
        )}
      </Stagger>

      {/* Empty State */}
      {!isLoading && filteredMembers.length === 0 && (
        <Fade className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No team members found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </Fade>
      )}

      {/* Invite Dialog */}
      <FormDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        title="Invite Team Member"
        onSubmit={() => setIsInviteOpen(false)}
        submitLabel="Send Invitation"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="Designer" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dept">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </FormDialog>
    </PageShell>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
