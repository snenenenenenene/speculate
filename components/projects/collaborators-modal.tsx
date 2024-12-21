"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Building2, User, X, Check } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface Collaborator {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  type: "organization" | "project";
}

interface CollaboratorsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "EDITOR":
      return "Editor";
    case "VIEWER":
      return "Viewer";
    default:
      return role;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "OWNER":
      return "default";
    case "ADMIN":
      return "secondary";
    case "EDITOR":
      return "outline";
    case "VIEWER":
      return "outline";
    default:
      return "outline";
  }
};

export default function CollaboratorsModal({ projectId, isOpen, onClose }: CollaboratorsModalProps) {
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [search, setSearch] = useState("");
  const [newRole, setNewRole] = useState<"VIEWER" | "EDITOR" | "ADMIN">("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!response.ok) throw new Error("Failed to fetch collaborators");
      const data = await response.json();
      setCollaborators(data.collaborators || []);
      
      // Extract team members from organization members, with proper null checks
      const orgMembers = (data.collaborators || [])
        .filter((c: Collaborator) => c?.type === "organization" && c?.email)
        .map((c: Collaborator) => ({
          id: c.id,
          name: c.name || "",
          email: c.email,
          image: c.image,
          role: c.role,
        }));
      setTeamMembers(orgMembers);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast.error("Failed to load collaborators");
      setCollaborators([]);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to invite collaborator");
      }

      toast.success("Collaborator invited successfully");
      setNewEmail("");
      setNewRole("VIEWER");
      fetchCollaborators();
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast.error(error instanceof Error ? error.message : "Failed to invite collaborator");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("Role updated successfully");
      fetchCollaborators();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators?userId=${userId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to remove collaborator");

      toast.success("Collaborator removed successfully");
      fetchCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  // Filter team members based on search
  const filteredTeamMembers = search.length >= 3
    ? teamMembers.filter(member => 
        (member.name?.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())) &&
        member.email !== newEmail // Don't show already selected member
      )
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search && !filteredTeamMembers.length) {
      setNewEmail(search);
      setOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Collaborators</DialogTitle>
          <DialogDescription>
            Manage who has access to this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Form */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Invite Collaborator</div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search members or enter email..."
                  value={search}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(value);
                    if (value.includes("@")) {
                      setNewEmail(value);
                    } else {
                      setNewEmail("");
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                />
                {search && (
                  <X
                    className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer opacity-50 hover:opacity-100"
                    onClick={() => {
                      setSearch("");
                      setNewEmail("");
                    }}
                  />
                )}
                {search.length >= 3 && (
                  <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                    {filteredTeamMembers.length > 0 ? (
                      <>
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                          Team Members
                        </div>
                        {filteredTeamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setNewEmail(member.email);
                              setSearch(member.email);
                            }}
                          >
                            <Avatar className="h-6 w-6">
                              {member.image ? (
                                <div className="relative aspect-square h-full w-full">
                                  <Image
                                    src={member.image}
                                    alt={member.name || "User avatar"}
                                    fill
                                    className="rounded-full object-cover"
                                  />
                                </div>
                              ) : (
                                <AvatarFallback className="text-xs">
                                  {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm">{member.name || member.email}</span>
                              {member.name && (
                                <span className="text-xs text-muted-foreground">{member.email}</span>
                              )}
                            </div>
                            {newEmail === member.email && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-2 py-3 text-sm text-muted-foreground">
                        {search.includes("@") 
                          ? "Press enter to invite this email"
                          : "No team members found"}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Select
                value={newRole}
                onValueChange={(value: "VIEWER" | "EDITOR" | "ADMIN") => setNewRole(value)}
                disabled={inviting}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviting}>
                {inviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Collaborators List */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Current Collaborators</div>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={`${collaborator.type}-${collaborator.id}`}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {collaborator.image ? (
                          <div className="relative aspect-square h-full w-full">
                            <Image
                              src={collaborator.image}
                              alt={collaborator.name || "User avatar"}
                              fill
                              className="rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {collaborator.name?.[0]?.toUpperCase() || collaborator.email[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {collaborator.name || collaborator.email}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {collaborator.type === "organization" ? (
                              <Building2 className="mr-1 h-3 w-3" />
                            ) : (
                              <User className="mr-1 h-3 w-3" />
                            )}
                            {collaborator.type}
                          </Badge>
                          <Badge variant={getRoleBadgeVariant(collaborator.role)} className="text-xs">
                            {getRoleLabel(collaborator.role)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {collaborator.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {collaborator.type === "project" && collaborator.role !== "OWNER" && (
                        <>
                          <Select
                            value={collaborator.role}
                            onValueChange={(value) => handleUpdateRole(collaborator.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VIEWER">Viewer</SelectItem>
                              <SelectItem value="EDITOR">Editor</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(collaborator.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 