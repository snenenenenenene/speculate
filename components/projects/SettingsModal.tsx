"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AlertCircle, Hash, LayoutDashboard, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Constants for system variables
const SYSTEM_VARIABLES = ['weight'] as const;
const DEFAULT_WEIGHT = '1';

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
    mainStartFlowId?: string;
    flows?: Array<{
      id: string;
      name: string;
      content: string;
    }>;
  } | null;
}

export default function SettingsModal({
  isOpen,
  onClose,
  projectId,
  flowId,
  initialData,
}: SettingsModalProps) {
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
  const [mainStartFlowId, setMainStartFlowId] = useState<string | null>(null);

  // Helper function to check if a variable is a system variable
  const isSystemVariable = useCallback((name: string) => {
    return SYSTEM_VARIABLES.includes(name as any);
  }, []);

  const addVariable = useCallback(() => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) {
      toast.error("Both name and value are required");
      return;
    }

    if (isSystemVariable(newVariable.name)) {
      toast.error("Cannot add system variable");
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
  }, [newVariable, localVariables, globalVariables, variableScope, isSystemVariable]);

  const removeVariable = useCallback((index: number, scope: "local" | "global") => {
    const variables = scope === 'local' ? localVariables : globalVariables;
    const variable = variables[index];

    if (isSystemVariable(variable.name)) {
      toast.error("Cannot remove system variable");
      return;
    }

    if (scope === 'local') {
      setLocalVariables(prev => prev.filter((_, i) => i !== index));
    } else {
      setGlobalVariables(prev => prev.filter((_, i) => i !== index));
    }
    toast.success(`${scope} variable removed`);
  }, [localVariables, globalVariables, isSystemVariable]);

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
        let formattedGlobalVars = [...initialData.globalVariables];
        
        // Ensure weight variable exists in global scope
        if (!formattedGlobalVars.some(v => v.name === 'weight')) {
          formattedGlobalVars.push({
            name: 'weight',
            value: DEFAULT_WEIGHT,
            scope: 'global' as const
          });
        }
        
        setGlobalVariables(formattedGlobalVars);
      }

      // Initialize local variables from flow content
      if (initialData.variables && Array.isArray(initialData.variables)) {
        console.log('Setting local variables from flow:', initialData.variables);
        let localVars = initialData.variables.filter(v => v.scope === 'local');
        
        // Ensure weight variable exists in local scope
        if (!localVars.some(v => v.name === 'weight')) {
          localVars.push({
            name: 'weight',
            value: DEFAULT_WEIGHT,
            scope: 'local' as const
          });
        }
        
        setLocalVariables(localVars);
      }

      setMainStartFlowId(initialData.mainStartFlowId || null);
    }
  }, [initialData]);

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

      // Update main start flow
      const mainStartFlowResponse = await fetch(`/api/projects/${projectId}/main-start-flow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainStartFlowId,
        }),
      });

      if (!mainStartFlowResponse.ok) {
        throw new Error('Failed to update main start flow');
      }

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
          variables: localVariables
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

        // Trigger a full save by refreshing the page
        router.refresh();
      }

      // Save project settings
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          variables: globalVariables
        }),
      });

      if (!projectResponse.ok) {
        const error = await projectResponse.json();
        throw new Error(error.error || "Failed to save project settings");
      }

      toast.success("Settings saved successfully");
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="settings" value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="variables">
              <Hash className="w-4 h-4 mr-2" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="danger">
              <AlertCircle className="w-4 h-4 mr-2" />
              Danger
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {activeTab === "settings" && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                {flowId && (
                  <>
                    <div>
                      <Label>Color</Label>
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
                  </>
                )}

                {!flowId && (
                  <div>
                    <Label>Main Start Flow</Label>
                    <Select
                      value={mainStartFlowId || "none"}
                      onValueChange={(value) => setMainStartFlowId(value === "none" ? null : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select main start flow" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {initialData?.flows?.map((flow) => (
                          <SelectItem key={flow.id} value={flow.id}>
                            {flow.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      This flow will be used as the entry point for the questionnaire.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "variables" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Tabs value={variableScope} onValueChange={(value) => setVariableScope(value as "local" | "global")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="local" disabled={!flowId}>Local Variables</TabsTrigger>
                      <TabsTrigger value="global">Global Variables</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Variable name"
                      value={newVariable.name}
                      onChange={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Value"
                      value={newVariable.value}
                      onChange={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={addVariable}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(variableScope === "local" ? localVariables : globalVariables).map(
                      (variable, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md border"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{variable.name}</span>
                              {isSystemVariable(variable.name) && (
                                <Badge variant="secondary">System</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {variable.value}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariable(index, variableScope)}
                            disabled={isSystemVariable(variable.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="space-y-4">
                <div className="rounded-md border border-destructive p-4">
                  <h3 className="text-lg font-semibold text-destructive mb-2">
                    Delete {flowId ? "Flow" : "Project"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This action cannot be undone. This will permanently delete the{" "}
                    {flowId ? "flow" : "project"} and all associated data.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete {flowId ? "Flow" : "Project"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>

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
    </Dialog>
  );
} 