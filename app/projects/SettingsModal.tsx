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
  scope: "local" | "global";
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
    globalVariables?: Variable[];
    content?: string;
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
  const [localVariables, setLocalVariables] = useState<Variable[]>([]);
  const [globalVariables, setGlobalVariables] = useState<Variable[]>([]);
  const [newVariable, setNewVariable] = useState({ name: "", value: "" });
  const [activeTab, setActiveTab] = useState<"settings" | "variables" | "danger">("settings");
  const [variableScope, setVariableScope] = useState<"local" | "global">("local");

  // Initialize form state when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      setName(initialData.name);
      setColor(initialData.color || "#18181b");
      setOnePageMode(initialData.onePageMode);
      
      // Initialize global variables from project
      if (initialData.globalVariables) {
        console.log('Setting global variables from project:', initialData.globalVariables);
        const formattedGlobalVars = initialData.globalVariables.map(v => ({
          ...v,
          scope: 'global' as const
        }));
        setGlobalVariables(formattedGlobalVars);
      }

      // Initialize local variables from flow content
      if (initialData.variables && Array.isArray(initialData.variables)) {
        console.log('Setting local variables from flow:', initialData.variables);
        const localVars = initialData.variables
          .filter(v => v.scope === 'local')
          .map(v => ({
            ...v,
            scope: 'local' as const
          }));
        setLocalVariables(localVars);
      }
    }
  }, [initialData]);

  const addVariable = useCallback(() => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) {
      toast.error("Both name and value are required");
      return;
    }

    const scope = variableScope;
    const newVar = { ...newVariable, scope };

    // Check for duplicate names within the same scope
    const existingVariables = scope === 'local' ? localVariables : globalVariables;
    if (existingVariables.some(v => v.name === newVariable.name)) {
      toast.error(`A ${scope} variable with this name already exists`);
      return;
    }

    if (scope === 'local') {
      setLocalVariables(prev => [...prev, newVar]);
    } else {
      setGlobalVariables(prev => [...prev, newVar]);
    }

    setNewVariable({ name: "", value: "" });
    toast.success(`${scope} variable added successfully`);
  }, [newVariable, localVariables, globalVariables, variableScope]);

  const removeVariable = useCallback((index: number, scope: "local" | "global") => {
    if (scope === 'local') {
      setLocalVariables(prev => prev.filter((_, i) => i !== index));
    } else {
      setGlobalVariables(prev => prev.filter((_, i) => i !== index));
    }
    toast.success(`${scope} variable removed`);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Current state:', {
        flowId,
        name,
        color,
        onePageMode,
        localVariables,
        globalVariables
      });

      // Save flow settings if we have a flowId
      if (flowId) {
        // Get current content and merge with local variables only
        let contentObj = {};
        try {
          if (initialData?.content) {
            contentObj = typeof initialData.content === 'string' 
              ? JSON.parse(initialData.content) 
              : initialData.content;
          }
        } catch (err) {
          console.error('Error parsing existing content:', err);
        }

        // Update content with local variables only
        const updatedContent = {
          ...contentObj,
          variables: localVariables.filter(v => v.scope === 'local')
        };

        const settingsData = {
          name,
          color,
          onePageMode,
          content: JSON.stringify(updatedContent)
        };
        
        console.log('Flow settings data:', settingsData);
        console.log('Saving flow settings...');
        const flowResponse = await fetch(`/api/projects/${projectId}/flows/${flowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsData),
        });

        if (!flowResponse.ok) {
          const error = await flowResponse.json();
          throw new Error(error.error || "Failed to save flow settings");
        }
      }

      // Save global variables to project
      console.log('Saving global variables to project:', globalVariables);
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          variables: globalVariables.filter(v => v.scope === 'global')
        }),
      });

      if (!projectResponse.ok) {
        const errorText = await projectResponse.text();
        let errorMessage = "Failed to save global variables";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) errorMessage = errorJson.error;
        } catch (e) {
          // If JSON parsing fails, use the raw error text if available
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const projectData = await projectResponse.json();
      console.log('Project save response:', projectData);
      
      // Update local state with the saved global variables
      if (projectData.project?.globalVariables) {
        console.log('Updating global variables from response:', projectData.project.globalVariables);
        setGlobalVariables(projectData.project.globalVariables);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Flow Settings</DialogTitle>
          <DialogDescription>
            Configure your flow settings and variables
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[500px]">
          {/* Sidebar */}
          <div className="w-48 border-r pr-4 pt-4">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-secondary",
                  activeTab === "settings" 
                    ? "bg-secondary text-primary font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab("variables")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-secondary",
                  activeTab === "variables" 
                    ? "bg-secondary text-primary font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <Hash className="h-4 w-4" />
                Variables
              </button>
              <button
                onClick={() => setActiveTab("danger")}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-secondary hover:text-destructive",
                  activeTab === "danger" 
                    ? "bg-secondary text-destructive font-medium" 
                    : "text-muted-foreground"
                )}
              >
                <AlertCircle className="h-4 w-4" />
                Danger Zone
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 pt-4 overflow-y-auto">
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Flow Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter flow name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Flow Color</Label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 px-2"
                  />
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
            )}

            {activeTab === "variables" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Tabs value={variableScope} onValueChange={(value) => setVariableScope(value as "local" | "global")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="local">Local Variables</TabsTrigger>
                      <TabsTrigger value="global">Global Variables</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <Label>Name</Label>
                      <Input
                        value={newVariable.name}
                        onChange={(e) =>
                          setNewVariable((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Variable name"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Value</Label>
                      <Input
                        value={newVariable.value}
                        onChange={(e) =>
                          setNewVariable((prev) => ({ ...prev, value: e.target.value }))
                        }
                        placeholder="Variable value"
                      />
                    </div>
                    <Button
                      onClick={addVariable}
                      variant="outline"
                      size="icon"
                      className="mb-0.5"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {variableScope === 'local' ? 
                      localVariables.map((variable, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center space-x-4">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {variable.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {variable.value}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariable(index, 'local')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    : globalVariables.map((variable, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center space-x-4">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium leading-none">
                                {variable.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {variable.value}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariable(index, 'global')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="rounded-md bg-destructive/10 p-4">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-medium text-destructive">Delete Flow</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action cannot be undone. This will permanently delete this
                        flow and remove all associated data.
                      </p>
                      <Button
                        variant="destructive"
                        className="mt-4"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Flow
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flow? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}