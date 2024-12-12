import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams } from 'next/navigation';
import { useChartStore } from '@/stores/chartStore';
import { toast } from 'sonner';

export type NodeWrapperProps = {
  title: string;
  selected: boolean;
  id: string;
  onDelete?: () => void;
  children: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  headerIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
  handles?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  customHandles?: React.ReactNode;
};

export const NodeWrapper = React.memo(function NodeWrapper(props: NodeWrapperProps) {
  const {
    title,
    selected,
    id,
    onDelete,
    children,
    headerClassName,
    contentClassName,
    headerIcon,
    headerActions,
    handles = { top: true, bottom: true },
    customHandles
  } = props;

  const params = useParams();
  const flowId = params.flowId as string;
  const { removeNode } = useChartStore();

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = useCallback(() => {
    if (!flowId) {
      console.error('NodeWrapper: No flowId found');
      return;
    }
    
    console.log('NodeWrapper: Deleting node', { flowId, id });
    removeNode(flowId, id);
  }, [flowId, id, removeNode]);

  const confirmDelete = () => {
    handleDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        <Card className={cn(
          "group min-w-[240px] relative",
          selected ? "ring-2 ring-black/10 shadow-lg bg-white" : "ring-1 ring-zinc-200/50 shadow-sm bg-white",
          "transition-all duration-200"
        )}>
          {/* Default Node Handles */}
          {!customHandles && (
            <>
              {handles.top && (
                <Handle
                  type="target"
                  position={Position.Top}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-zinc-200 bg-white",
                    "!transform !translate-x-[-50%] !translate-y-[-50%]"
                  )}
                />
              )}
              {handles.right && (
                <Handle
                  type="source"
                  position={Position.Right}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-zinc-200 bg-white",
                    "!transform !translate-x-[50%] !translate-y-[-50%]"
                  )}
                />
              )}
              {handles.bottom && (
                <Handle
                  type="source"
                  position={Position.Bottom}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-zinc-200 bg-white",
                    "!transform !translate-x-[-50%] !translate-y-[50%]"
                  )}
                />
              )}
              {handles.left && (
                <Handle
                  type="target"
                  position={Position.Left}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-zinc-200 bg-white",
                    "!transform !translate-x-[-50%] !translate-y-[-50%]"
                  )}
                />
              )}
            </>
          )}

          {/* Custom Handles */}
          {customHandles}

          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            headerClassName
          )}>
            <div className="flex items-center gap-2">
              {headerIcon}
              <h4 className="font-medium leading-none nodrag">{title}</h4>
            </div>
            <div className="flex items-center space-x-1">
              {headerActions}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 w-8 p-0 nodrag"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className={cn(
            "pt-0 nodrag",
            contentClassName
          )}>
            {children}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Node</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this node? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});