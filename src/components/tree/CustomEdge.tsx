import { EdgeProps } from '@xyflow/react';

type Point = {
  x: number;
  y: number;
};

type CustomEdgeData = {
  controlPoint1?: Point;
  controlPoint2?: Point;
};

export const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data
}: EdgeProps) => {
  const edgeData = data as CustomEdgeData;
  const { controlPoint1, controlPoint2 } = edgeData || {};
  
  // Create a curved path using cubic Bezier curve
  const path = `M ${sourceX} ${sourceY} 
               C ${controlPoint1?.x || sourceX} ${controlPoint1?.y || sourceY},
                 ${controlPoint2?.x || targetX} ${controlPoint2?.y || targetY},
                 ${targetX} ${targetY}`;

  return (
    <>
      <path
        style={{
          ...style,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        className="react-flow__edge-path"
        d={path}
        fill="none"
      />
      <path
        d={path}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        className="react-flow__edge-interaction"
      />
    </>
  );
};
