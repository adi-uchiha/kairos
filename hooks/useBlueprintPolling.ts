import { useEffect, useRef } from 'react';
import { type Node, type Edge } from '@xyflow/react';
import { type ServiceNodeData, type RawDiagramNode } from '@/types/blueprint';

interface PollingCallbacks {
  onContextMapUpdate: (contextMap: Record<string, unknown>) => void;
  onPhaseUpdate: (phase: string) => void;
  onMessagesUpdate: (messages: unknown[]) => void;
  onDiagramUpdate: (nodes: Node<ServiceNodeData>[], edges: Edge[]) => void;
}

/**
 * Polls the blueprint API every 8 seconds to sync live state from the server.
 *
 * Uses refs to read the latest values of `isLoading`, `currentPhase`, and
 * `messages.length` without re-mounting the interval on every state change.
 */
export function useBlueprintPolling(
  blueprintId: string,
  isLoading: boolean,
  currentPhase: string,
  messagesLength: number,
  callbacks: PollingCallbacks
) {
  // Live-value refs so the interval closure always reads current values
  const isLoadingRef = useRef(isLoading);
  const currentPhaseRef = useRef(currentPhase);
  const messagesLengthRef = useRef(messagesLength);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    messagesLengthRef.current = messagesLength;
  }, [messagesLength]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isLoadingRef.current) return; // Skip while a stream is in flight

      try {
        const res = await fetch(`/api/blueprints?id=${blueprintId}`);
        if (!res.ok) return;

        const data = await res.json();

        callbacks.onContextMapUpdate(data.contextMap || {});

        if (data.currentPhase && data.currentPhase !== currentPhaseRef.current) {
          callbacks.onPhaseUpdate(data.currentPhase);
        }

        if (data.chatHistory && data.chatHistory.length > messagesLengthRef.current) {
          callbacks.onMessagesUpdate(data.chatHistory);
        }

        const isDiagramPhase =
          currentPhaseRef.current === 'diagram' || currentPhaseRef.current === 'followup';

        if (data.diagramGraph?.nodes && isDiagramPhase) {
          const formattedNodes: Node<ServiceNodeData>[] = data.diagramGraph.nodes.map(
            (node: RawDiagramNode) => ({
              id: node.id,
              type: node.type ?? 'customNode',
              position: node.position ?? { x: 100, y: 100 },
              parentId: node.parentId,
              extent: node.extent,
              style: node.style,
              data: node.data,
            })
          );
          callbacks.onDiagramUpdate(formattedNodes, data.diagramGraph.edges ?? []);
        }
      } catch (err) {
        console.error('Blueprint polling error:', err);
      }
    }, 8000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprintId]); // Stable: only depends on the blueprint ID
}
