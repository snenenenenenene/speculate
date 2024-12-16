import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { toast } from "sonner";

interface Collaborator {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface CollaboratorsModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollaboratorsModal({ 
  projectId, 
  isOpen, 
  onClose 
}: CollaboratorsModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const fetchCollaborators = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!response.ok) throw new Error("Failed to fetch collaborators");
      const data = await response.json();
      setCollaborators(data.collaborators);
    } catch (error) {
      toast.error("Failed to load collaborators");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
    }
  }, [isOpen, projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to invite collaborator");
      }

      toast.success("Collaborator added successfully");
      fetchCollaborators();
      setEmail("");
      setShowInviteForm(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators?collaboratorId=${collaboratorId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to remove collaborator");

      toast.success("Collaborator removed successfully");
      fetchCollaborators();
    } catch (error) {
      toast.error("Failed to remove collaborator");
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Project Collaborators</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>
          </div>

          {/* Invite Form */}
          {showInviteForm && (
            <form onSubmit={handleInvite} className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isInviting}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Collaborator
                </Button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.length > 0 ? (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {collaborator.user.image ? (
                        <img
                          src={collaborator.user.image}
                          alt={collaborator.user.name || "User"}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <Shield className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{collaborator.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {collaborator.user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No collaborators yet
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}