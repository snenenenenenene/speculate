import { useCallback } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow } from 'reactflow';
import { useRootStore } from '@/stores/rootStore';
import { X } from 'lucide-react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { removeEdge } = useRootStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleEdgeClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      removeEdge(id);
    },
    [id, removeEdge]
  );

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Delete button in the middle of the edge */}
      <foreignObject
        width={24}
        height={24}
        x={labelX - 12}
        y={labelY - 12}
        className="opacity-0 hover:opacity-100 transition-opacity duration-300"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          className="h-6 w-6 rounded-full bg-white border border-muted flex items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
          onClick={handleEdgeClick}
        >
          <X className="h-4 w-4" />
        </div>
      </foreignObject>
    </>
  );
}
