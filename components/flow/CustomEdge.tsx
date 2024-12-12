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
      <g
        transform={`translate(${labelX - 10} ${labelY - 10})`}
        className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
        onClick={handleEdgeClick}
      >
        <circle r="12" fill="white" className="stroke-muted" />
        <X className="w-4 h-4 text-muted-foreground" style={{ transform: 'translate(-8px, -8px)' }} />
      </g>
    </>
  );
}
