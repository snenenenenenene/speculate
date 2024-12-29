import { OrganizationSettingsForm } from "@/components/organizations/organization-settings-form";

interface PageProps {
  params: Promise<{ organizationId: string }>;
}

export default async function OrganizationSettingsPage({ params }: PageProps) {
  const { organizationId } = await params;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <OrganizationSettingsForm organizationId={organizationId} />
    </div>
  );
} 