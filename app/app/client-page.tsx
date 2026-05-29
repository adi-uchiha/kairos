'use client';
 
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import { toast } from 'sonner';

import {
  type Blueprint,
  type BlueprintUser,
  type ChatMessage,
  type ContextMap,
  type ServiceNodeData,
  type RawDiagramNode,
  WORKSPACE_PHASES,
} from '@/types/blueprint';
import { useBlueprintPolling } from '@/hooks/useBlueprintPolling';
import { useDiagramQA } from '@/hooks/useDiagramQA';
import { applyDagreLayout } from '@/lib/diagram-layout';

import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { ChatPanel } from '@/components/workspace/ChatPanel';
import { DiagramCanvas } from '@/components/workspace/DiagramCanvas';
import { ContextMapSidebar } from '@/components/workspace/ContextMapSidebar';
import { SwapModal } from '@/components/workspace/SwapModal';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface ClientAppPageProps {
  blueprint: Blueprint;
  user: BlueprintUser;
  isReadOnly?: boolean;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Converts raw diagram node data from the API into a ReactFlow-compatible node. */
function formatDiagramNode(node: RawDiagramNode): Node<ServiceNodeData> {
  return {
    id: node.id,
    type: node.type ?? 'customNode',
    position: node.position ?? { x: 100, y: 100 },
    parentId: node.parentId,
    extent: node.extent,
    style: node.style,
    data: node.data,
  };
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function ClientAppPage({ blueprint, user, isReadOnly = false }: ClientAppPageProps) {
  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>(blueprint.chatHistory ?? []);
  const [inputMessage, setInputMessage] = useState('');
  const [diagramInputMessage, setDiagramInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ── Phase / tab state ───────────────────────────────────────────────────────
  const [currentPhase, setCurrentPhase] = useState(
    blueprint.currentPhase ?? 'project_discovery',
  );

  // ── Context map ─────────────────────────────────────────────────────────────
  const [contextMap, setContextMap] = useState<ContextMap>(blueprint.contextMap ?? {});
  const [showContextMap, setShowContextMap] = useState(false);

  // ── Blueprint name ──────────────────────────────────────────────────────────
  const [blueprintName, setBlueprintName] = useState(blueprint.name ?? 'Untitled Blueprint');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState(blueprint.name ?? 'Untitled Blueprint');
  const [isSavingName, setIsSavingName] = useState(false);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  // ── Diagram state ───────────────────────────────────────────────────────────
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  
  const lastSavedDiagramRef = useRef<{ nodes: Node<ServiceNodeData>[]; edges: Edge[] }>({ nodes: [], edges: [] });

  const initialLaidOut = useMemo(() => {
    const rawNodes = blueprint.diagramGraph?.nodes?.map(formatDiagramNode) ?? [];
    const rawEdges = blueprint.diagramGraph?.edges ?? [];
    if (rawNodes.length === 0) return { nodes: [], edges: [] };
    const hasCustomCoords = rawNodes.some(n => n.position && (n.position.x !== 100 || n.position.y !== 100));
    if (hasCustomCoords) {
      return { nodes: rawNodes, edges: rawEdges };
    }
    return applyDagreLayout(rawNodes, rawEdges, { direction: 'LR' });
  }, [blueprint.diagramGraph]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ServiceNodeData>>(
    initialLaidOut.nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialLaidOut.edges
  );
  
  useEffect(() => {
    lastSavedDiagramRef.current = { nodes: initialLaidOut.nodes, edges: initialLaidOut.edges };
  }, [initialLaidOut]);

  const [selectedNode, setSelectedNode] = useState<Node<ServiceNodeData> | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);

  // ── Custom hooks ────────────────────────────────────────────────────────────
  const diagramQA = useDiagramQA(blueprint.id);

  // ── Theme detection (once on mount) ─────────────────────────────────────────
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  // ── Chat scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Blueprint polling ───────────────────────────────────────────────────────
  useBlueprintPolling(blueprint.id, isLoading, currentPhase, messages.length, {
    onContextMapUpdate: (cm) => setContextMap(cm as ContextMap),
    onPhaseUpdate: (phase) => {
      setCurrentPhase(phase);
    },
    onMessagesUpdate: (msgs) => setMessages(msgs as ChatMessage[]),
    onDiagramUpdate: (newNodes, newEdges) => {
      setNodes((prevNodes) => {
        if (prevNodes.length > 0) {
          const prevIds = prevNodes.map((n) => n.id).sort().join(',');
          const newIds = newNodes.map((n) => n.id).sort().join(',');
          if (prevIds === newIds && prevNodes.length === newNodes.length) {
            return prevNodes; // Preserve custom node positions
          }
        }
        const hasCustomCoords = newNodes.some(n => n.position && (n.position.x !== 100 || n.position.y !== 100));
        if (hasCustomCoords) {
          lastSavedDiagramRef.current = { nodes: newNodes, edges: newEdges };
          return newNodes;
        }
        const { nodes: laidNodes } = applyDagreLayout(newNodes, newEdges, { direction: layoutDirection });
        lastSavedDiagramRef.current = { nodes: laidNodes, edges: newEdges };
        return laidNodes;
      });
      setEdges(newEdges);
    },
  });

  const handleLayoutDirectionChange = useCallback((dir: 'LR' | 'TB') => {
    setLayoutDirection(dir);
    setNodes((prevNodes) => {
      const { nodes: laidNodes } = applyDagreLayout(prevNodes, edges, { direction: dir });
      return laidNodes;
    });
  }, [edges, setNodes]);

  const handleSaveLayout = useCallback(async () => {
    if (isReadOnly) return;
    try {
      const res = await fetch('/api/blueprints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blueprint.id,
          diagramGraph: {
            nodes: nodes.map(n => ({
              id: n.id,
              type: n.type,
              position: n.position,
              parentId: n.parentId,
              extent: n.extent,
              style: n.style,
              data: n.data,
            })),
            edges: edges,
          },
        }),
      });
      if (res.ok) {
        lastSavedDiagramRef.current = { nodes, edges };
        toast.success('Diagram layout saved successfully');
      } else {
        toast.error('Failed to save layout');
      }
    } catch (err) {
      console.error('Failed to save layout:', err);
      toast.error('Error saving layout');
    }
  }, [blueprint.id, nodes, edges, isReadOnly]);

  const handleResetLayout = useCallback(() => {
    if (lastSavedDiagramRef.current.nodes.length > 0) {
      setNodes(lastSavedDiagramRef.current.nodes);
      setEdges(lastSavedDiagramRef.current.edges);
      toast.success('Diagram restored to last saved layout');
    } else {
      setNodes((prevNodes) => {
        const { nodes: laidNodes } = applyDagreLayout(prevNodes, edges, { direction: layoutDirection });
        return laidNodes;
      });
      toast.success('Diagram layout reset to auto-layout');
    }
  }, [edges, layoutDirection, setNodes, setEdges]);

  const handleAutoLayout = useCallback(() => {
    setNodes((prevNodes) => {
      const { nodes: laidNodes } = applyDagreLayout(prevNodes, edges, { direction: layoutDirection });
      return laidNodes;
    });
    toast.success('Diagram layout recalculated automatically');
  }, [edges, layoutDirection, setNodes]);

  // ── Blueprint name save ─────────────────────────────────────────────────────
  const handleSaveBlueprintName = async () => {
    if (isReadOnly) return;
    const trimmed = editNameInput.trim();
    if (!trimmed) {
      toast.error('Blueprint name cannot be empty');
      return;
    }
    setIsSavingName(true);
    try {
      const res = await fetch('/api/blueprints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blueprint.id, name: trimmed }),
      });
      if (res.ok) {
        setBlueprintName(trimmed);
        setIsEditingName(false);
        toast.success('Blueprint name updated successfully');
      } else {
        toast.error('Failed to update blueprint name');
      }
    } catch {
      toast.error('An error occurred while updating the blueprint name');
    } finally {
      setIsSavingName(false);
    }
  };

  // ── Core send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (overrideText?: string) => {
      if (isReadOnly && overrideText !== '__KAIROS_OPEN__') {
        toast.error('This shared workspace is in read-only mode.');
        return;
      }
      const userText = overrideText ?? inputMessage.trim();
      if (!userText || isLoading) return;

      if (!overrideText) setInputMessage('');
      setIsLoading(true);

      if (userText !== '__KAIROS_OPEN__') {
        setMessages((prev) => [...prev, { role: 'user', content: userText }]);
      }

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: blueprint.id,
            message: userText,
            history: messages,
            phase: currentPhase,
          }),
        });

        if (!response.ok) {
          let errData: Record<string, unknown> = {};
          try {
            errData = await response.json();
          } catch {
            /* ignore */
          }
          if (response.status === 503 || errData?.error === 'service_overloaded') {
            toast.warning('Kairos is at capacity', {
              description: 'All API keys are rate-limited. Try again in ~30 seconds.',
              duration: 8000,
            });
          } else {
            toast.error('Something went wrong', {
              description: (errData?.message as string) || `Server returned ${response.status}`,
              duration: 6000,
            });
          }
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantResponse = '';

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { value, done } = await reader!.read();
          if (done) break;
          assistantResponse += decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: assistantResponse };
            return updated;
          });
        }

        // Sync context map and phase only — do NOT overwrite messages here.
        // The background analysis write is async so reading chatHistory now would return stale data.
        const syncRes = await fetch(`/api/blueprints?id=${blueprint.id}`);
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          setContextMap(syncData.contextMap ?? {});
          setCurrentPhase(syncData.currentPhase ?? 'project_discovery');
        }
      } catch {
        toast.error('Message failed to send', {
          description: 'An unexpected error occurred. Please try again.',
          duration: 6000,
        });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.content === '') return prev.slice(0, -1);
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [blueprint.id, inputMessage, isLoading, messages, currentPhase, isReadOnly],
  );

  // Auto-fire opening question on fresh workspaces
  useEffect(() => {
    if (messages.length === 0 && !hasAutoStarted && !isLoading) {
      setHasAutoStarted(true);
      sendMessage('__KAIROS_OPEN__');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    sendMessage();
  };

  const handleMcqSelect = useCallback((value: string, label: string) => {
    sendMessage(label);
  }, [sendMessage]);

  const handleSubjectiveSubmit = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  // ── Diagram generation ──────────────────────────────────────────────────────
  const handleGenerateDiagram = async () => {
    if (isReadOnly) return;
    setIsGeneratingDiagram(true);
    try {
      const res = await fetch('/api/blueprints/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId: blueprint.id }),
      });
      if (res.ok) {
        const data = await res.json();
        const rawNodes = data.graph.nodes.map(formatDiagramNode);
        const rawEdges = data.graph.edges ?? [];
        const { nodes: laidNodes, edges: laidEdges } = applyDagreLayout(rawNodes, rawEdges, { direction: layoutDirection });
        setNodes(laidNodes);
        setEdges(laidEdges);
        setCurrentPhase('diagram');
      }
    } catch (err) {
      console.error('Failed to generate diagram:', err);
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  // ── Node swap ───────────────────────────────────────────────────────────────
  const handleSwapNode = async (replacement: string) => {
    if (isReadOnly || !selectedNode) return;
    setIsSwapping(true);
    try {
      const res = await fetch('/api/blueprints/diagram/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId: blueprint.id,
          nodeId: selectedNode.id,
          replacement,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const rawNodes = data.graph.nodes.map(formatDiagramNode);
        const rawEdges = data.graph.edges ?? [];
        const { nodes: laidNodes, edges: laidEdges } = applyDagreLayout(rawNodes, rawEdges, { direction: layoutDirection });
        setNodes(laidNodes);
        setEdges(laidEdges);
        setSelectedNode(laidNodes.find((n: Node<ServiceNodeData>) => n.id === selectedNode.id) ?? null);
        setShowSwapModal(false);
      }
    } catch (err) {
      console.error('Failed to swap node:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  // ── Node Q&A wrapper (bridges hook to component) ────────────────────────────
  const handleAskNodeWithId = (e: React.FormEvent) => {
    if (!selectedNode) return;
    diagramQA.handleAskNode(e, selectedNode.id);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="h-screen w-screen flex flex-col font-sans overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* Header */}
      <WorkspaceHeader
        blueprintName={blueprintName}
        isEditingName={isEditingName}
        editNameInput={editNameInput}
        isSavingName={isSavingName}
        isReadOnly={isReadOnly}
        theme={theme}
        onEditNameChange={setEditNameInput}
        onSaveName={handleSaveBlueprintName}
        onCancelEdit={() => {
          setEditNameInput(blueprintName);
          setIsEditingName(false);
        }}
        onStartEdit={() => {
          setEditNameInput(blueprintName);
          setIsEditingName(true);
        }}
        onToggleTheme={toggleTheme}
        onToggleContextMap={() => setShowContextMap((v) => !v)}
      />

      {/* Workspace layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar — hidden on mobile */}
        <WorkspaceSidebar
          phases={WORKSPACE_PHASES}
          currentPhase={currentPhase}
          userName={user.name}
        />

        {/* Centre content — stacks vertically on mobile, side-by-side on md+ */}
        <main className={`flex-1 overflow-hidden relative flex ${nodes.length > 0 ? 'flex-col md:flex-row' : 'flex-col'}`}>
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            inputMessage={inputMessage}
            currentPhase={currentPhase}
            isGeneratingDiagram={isGeneratingDiagram}
            chatEndRef={chatEndRef}
            hasAutoStarted={hasAutoStarted}
            onInputChange={setInputMessage}
            onSend={handleSendMessage}
            onGenerateDiagram={handleGenerateDiagram}
            onBeginDiscovery={() => {
              setHasAutoStarted(true);
              sendMessage('__KAIROS_OPEN__');
            }}
            onMcqSelect={handleMcqSelect}
            onSubjectiveSubmit={handleSubjectiveSubmit}
            hasDiagram={nodes.length > 0}
          />

          {nodes.length > 0 && (
            <DiagramCanvas
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              showGeneralAskPanel={diagramQA.showGeneralAskPanel}
              nodeQuestions={diagramQA.nodeQuestions}
              nodeInput={diagramQA.nodeInput}
              generalQuestions={diagramQA.generalQuestions}
              inputMessage={diagramInputMessage}
              isAskingNode={diagramQA.isAskingNode}
              isReadOnly={isReadOnly}
              blueprintName={blueprintName}
              theme={theme}
              layoutDirection={layoutDirection}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_e, node) => {
                if (node.type === 'group') return;
                setSelectedNode(node as Node<ServiceNodeData>);
              }}
              onLayoutDirectionChange={handleLayoutDirectionChange}
              onCloseNode={() => setSelectedNode(null)}
              onOpenSwapModal={() => setShowSwapModal(true)}
              onNodeInputChange={diagramQA.setNodeInput}
              onAskNode={handleAskNodeWithId}
              onCloseGeneralPanel={() => diagramQA.setShowGeneralAskPanel(false)}
              onInputMessageChange={setDiagramInputMessage}
              onAskGeneral={diagramQA.handleAskGeneralDiagram}
              onResetLayout={handleResetLayout}
              onSaveLayout={handleSaveLayout}
              onAutoLayout={handleAutoLayout}
            />
          )}
        </main>

        {/* Right context map sidebar */}
        {showContextMap && (
          <ContextMapSidebar
            contextMap={contextMap}
            onClose={() => setShowContextMap(false)}
          />
        )}
      </div>

      {/* Service swap modal */}
      {showSwapModal && selectedNode && (
        <SwapModal
          selectedNode={selectedNode}
          isSwapping={isSwapping}
          onSwap={handleSwapNode}
          onClose={() => setShowSwapModal(false)}
        />
      )}
    </div>
  );
}
