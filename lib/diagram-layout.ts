import Dagre from '@dagrejs/dagre';
import { type Node, type Edge } from '@xyflow/react';
import { type ServiceNodeData } from '@/types/blueprint';

const NODE_WIDTH = 160; // matches ServiceNode fixed width
const NODE_HEIGHT = 100; // matches ServiceNode approximate height

export interface LayoutOptions {
  direction?: 'LR' | 'TB' | 'RL' | 'BT'; // LR = left-to-right (default)
  nodeSep?: number; // horizontal gap between nodes in same rank
  rankSep?: number; // vertical gap between rank levels (swimlane depth)
  edgeSep?: number; // gap between edges
}

/**
 * Runs Dagre layout on customNodes, filters out group containers, and then positions
 * child nodes relative to their calculated parent groups with enclosing bounds padding.
 */
export function applyDagreLayout(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {},
): { nodes: Node<ServiceNodeData>[]; edges: Edge[] } {
  const {
    direction = 'LR',
    nodeSep = 60,
    rankSep = 120,
    edgeSep = 20,
  } = options;

  // 1. Build Dagre graph
  const g = new Dagre.graphlib.Graph()
    .setDefaultEdgeLabel(() => ({}))
    .setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep, edgesep: edgeSep });

  // 2. Register nodes (skip group containers — they are positioned around children)
  for (const node of nodes) {
    if (node.type === 'group') continue;
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // 3. Register edges (skip edges connected to group nodes)
  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  // 4. Run layout algorithm
  Dagre.layout(g);

  // 5. Map computed positions back to ReactFlow nodes
  const layoutedNodes = nodes.map((node) => {
    if (node.type === 'group') return node;
    const pos = g.node(node.id);
    if (!pos) return node;

    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  // Fit group container bounds around their newly arranged children and adjust relative coordinates
  const adjustedNodes = fitGroupsAndAdjustChildren(layoutedNodes);

  return { nodes: adjustedNodes, edges };
}

/**
 * Computes boundaries for group container nodes based on their children's post-layout positions.
 * Translates child coordinates to be relative to the parent container as required by ReactFlow.
 */
export function fitGroupsAndAdjustChildren(
  nodes: Node<ServiceNodeData>[],
): Node<ServiceNodeData>[] {
  const PADDING = 24;
  const HEADER_HEIGHT = 28; // room for the group title at the top
  const groups = nodes.filter((n) => n.type === 'group');

  if (groups.length === 0) return nodes;

  let resultNodes = [...nodes];

  for (const group of groups) {
    const children = resultNodes.filter((n) => n.parentId === group.id);
    if (children.length === 0) continue;

    // Calculate bounding box of children (in global space post-Dagre)
    const minX = Math.min(...children.map((c) => c.position.x));
    const minY = Math.min(...children.map((c) => c.position.y));
    const maxX = Math.max(...children.map((c) => c.position.x + NODE_WIDTH));
    const maxY = Math.max(...children.map((c) => c.position.y + NODE_HEIGHT));

    const groupWidth = maxX - minX + PADDING * 2;
    const groupHeight = maxY - minY + PADDING * 2 + HEADER_HEIGHT;

    // Position group node at top-left boundary of children (offset by padding)
    const groupX = minX - PADDING;
    const groupY = minY - PADDING - HEADER_HEIGHT;

    // Update group position and styles
    resultNodes = resultNodes.map((n) => {
      if (n.id === group.id) {
        return {
          ...n,
          position: { x: groupX, y: groupY },
          style: {
            ...n.style,
            width: groupWidth,
            height: groupHeight,
          },
        };
      }
      return n;
    });

    // Translate children to be local relative to parent coordinates and apply boundary extent
    resultNodes = resultNodes.map((n) => {
      if (n.parentId === group.id) {
        return {
          ...n,
          position: {
            x: n.position.x - groupX,
            y: n.position.y - groupY,
          },
          extent: 'parent' as const,
        };
      }
      return n;
    });
  }

  return resultNodes;
}
