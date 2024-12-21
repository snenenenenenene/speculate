"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Loader2, Plus, School } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateOrganizationDialogProps {
  onSuccess?: () => void;
}

export function CreateOrganizationDialog({ onSuccess }: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"BUSINESS" | "SCHOOL" | "NONPROFIT">("BUSINESS");
  const [domain, setDomain] = useState("");

  const resetForm = () => {
    setName("");
    setType("BUSINESS");
    setDomain("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter an organization name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          domain: domain || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create organization");
      }

      const data = await response.json();
      toast.success("Organization created successfully");
      setOpen(false);
      resetForm();
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Organization Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Organization Type
            </label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as typeof type)}
              disabled={loading}
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

          {type === "SCHOOL" && (
            <div className="space-y-2">
              <label htmlFor="domain" className="text-sm font-medium">
                School Domain
              </label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="university.edu"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Enter your school's email domain for automatic verification
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Organization"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 