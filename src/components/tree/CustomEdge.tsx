import { EdgeProps } from '@xyflow/react';

export const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {}
}: EdgeProps) => {
  // Calculate the horizontal and vertical distances
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  
  // Calculate the arc height (12 degrees)
  const arcHeight = Math.abs(dx) * Math.tan(12 * Math.PI / 180);
  
  // Determine if this is a right-to-left edge
  const isRightToLeft = sourceX > targetX;
  
  // Calculate control points for the quadratic curve
  const midX = sourceX + dx / 2;
  const midY = sourceY + dy / 2;
  
  // Apply the arc in the correct direction (reversed)
  const controlX = midX;
  const controlY = midY + (isRightToLeft ? arcHeight : -arcHeight);
  
  // Create a quadratic Bézier curve
  const path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;

  return (
    <path
      d={path}
      style={{
        ...style,
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.5,
      }}
      fill="none"
      className="react-flow__edge-path"
    />
  );
};
