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
} as const;

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
    // Calculate positions for diagonal layout
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    
    // Adjust spacing based on device size
    const verticalSpacing = isMobile ? 120 : 150;
    const horizontalSpacing = isMobile ? 80 : 120;
    
    // Calculate diagonal positions
    const baseX = screenWidth / 2;
    const x = baseX + (accumulator.lastIndex % 2 === 0 ? -horizontalSpacing : horizontalSpacing);
    const y = accumulator.lastIndex * verticalSpacing + 100;
    accumulator.lastIndex += 1;
    
    // Calculate node size and color based on level
    const getNodeStyle = (level: number) => {
      const diameter = 50;
      return {
        width: diameter,
        height: diameter,
        scale: 1,
        primaryColor: '#F0F0F0',
        borderColor: '#000000',
        borderWidth: 2,
        borderRadius: '50%',
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
        style: nodeStyle,
        index: accumulator.lastIndex
      },
      className: 'node-circle',
      style: {
        background: nodeStyle.primaryColor,
        border: `${nodeStyle.borderWidth}px solid ${nodeStyle.borderColor}`,
        borderRadius: nodeStyle.borderRadius,
      }
    };
    
    // Add edge between parent and current node
    if (parentId) {
      const edgeStyle: React.CSSProperties = {
        stroke: '#000000',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.6
      };
      accumulator.edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'custom',
        animated: false,
        style: edgeStyle,
      });
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
        type: 'custom'
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};
