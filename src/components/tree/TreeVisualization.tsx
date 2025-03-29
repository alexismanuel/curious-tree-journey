import { useCallback, useEffect } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Node, TreeData } from "@/types/tree";
import { CustomNode } from "./CustomNode";

const nodeTypes = {
  custom: CustomNode
};

export const TreeVisualization = ({ 
  treeData, 
  selectedNode, 
  onNodeSelect 
}: { 
  treeData: TreeData;
  selectedNode: Node | null;
  onNodeSelect: (node: Node) => void;
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const processNode = useCallback((node: Node, level: number, index: number, accumulator: { nodes: any[], edges: any[] }, parentId?: string) => {
    // Calculate position with responsive spacing
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;
    const isDesktop = screenWidth >= 1024 && screenWidth < 1536;
    const is2xl = screenWidth >= 1536;
    
    // Adjust spacing based on device size
    const baseSpacing = isMobile ? 80 : isTablet ? 120 : isDesktop ? 180 : 240;
    const verticalSpacing = isMobile ? 60 : isTablet ? 80 : isDesktop ? 100 : 140;
    const initialX = isMobile ? 60 : isTablet ? 80 : isDesktop ? 100 : 120;
    
    const x = initialX + level * baseSpacing;
    const y = 60 + index * verticalSpacing;
    
    // Create react-flow node
    const flowNode = {
      id: node.id,
      type: 'custom',
      position: { x, y },
      data: { 
        node,
        isSelected: selectedNode?.id === node.id,
        onSelect: onNodeSelect
      }
    };
    
    // Add edge from parent if it exists
    if (parentId) {
      accumulator.edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: node.status === 'active',
        style: { stroke: '#A18D7D', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#A18D7D',
        }
      });
    }
    
    accumulator.nodes.push(flowNode);
    
    // Process children
    node.children.forEach((child, childIndex) => {
      processNode(child, level + 1, childIndex, accumulator, node.id);
    });
  }, [selectedNode, onNodeSelect]);
  
  // Process tree data into nodes and edges
  const processTreeData = useCallback(() => {
    const accumulator = { nodes: [], edges: [] };
    processNode(treeData.rootNode, 0, 0, accumulator, undefined);
    setNodes(accumulator.nodes);
    setEdges(accumulator.edges);
  }, [treeData, processNode, setNodes, setEdges]);
  
  // Update nodes and edges when tree data changes
  useEffect(() => {
    processTreeData();
  }, [processTreeData]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.5}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};
