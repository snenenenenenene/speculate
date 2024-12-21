"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const THEMES = ["light", "dark", "system"] as const;
const INTERVALS = ["1", "5", "10", "15"] as const;

type Theme = typeof THEMES[number];
type Interval = typeof INTERVALS[number];

const getIntervalLabel = (interval: Interval) => {
  switch (interval) {
    case "1": return "Every minute";
    case "5": return "Every 5 minutes";
    case "10": return "Every 10 minutes";
    case "15": return "Every 15 minutes";
    default: return "Every 5 minutes";
  }
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<Interval>("5");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  // Ensure theme has a valid value
  const theme = (currentTheme || "system") as Theme;

  useEffect(() => {
    setMounted(true);
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error("Please enter a display name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update display name");
      }

      await updateSession();
      toast.success("Display name updated successfully");
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error("Failed to update display name");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button onClick={handleUpdateName} disabled={loading}>
              {loading ? "Updating..." : "Update Name"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Speculate looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme || "system"} onValueChange={(value: Theme) => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue>
                    {theme === "light" && "Light"}
                    {theme === "dark" && "Dark"}
                    {theme === "system" && "System"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => (
                    <SelectItem key={t} value={t || "system"}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editor Preferences</CardTitle>
            <CardDescription>Customize your flow editor experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your work
                </p>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
            {autoSave && (
              <div className="space-y-2">
                <Label>Auto-save Interval</Label>
                <Select 
                  value={autoSaveInterval || "5"} 
                  onValueChange={(value: Interval) => setAutoSaveInterval(value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {getIntervalLabel(autoSaveInterval || "5")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((interval) => (
                      <SelectItem key={interval} value={interval || "5"}>
                        {getIntervalLabel(interval || "5")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={() => toast.success("Editor preferences saved")}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what notifications you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about your flows and collaborations
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser notifications when changes are made to your flows
                </p>
              </div>
              <Switch
                checked={browserNotifications}
                onCheckedChange={setBrowserNotifications}
              />
            </div>
            <Button onClick={() => toast.success("Notification preferences saved")}>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 