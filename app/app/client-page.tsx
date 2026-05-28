'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from '@xyflow/react';
import {
  Send,
  Sparkles,
  ChevronRight,
  Compass,
  Database,
  Terminal,
  Settings,
  Layers,
  FileText,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Download,
  Share2,
  RefreshCw,
  X,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

// ─── TYPES & SCHEMA ──────────────────────────────────────────────────────────

interface ClientAppPageProps {
  blueprint: {
    id: string;
    name: string;
    currentPhase: string;
    chatHistory: any[];
    contextMap: any;
    diagramGraph: any;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ─── REACTFLOW CUSTOM NODE ───────────────────────────────────────────────────

function CustomServiceNode({ data }: NodeProps<any>) {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'frontend':
      case 'hosting':
        return '#0070f3'; // Blue
      case 'backend':
        return '#ff5500'; // Orange
      case 'database':
      case 'storage':
        return '#10b981'; // Green
      case 'auth':
        return '#8b5cf6'; // Purple
      default:
        return '#71717a'; // Muted Gray
    }
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '12px 16px',
        minWidth: '180px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: 'var(--border)' }} />

      {/* Top Accent Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: getCategoryColor(data.category),
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          {data.category}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{data.label}</span>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--border)' }} />
    </div>
  );
}

// ─── CLIENT APP COMPONENT ────────────────────────────────────────────────────

export function ClientAppPage({ blueprint, user }: ClientAppPageProps) {
  const router = useRouter();

  // Dynamic state
  const [messages, setMessages] = useState<any[]>(blueprint.chatHistory || []);
  const [currentPhase, setCurrentPhase] = useState<string>(blueprint.currentPhase || 'project_discovery');
  const [contextMap, setContextMap] = useState<any>(blueprint.contextMap || {});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContextMap, setShowContextMap] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);

  // Refs for scroll and live-value access in intervals
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const currentPhaseRef = useRef(currentPhase);
  const messagesLengthRef = useRef(messages.length);

  // Keep refs in sync with state
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);
  useEffect(() => { messagesLengthRef.current = messages.length; }, [messages.length]);

  // Refs for scroll container

  // Detect theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  // Phases mapping for sidebar navigation
  const phases = [
    { id: 'project_discovery', label: 'Discovery', icon: Compass },
    { id: 'scale_discovery', label: 'Scale & Growth', icon: Database },
    { id: 'builder_context', label: 'Builder Context', icon: Terminal },
    { id: 'constraints', label: 'Constraints', icon: Settings },
    { id: 'recommendation', label: 'Recommendation', icon: FileText },
    { id: 'diagram', label: 'Visual Diagram', icon: Layers },
    { id: 'followup', label: 'Follow-up', icon: HelpCircle },
  ];

  // Map nodes and edges when diagramGraph updates
  useEffect(() => {
    if (blueprint.diagramGraph && blueprint.diagramGraph.nodes) {
      const formattedNodes = blueprint.diagramGraph.nodes.map((node: any) => ({
        id: node.id,
        type: 'customNode',
        position: node.position || { x: 100, y: 100 },
        data: node.data,
      }));
      setNodes(formattedNodes);
      setEdges(blueprint.diagramGraph.edges || []);
    }
  }, [blueprint.diagramGraph, setNodes, setEdges]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ─── POLLING BLUEPRINT UPDATES ─────────────────────────────────────────────
  // Reads live values via refs to avoid re-mounting the interval on every state change.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isLoadingRef.current) return; // skip while a stream is in flight
      try {
        const res = await fetch(`/api/blueprints?id=${blueprint.id}`);
        if (res.ok) {
          const data = await res.json();
          setContextMap(data.contextMap || {});
          setCurrentPhase(data.currentPhase || 'project_discovery');
          if (data.chatHistory && data.chatHistory.length > messagesLengthRef.current) {
            setMessages(data.chatHistory);
          }
          if (data.diagramGraph && data.diagramGraph.nodes && currentPhaseRef.current === 'diagram') {
            const formattedNodes = data.diagramGraph.nodes.map((node: any) => ({
              id: node.id,
              type: 'customNode',
              position: node.position || { x: 100, y: 100 },
              data: node.data,
            }));
            setNodes(formattedNodes);
            setEdges(data.diagramGraph.edges || []);
          }
        }
      } catch (err) {
        console.error('Failed to poll blueprint updates:', err);
      }
    }, 8000); // 8s is plenty — background analysis takes ~2–4s anyway

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blueprint.id, setNodes, setEdges]); // stable: only depends on the blueprint ID

  // ─── REACTFLOW CONSTANTS ───────────────────────────────────────────────────

  const nodeTypes = useMemo(() => ({ customNode: CustomServiceNode }), []);

  // ─── ACTIONS ────────────────────────────────────────────────────────────────

  // Core send function — accepts an explicit override text for auto-triggers
  const sendMessage = useCallback(async (overrideText?: string) => {
    const userText = overrideText ?? inputMessage.trim();
    if (!userText || isLoading) return;

    if (!overrideText) setInputMessage('');
    setIsLoading(true);

    // Only add a visible user bubble for real user messages
    if (!overrideText) {
      setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: blueprint.id,
          message: userText,
          history: overrideText ? [] : messages,
          phase: currentPhase,
        }),
      });

      if (!response.ok) {
        // Parse the JSON error body if available
        let errData: any = {};
        try { errData = await response.json(); } catch { /* ignore */ }

        if (response.status === 503 || errData?.error === 'service_overloaded') {
          toast.warning('Kairos is at capacity', {
            description: 'All API keys are rate-limited right now. Try again in ~30 seconds.',
            duration: 8000,
          });
        } else {
          toast.error('Something went wrong', {
            description: errData?.message || `Server returned ${response.status}`,
            duration: 6000,
          });
        }
        return; // exit early — finally block resets isLoading
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

      // Only sync contextMap and phase — do NOT overwrite messages from DB here.
      // The background analyzeAndUpdateBlueprint write is async and likely hasn't
      // completed yet, so reading chatHistory now would return stale empty data
      // and reset the messages the user is already seeing.
      const syncRes = await fetch(`/api/blueprints?id=${blueprint.id}`);
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setContextMap(syncData.contextMap || {});
        setCurrentPhase(syncData.currentPhase || 'project_discovery');
        // messages intentionally NOT synced here — polling will handle eventual consistency
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Message failed to send', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 6000,
      });
      // Remove the optimistic empty assistant bubble if streaming never started
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [blueprint.id, inputMessage, isLoading, messages, currentPhase]);

  // Auto-fire the opening question on fresh workspaces (runs once on mount)
  useEffect(() => {
    if (messages.length === 0 && !hasAutoStarted && !isLoading) {
      setHasAutoStarted(true);
      sendMessage('__KAIROS_OPEN__');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public handler — wraps sendMessage for form submissions
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    await sendMessage();
  };

  // Trigger visual diagram generation
  const handleGenerateDiagram = async () => {
    setIsGeneratingDiagram(true);
    try {
      const res = await fetch('/api/blueprints/diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId: blueprint.id }),
      });

      if (res.ok) {
        const data = await res.json();
        const formattedNodes = data.graph.nodes.map((node: any) => ({
          id: node.id,
          type: 'customNode',
          position: node.position || { x: 100, y: 100 },
          data: node.data,
        }));
        setNodes(formattedNodes);
        setEdges(data.graph.edges || []);
        setCurrentPhase('diagram');
      }
    } catch (err) {
      console.error('Failed to generate diagram:', err);
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  // Swap service node
  const handleSwapNode = async (replacement: string) => {
    if (!selectedNode) return;
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
        const formattedNodes = data.graph.nodes.map((node: any) => ({
          id: node.id,
          type: 'customNode',
          position: node.position || { x: 100, y: 100 },
          data: node.data,
        }));
        setNodes(formattedNodes);
        setEdges(data.graph.edges || []);
        // Update selected node state reference
        const updatedSelected = formattedNodes.find((n: any) => n.id === selectedNode.id);
        setSelectedNode(updatedSelected || null);
        setShowSwapModal(false);
      }
    } catch (err) {
      console.error('Failed to swap node:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  // Node click handler
  const onNodeClick = (_event: any, node: Node) => {
    setSelectedNode(node);
  };

  // Export functions
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ nodes, edges }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${blueprint.name || 'architecture'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Check current phase layout settings
  const isRecommendationPhase = currentPhase === 'recommendation';
  const isDiagramPhase = currentPhase === 'diagram' || currentPhase === 'followup';

  return (
    <div
      className="h-screen w-screen flex flex-col font-sans overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-1 hover:bg-[var(--surface-hover)] transition-all">
            <ChevronLeft size={18} />
          </Link>
          <span className="font-mono text-xs text-[#FF5500] uppercase tracking-wider hidden sm:inline">
            [ Workspace ]
          </span>
          <span className="font-semibold text-sm border-l border-[var(--border)] pl-3 hidden sm:inline">
            {blueprint.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : theme === 'light' ? <Moon size={18} /> : <div style={{ width: 18, height: 18 }} />}
          </button>

          <button
            onClick={() => setShowContextMap(!showContextMap)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all"
            style={{ borderRadius: 0 }}
          >
            <Info size={14} />
            <span>CONTEXT</span>
          </button>
        </div>
      </header>

      {/* ─── WORKSPACE LAYOUT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PROGRESS BAR */}
        <aside className="w-56 border-r border-[var(--border)] flex flex-col justify-between p-4 shrink-0 bg-[var(--surface)] hidden md:flex">
          <div className="space-y-4">
            <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-6">
              [ Design Steps ]
            </div>
            <nav className="flex flex-col gap-1">
              {phases.map((p, idx) => {
                const isCurrent = currentPhase === p.id;
                const isPassed = phases.findIndex((ph) => ph.id === currentPhase) > idx;
                const Icon = p.icon;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-all ${
                      isCurrent
                        ? 'bg-[var(--orange-wash)] text-[#FF5500] border-l-2 border-[#FF5500]'
                        : isPassed
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon size={16} className={isCurrent ? 'text-[#FF5500]' : ''} />
                    <span className="font-medium">{p.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-[var(--border)] pt-4 font-mono text-[10px] text-[var(--text-muted)]">
            USER: {user.name}
          </div>
        </aside>

        {/* CENTER CONTENT */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* ─── TEXT CHAT LAYOUT ─── */}
          {!isDiagramPhase && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* CHAT LOG */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                    <Sparkles size={32} className={`text-[#FF5500] ${hasAutoStarted ? 'animate-pulse' : ''}`} />
                    <h2 className="text-base font-semibold">Welcome to Kairos Architect</h2>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Let&apos;s start by defining your product idea. Answer a few discovery questions to construct your stack map.
                    </p>
                    {hasAutoStarted ? (
                      <p className="text-xs text-[#FF5500] font-mono animate-pulse">Kairos is thinking...</p>
                    ) : (
                      <button
                        onClick={() => { setHasAutoStarted(true); sendMessage('__KAIROS_OPEN__'); }}
                        disabled={isLoading}
                        style={{ background: '#FF5500', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        BEGIN DISCOVERY
                      </button>
                    )}
                  </div>
                )}

                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-5 py-3 text-[14px] leading-relaxed border ${
                          isUser
                            ? 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]'
                            : 'bg-[var(--surface)] border-[var(--orange-border)] text-[var(--text-primary)]'
                        }`}
                        style={{ whiteSpace: 'pre-wrap', borderRadius: 0 }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator — only show during active conversation, not on the empty welcome screen */}
                {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
                  <div className="flex justify-start">
                    <div
                      className="bg-[var(--surface)] border border-[var(--orange-border)] px-5 py-3 text-[14px] leading-relaxed"
                      style={{ borderRadius: 0 }}
                    >
                      <span className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* CHAT INPUT BAR */}
              <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg)]">
                {isRecommendationPhase ? (
                  <div className="flex justify-center p-2">
                    <button
                      onClick={handleGenerateDiagram}
                      disabled={isGeneratingDiagram}
                      className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-2"
                      style={{ borderRadius: 0, background: '#FF5500', width: '100%', justifyItems: 'center', justifyContent: 'center' }}
                    >
                      {isGeneratingDiagram ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Generating Canvas...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate Visual Architecture Diagram</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask or reply to Kairos..."
                      disabled={isLoading}
                      className="flex-1 bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-[14px] focus:outline-none focus:border-[#FF5500]"
                      style={{ borderRadius: 0 }}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 border border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] transition-all flex items-center justify-center"
                      style={{ borderRadius: 0, cursor: 'pointer' }}
                    >
                      <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ─── VISUAL DIAGRAM CANVAS LAYOUT ─── */}
          {isDiagramPhase && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div className="flex-1 relative">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes as any}
                  fitView
                >
                  <Background color="var(--border)" gap={16} size={1} />
                  <Controls style={{ borderRadius: 0, border: '1px solid var(--border)', background: 'var(--surface)' }} />
                </ReactFlow>

                {/* Flow Floating Toolbar */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={handleExportJSON}
                    className="p-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all flex items-center gap-1.5 text-xs font-semibold"
                    style={{ borderRadius: 0 }}
                    title="Export JSON representation"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Shareable URL copied to clipboard!');
                    }}
                    className="p-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-all flex items-center gap-1.5 text-xs font-semibold"
                    style={{ borderRadius: 0 }}
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">SHARE</span>
                  </button>
                </div>

                {/* Node Detail Drawer / Info Panel */}
                {selectedNode && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-80 border-l border-[var(--border)] p-6 bg-[var(--surface)] z-20 flex flex-col justify-between overflow-y-auto"
                    style={{ boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)' }}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                        <span className="font-mono text-[9px] text-[#FF5500] uppercase tracking-wider">
                          [ Service Details ]
                        </span>
                        <button
                          onClick={() => setSelectedNode(null)}
                          className="p-1 hover:bg-[var(--surface-hover)]"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">{selectedNode.data.label}</h3>
                        <span className="text-[10px] uppercase font-mono bg-[var(--border)] px-2 py-0.5 inline-block">
                          {selectedNode.data.category}
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[var(--text-muted)] font-mono uppercase text-[9px]">Why Chosen</span>
                          <p className="leading-relaxed">{selectedNode.data.why}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--text-muted)] font-mono uppercase text-[9px]">Free Tier Limits</span>
                          <p className="leading-relaxed">{selectedNode.data.free_tier || 'None / Not Applicable'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--text-muted)] font-mono uppercase text-[9px]">Cost at Scale</span>
                          <p className="leading-relaxed">{selectedNode.data.cost_at_scale || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[var(--text-muted)] font-mono uppercase text-[9px]">Upgrade Trigger</span>
                          <p className="leading-relaxed">{selectedNode.data.upgrade_signal || 'Grow past free limits'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)] mt-6 space-y-2">
                      <button
                        onClick={() => setShowSwapModal(true)}
                        className="w-full py-2 px-4 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-white transition-all text-xs font-semibold uppercase tracking-wider"
                        style={{ borderRadius: 0 }}
                      >
                        Swap Service
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* persistent chat bar at bottom of diagram */}
              <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg)] relative z-10 flex flex-col gap-3">
                {/* Chat Log Snippet inside Canvas if messages exist */}
                <div className="flex gap-2 max-w-full">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask questions about this diagram (e.g. 'what if database goes down?')..."
                    className="flex-1 bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-[14px] focus:outline-none focus:border-[#FF5500]"
                    style={{ borderRadius: 0 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Redirect user to text stream popup or log dialog question
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    className="px-5 border border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] transition-all flex items-center justify-center"
                    style={{ borderRadius: 0, cursor: 'pointer' }}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR (COLLAPSIBLE CONTEXT MAP) */}
        {showContextMap && (
          <aside className="w-80 border-l border-[var(--border)] p-6 bg-[var(--surface)] overflow-y-auto relative z-25 shrink-0 flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)] mb-6">
              <span className="font-mono text-[10px] text-[#FF5500] uppercase tracking-widest font-semibold">
                [ Live Context Map ]
              </span>
              <button
                onClick={() => setShowContextMap(false)}
                className="p-1 hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 text-xs flex-1">
              {Object.entries(contextMap).map(([key, value]) => {
                if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                  return null;
                }

                // Format key nicely
                const formattedKey = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char) => char.toUpperCase());

                return (
                  <div key={key} className="space-y-1 border-b border-[var(--border)] pb-2.5">
                    <span className="text-[var(--text-muted)] font-mono text-[9px] uppercase">
                      {formattedKey}
                    </span>
                    <div className="font-semibold text-[13px] leading-relaxed">
                      {Array.isArray(value)
                        ? value.join(', ')
                        : typeof value === 'boolean'
                          ? value
                            ? 'Yes'
                            : 'No'
                          : String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* SWAP ALTERNATIVE MODAL */}
      {showSwapModal && selectedNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowSwapModal(false)}
        >
          <div
            className="w-full max-w-sm border border-[var(--border)] p-6 bg-[var(--surface)] space-y-6"
            style={{ borderRadius: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider">
                Swap {selectedNode.data.label}
              </h4>
              <button onClick={() => setShowSwapModal(false)} className="p-1 hover:bg-[var(--surface-hover)]">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Select an alternative service to substitute for {selectedNode.data.label}. The system will automatically re-reason connected database, client pipelines, and outbound triggers.
              </p>

              {(selectedNode.data.alternatives || []).length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] text-center py-4">
                  No predefined alternatives listed. Type a custom replacement below.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {(selectedNode.data.alternatives || []).map((alt: string) => (
                    <button
                      key={alt}
                      onClick={() => handleSwapNode(alt)}
                      disabled={isSwapping}
                      className="w-full py-2.5 px-4 text-left text-xs font-medium border border-[var(--border)] hover:border-[#FF5500] hover:text-[#FF5500] bg-[var(--bg)] transition-all flex items-center justify-between"
                      style={{ borderRadius: 0 }}
                    >
                      <span>{alt}</span>
                      <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
