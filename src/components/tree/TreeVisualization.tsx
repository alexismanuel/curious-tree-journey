import { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Node, TreeData } from "@/types/tree";
import { CustomNode } from "./CustomNode";
import { CustomEdge } from "./CustomEdge";

const nodeTypes = {
  custom: CustomNode
};

const edgeTypes = {
  custom: CustomEdge
};

export const TreeVisualization = ({ 
  treeData: initialTreeData, 
  selectedNode, 
  onNodeSelect 
}: { 
  treeData: TreeData;
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [treeData, setTreeData] = useState<TreeData>(initialTreeData);
  
  const processNode = useCallback((node: Node, level: number, globalIndex: number, accumulator: { nodes: any[], edges: any[], lastIndex: number }, parentId?: string) => {
    // Calculate position with Git-like tree layout
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;
    
    // Adjust spacing based on device size
    const verticalSpacing = isMobile ? 120 : isTablet ? 140 : 160;
    
    // Calculate positions for vertical line layout
    const x = screenWidth / 2; // Center horizontally
    const y = accumulator.lastIndex * verticalSpacing + 100;
    accumulator.lastIndex += 1; // Increment for next node
    
    // Calculate node size and color based on level
    const getNodeStyle = (level: number) => {
      const baseSize = { width: 280, height: 80 };
      
      return {
        width: baseSize.width,
        height: baseSize.height,
        scale: 1,
        primaryColor: '#FFFFFF'
      };
    };
    
    const nodeStyle = getNodeStyle(level);
    
    // Create react-flow node with Git-like positioning
    const flowNode = {
      id: node.id,
      type: 'custom',
      position: { x, y },
      data: { 
        node,
        isSelected: selectedNode?.id === node.id,
        onSelect: onNodeSelect,
        style: nodeStyle
      },
      className: 'node-rectangle',
      style: {
        background: 'none',
        border: 'none'
      }
    };
    
    // Add edges with curved paths
    if (parentId) {
      const edgeStyle: React.CSSProperties = {
        stroke: '#000000',
        strokeWidth: 1.5,
        opacity: 0.6
      };
      
      // Add the edge
      // Calculate control points for curved path
      const sourceNode = accumulator.nodes.find(n => n.id === parentId);
      if (sourceNode) {
        const sourceX = sourceNode.position.x;
        const sourceY = sourceNode.position.y;
        const targetX = x;
        const targetY = y;
        
        accumulator.edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'custom',
          animated: false,
          style: edgeStyle,
          data: {
            sourceX,
            sourceY,
            targetX,
            targetY,
            controlPoint1: {
              x: sourceX,
              y: sourceY + (targetY - sourceY) * 0.4
            },
            controlPoint2: {
              x: targetX,
              y: targetY - (targetY - sourceY) * 0.4
            }
          }
        });
      }
    }
    
    accumulator.nodes.push(flowNode);
    
    // Process children
    node.children.forEach((child) => {
      processNode(child, level + 1, accumulator.lastIndex, accumulator, node.id);
    });
  }, [selectedNode, onNodeSelect]);
  
  // Process tree data into nodes and edges
  const updateGraph = useCallback(() => {
    const accumulator = { nodes: [], edges: [], lastIndex: 0 };
    processNode(treeData.rootNode, 0, 0, accumulator);
    setNodes(accumulator.nodes);
    setEdges(accumulator.edges);
  }, [treeData, processNode, setNodes, setEdges]);
  
  // Update graph when tree data changes
  useEffect(() => {
    updateGraph();
  }, [updateGraph]);
    
  // Update nodes and edges when tree data changes
  useEffect(() => {
    updateGraph();
  }, [updateGraph]);
  
  // Update tree data when initialTreeData changes
  useEffect(() => {
    setTreeData(initialTreeData);
  }, [initialTreeData]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      minZoom={0.5}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      defaultEdgeOptions={{
        type: 'custom',
        animated: false,
        style: { strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};
