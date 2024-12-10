"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Hash, LayoutDashboard, Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Variable {
  name: string;
  value: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  flowId?: string;
  initialData: {
    name: string;
    color: string;
    onePageMode: boolean;
    variables: Variable[];
  } | null;
}

export default function SettingsModal({
  isOpen,
  onClose,
  projectId,
  flowId,
  initialData,
}: SettingsModalProps) {
	console.log('initialData:', initialData);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [onePageMode, setOnePageMode] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVariable, setNewVariable] = useState({ name: "", value: "" });
  const [variableScope, setVariableScope] = useState<"local" | "global">("local");

  // Initialize form state when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      setName(initialData.name);
      setColor(initialData.color || "#18181b");
      setOnePageMode(initialData.onePageMode);
      setVariables(initialData.variables);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!flowId) return;

    if (!name.trim()) {
      toast.error("Flow name cannot be empty");
      return;
    }

    console.log('Saving settings:', { name, color, onePageMode });
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color,
          onePageMode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }

      toast.success("Settings saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!flowId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete flow");

      toast.success("Flow deleted successfully");
      router.push(`/projects/${projectId}`);
      onClose();
    } catch (error) {
      console.error("Error deleting flow:", error);
      toast.error("Failed to delete flow");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addVariable = useCallback(() => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) {
      toast.error("Both name and value are required");
      return;
    }

    if (variables.some(v => v.name === newVariable.name)) {
      toast.error("A variable with this name already exists");
      return;
    }

    setVariables(prev => [...prev, newVariable]);
    setNewVariable({ name: "", value: "" });
    toast.success("Variable added successfully");
  }, [newVariable, variables]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Flow Settings</DialogTitle>
          <DialogDescription>
            Configure your flow settings and variables
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Flow Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter flow name..."
                />
              </div>

              <div className="space-y-2">
                <Label>Flow Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    value={color || "#18181b"}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="one-page-mode"
                  checked={onePageMode}
                  onCheckedChange={setOnePageMode}
                />
                <Label htmlFor="one-page-mode">One Page Mode</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4 mt-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={variableScope === "local" ? "default" : "outline"}
                size="sm"
                onClick={() => setVariableScope("local")}
              >
                Local
              </Button>
              <Button
                variant={variableScope === "global" ? "default" : "outline"}
                size="sm"
                onClick={() => setVariableScope("global")}
              >
                Global
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Variable name"
                value={newVariable.name}
                onChange={(e) =>
                  setNewVariable((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Variable value"
                value={newVariable.value}
                onChange={(e) =>
                  setNewVariable((prev) => ({ ...prev, value: e.target.value }))
                }
              />
              <Button size="icon" onClick={addVariable}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {variables.map((variable, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div>
                    <span className="font-medium">{variable.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {variable.value}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setVariables((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="danger" className="space-y-4 mt-4">
            <div className="rounded-md border border-destructive/50 p-4">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Delete Flow
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This action cannot be undone. This will permanently delete your
                flow and remove all associated data.
              </p>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Flow
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        "Yes, delete flow"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}