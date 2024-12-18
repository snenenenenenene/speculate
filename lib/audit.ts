import { AuditAction } from '@prisma/client';
import prisma from '@/lib/prisma';

interface AuditLogOptions {
  userId: string;
  projectId: string;
  entityId: string;
  entityType: string;
  action: AuditAction;
  metadata?: any;
  snapshot?: any;
}

export async function createAuditLog({
  userId,
  projectId,
  entityId,
  entityType,
  action,
  metadata = {},
  snapshot = null,
}: AuditLogOptions) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        projectId,
        entityId,
        entityType,
        action,
        metadata,
        snapshot,
      },
    });
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting the main flow
    return null;
  }
}

export async function createFlowAuditLog(
  userId: string,
  projectId: string,
  flowId: string,
  action: AuditAction,
  metadata: any = {}
) {
  return createAuditLog({
    userId,
    projectId,
    entityId: flowId,
    entityType: 'FLOW',
    action,
    metadata,
  });
} 