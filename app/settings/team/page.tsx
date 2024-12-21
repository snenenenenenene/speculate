"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, School, Users2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { CreateOrganizationDialog } from "@/components/organizations/create-organization-dialog";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  type: "BUSINESS" | "SCHOOL" | "NONPROFIT";
  _count: {
    members: number;
    projects: number;
  };
  role: "OWNER" | "ADMIN" | "MEMBER";
  verified?: boolean;
}

export default function TeamSettingsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/organizations", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch organizations");
      const data = await response.json();
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Organizations</h3>
          <p className="text-sm text-muted-foreground">
            Manage your organizations and team members
          </p>
        </div>
        <CreateOrganizationDialog onSuccess={fetchOrganizations} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No organizations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an organization to collaborate with your team
            </p>
            <CreateOrganizationDialog onSuccess={fetchOrganizations} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {org.type === "SCHOOL" ? (
                        <School className="h-6 w-6 text-primary" />
                      ) : (
                        <Building2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{org.name}</h4>
                        <Badge variant={org.verified ? "default" : "secondary"}>
                          {org.type.toLowerCase()}
                        </Badge>
                        <Badge variant="outline">{org.role.toLowerCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users2 className="h-4 w-4" />
                          <span>
                            {org._count.members} {org._count.members === 1 ? "member" : "members"}
                          </span>
                        </div>
                        <div>
                          {org._count.projects} {org._count.projects === 1 ? "project" : "projects"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/organizations/${org.id}/settings`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 