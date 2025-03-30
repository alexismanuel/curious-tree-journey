import { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, MarkerType, useReactFlow, Panel } from "@xyflow/react";
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

// Component to handle centering on first node
const CenterOnLoad = ({ nodes }: { nodes: any[] }) => {
  const { setCenter } = useReactFlow();

  useEffect(() => {
    if (nodes.length > 0) {
      const firstNode = nodes[0];
      // Wait a bit for the layout to settle
      setTimeout(() => {
        setCenter(firstNode.position.x, firstNode.position.y, { zoom: 1.2, duration: 1000 });
      }, 100);
    }
  }, [nodes, setCenter]);

  return null;
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
  // Function to check if a node should be unlocked
  const shouldUnlockNode = (node: Node, completedNodes: Set<string>) => {
    // If no prerequisites, node should be active
    if (!node.prerequisites || node.prerequisites.length === 0) return true;
    // Check if all prerequisites are completed
    return node.prerequisites.every(prereqId => completedNodes.has(prereqId));
  };

  // Function to update node statuses
  const updateNodeStatuses = (treeData: TreeData) => {
    const completedNodes = new Set<string>();
    
    // First pass: collect completed nodes
    const findCompletedNodes = (node: Node) => {
      if (node.status === 'completed') {
        completedNodes.add(node.id);
      }
      node.children.forEach(findCompletedNodes);
    };
    findCompletedNodes(treeData.rootNode);

    // Second pass: update statuses
    const updateStatuses = (node: Node) => {
      // Skip completed nodes
      if (node.status === 'completed') return;
      
      // Check if node should be unlocked
      if (shouldUnlockNode(node, completedNodes)) {
        node.status = 'active';
      } else {
        node.status = 'locked';
      }
      
      // Update children
      node.children.forEach(updateStatuses);
    };
    updateStatuses(treeData.rootNode);

    return treeData;
  };
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [treeData, setTreeData] = useState<TreeData>(initialTreeData);

  const processNode = useCallback((node: Node, level: number, globalIndex: number, accumulator: { nodes: any[], edges: any[], lastIndex: number }, parentId?: string) => {
    // Calculate positions for diagonal layout
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;

    // Adjust spacing based on device size
    const verticalSpacing = isMobile ? 80 : 100;
    const horizontalSpacing = isMobile ? 20 : 25;

    // Calculate zigzag positions
    const baseX = screenWidth / 2;
    const x = baseX + (accumulator.lastIndex % 2 === 0 ? -horizontalSpacing : horizontalSpacing);
    const y = accumulator.lastIndex * verticalSpacing + 50;
    accumulator.lastIndex += 1;

    // Calculate node size and color based on level
    const getNodeStyle = (level: number) => {
      const diameter = 40;
      return {
        width: diameter,
        height: diameter,
        scale: 1,
        primaryColor: '#372EC1',
        borderColor: '#372EC1',
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
        stroke: '#372EC1',
        strokeWidth: 2,
        strokeDasharray: '5,5',
        opacity: 0.6
      };
      accumulator.edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        sourceHandle: 'bottom',  // Matches the source handle ID in CustomNode
        targetHandle: 'top',     // Matches the target handle ID in CustomNode
        type: 'custom',
        animated: false,
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#372EC1',
        },
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
    const updatedTreeData = updateNodeStatuses({...initialTreeData});
    setTreeData(updatedTreeData);
  }, [initialTreeData]);

  console.log(edges)

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
      maxZoom={2}
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
      <CenterOnLoad nodes={nodes} />
    </ReactFlow>
  );
};
