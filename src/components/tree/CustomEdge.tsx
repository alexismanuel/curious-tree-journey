import { EdgeProps } from '@xyflow/react';

export const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {}
}: EdgeProps) => {
  // Create a direct line between source and target
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  return (
    <path
      d={path}
      style={{
        ...style,
        stroke: '#000',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.5,
      }}
      fill="none"
      className="react-flow__edge-path"
    />
  );
};
