"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, School, Loader2, Trash2, AlertTriangle, Users2, Settings, AlertOctagon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Organization {
  id: string;
  name: string;
  type: "BUSINESS" | "SCHOOL" | "NONPROFIT";
  domain?: string;
  verified?: boolean;
  _count: {
    members: number;
    projects: number;
  };
  role: "OWNER" | "ADMIN" | "MEMBER";
}

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  image: string;
}

export default function OrganizationSettingsPage({ params }: { params: { organizationId: string } }) {
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "BUSINESS" as const,
    domain: "",
  });
  const [activeTab, setActiveTab] = useState<"general" | "members" | "danger">("general");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(newMemberEmail, 300);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const [orgResponse, membersResponse] = await Promise.all([
        fetch(`/api/organizations/${params.organizationId}`),
        fetch(`/api/organizations/${params.organizationId}/members`),
      ]);

      if (!orgResponse.ok || !membersResponse.ok) {
        throw new Error("Failed to fetch organization data");
      }

      const [orgData, membersData] = await Promise.all([
        orgResponse.json(),
        membersResponse.json(),
      ]);

      setOrganization(orgData.organization);
      setMembers(membersData.members);
      setFormData({
        name: orgData.organization.name,
        type: orgData.organization.type,
        domain: orgData.organization.domain || "",
      });
    } catch (error) {
      console.error("Error loading organization:", error);
      toast.error("Failed to load organization");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [params.organizationId]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setUserSearchResults([]);
        setSearchOpen(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (!response.ok) throw new Error("Failed to search users");
        const data = await response.json();
        setUserSearchResults(data.users || []);
        setSearchOpen(true);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserSearchResults([]);
        setSearchOpen(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const handleUpdateOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${params.organizationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      toast.success("Organization updated successfully");
      fetchOrganization();
    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization");
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/organizations/${params.organizationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete organization");
      }

      toast.success("Organization deleted successfully");
      router.push("/settings/team");
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsAddingMember(true);
      const response = await fetch(`/api/organizations/${params.organizationId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add member");
      }

      toast.success("Member added successfully");
      setNewMemberEmail("");
      setNewMemberRole("MEMBER");
      fetchOrganization();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/organizations/${params.organizationId}/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: memberId,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update member role");
      }

      const updatedMember = await response.json();
      setMembers(members.map(member => 
        member.user.id === memberId 
          ? { ...member, role: updatedMember.role }
          : member
      ));
      toast.success("Member role updated successfully");
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update member role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${params.organizationId}/members?userId=${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to remove member");
      }

      setMembers(members.filter(member => member.user.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Organization not found</h2>
          <p className="text-muted-foreground">
            This organization may have been deleted or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const canManageOrganization = ["OWNER", "ADMIN"].includes(organization.role);

  const tabs = [
    {
      id: "general" as const,
      label: "General",
      icon: Settings,
      show: true,
    },
    {
      id: "members" as const,
      label: "Members",
      icon: Users2,
      show: true,
    },
    {
      id: "danger" as const,
      label: "Danger Zone",
      icon: AlertOctagon,
      show: canManageOrganization,
    },
  ];

  return (
    <div className="container mx-auto flex w-full max-w-7xl flex-1 gap-8 p-4 pt-16">
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-16">
          <div className="mb-8">
            <h3 className="text-lg font-medium">Organization Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your organization settings and team members.
            </p>
          </div>
          <div className="space-y-1">
            {tabs.filter(tab => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                  activeTab === tab.id ? "bg-accent" : "text-muted-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 space-y-6">
        {activeTab === "general" && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Update your organization details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                  disabled={!canManageOrganization}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Organization Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "BUSINESS" | "SCHOOL" | "NONPROFIT") =>
                    setFormData({ ...formData, type: value as any })
                  }
                  disabled={!canManageOrganization}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUSINESS">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Business</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SCHOOL">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        <span>Educational Institution</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="NONPROFIT">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Nonprofit</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData as any).type === "SCHOOL" && (
                <div className="space-y-2">
                  <Label htmlFor="domain">School Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="university.edu"
                    disabled={!canManageOrganization}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your school's email domain for automatic verification
                  </p>
                </div>
              )}

              {canManageOrganization && (
                <Button onClick={handleUpdateOrganization}>Save Changes</Button>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "members" && (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManageOrganization && (
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor="email" className="text-sm">Add Member</Label>
                      <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                        <PopoverTrigger asChild>
                          <div className="relative mt-1.5">
                            <Input
                              id="email"
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) => {
                                setNewMemberEmail(e.target.value);
                                if (e.target.value.length >= 2) {
                                  setSearchOpen(true);
                                }
                              }}
                              placeholder="Enter email address"
                              disabled={isAddingMember}
                              className="w-full"
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search users..." 
                              value={newMemberEmail}
                              onValueChange={(value) => {
                                setNewMemberEmail(value);
                                if (value.length >= 2) {
                                  setSearchOpen(true);
                                }
                              }}
                            />
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {Array.isArray(userSearchResults) && userSearchResults.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.email}
                                  onSelect={() => {
                                    setNewMemberEmail(user.email);
                                    setSearchOpen(false);
                                  }}
                                  className="flex items-center gap-2 px-2 py-1"
                                >
                                  <Avatar className="h-6 w-6">
                                    {user.image ? (
                                      <AvatarImage src={user.image} alt={user.name || ''} />
                                    ) : (
                                      <AvatarFallback>
                                        {user.name?.split(" ")
                                          .map(n => n[0])
                                          .slice(0, 2)
                                          .join("")
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                  </div>
                                  {user.email === newMemberEmail && (
                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="w-[140px]">
                      <Label htmlFor="role" className="text-sm">Role</Label>
                      <Select
                        value={newMemberRole}
                        onValueChange={(value: "MEMBER" | "ADMIN") => setNewMemberRole(value)}
                        disabled={isAddingMember}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={isAddingMember} className="flex-shrink-0">
                      {isAddingMember ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Member"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-border rounded-md border">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {member.user.image ? (
                          <AvatarImage src={member.user.image} alt={member.user.name || ''} />
                        ) : (
                          <AvatarFallback>
                            {member.user.name?.split(" ")
                              .map(n => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{member.user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canManageOrganization && member.role !== "OWNER" ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(value) =>
                              handleUpdateMemberRole(member.user.id, value)
                            }
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.user.id)}
                            title="Remove member"
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge 
                          variant={member.role === "OWNER" ? "default" : "outline"}
                          className="h-6"
                        >
                          {member.role.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "danger" && canManageOrganization && (
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-destructive/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Delete Organization</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this organization and all of its data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Organization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be
              undone and will permanently delete all data associated with this
              organization.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              This will delete all projects, flows, and data associated with this
              organization.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 