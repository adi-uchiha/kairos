import { useState } from 'react';
import { toast } from 'sonner';
import { type QAPair, AI_THINKING_PLACEHOLDER } from '@/types/blueprint';

/**
 * Manages Q&A state and API calls for both node-level and general diagram queries.
 *
 * - `nodeQuestions` is a map of nodeId → conversation history.
 * - `generalQuestions` is the overall diagram Q&A list.
 */
export function useDiagramQA(blueprintId: string) {
  const [nodeQuestions, setNodeQuestions] = useState<Record<string, QAPair[]>>({});
  const [nodeInput, setNodeInput] = useState('');
  const [isAskingNode, setIsAskingNode] = useState(false);

  const [generalQuestions, setGeneralQuestions] = useState<QAPair[]>([]);
  const [isAskingGeneral, setIsAskingGeneral] = useState(false);
  const [showGeneralAskPanel, setShowGeneralAskPanel] = useState(false);

  // ─── Shared API call ──────────────────────────────────────────────────────

  async function askDiagram(question: string, nodeId?: string): Promise<string> {
    const res = await fetch('/api/blueprints/diagram/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprintId, question, nodeId }),
    });

    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();
    return data.answer as string;
  }

  // ─── Node Q&A ─────────────────────────────────────────────────────────────

  const handleAskNode = async (e: React.FormEvent, selectedNodeId: string) => {
    e.preventDefault();
    if (!nodeInput.trim() || !selectedNodeId || isAskingNode) return;

    const question = nodeInput.trim();
    setNodeInput('');
    setIsAskingNode(true);

    setNodeQuestions((prev) => ({
      ...prev,
      [selectedNodeId]: [...(prev[selectedNodeId] ?? []), { q: question, a: AI_THINKING_PLACEHOLDER }],
    }));

    try {
      const answer = await askDiagram(question, selectedNodeId);
      setNodeQuestions((prev) => {
        const list = [...(prev[selectedNodeId] ?? [])];
        if (list.length > 0) list[list.length - 1] = { q: question, a: answer };
        return { ...prev, [selectedNodeId]: list };
      });
    } catch (err) {
      console.error('Node Q&A error:', err);
      setNodeQuestions((prev) => {
        const list = [...(prev[selectedNodeId] ?? [])];
        if (list.length > 0)
          list[list.length - 1] = { q: question, a: 'An error occurred. Please try again.' };
        return { ...prev, [selectedNodeId]: list };
      });
      toast.error('Failed to get answer from AI');
    } finally {
      setIsAskingNode(false);
    }
  };

  // ─── General Diagram Q&A ──────────────────────────────────────────────────

  const handleAskGeneralDiagram = async (questionText: string) => {
    if (!questionText.trim() || isAskingGeneral) return;

    const question = questionText.trim();
    setIsAskingGeneral(true);
    setShowGeneralAskPanel(true);

    setGeneralQuestions((prev) => [...prev, { q: question, a: AI_THINKING_PLACEHOLDER }]);

    try {
      const answer = await askDiagram(question);
      setGeneralQuestions((prev) => {
        const list = [...prev];
        if (list.length > 0) list[list.length - 1] = { q: question, a: answer };
        return list;
      });
    } catch (err) {
      console.error('General Q&A error:', err);
      setGeneralQuestions((prev) => {
        const list = [...prev];
        if (list.length > 0)
          list[list.length - 1] = { q: question, a: 'An error occurred. Please try again.' };
        return list;
      });
      toast.error('Failed to get answer from AI');
    } finally {
      setIsAskingGeneral(false);
    }
  };

  return {
    // Node Q&A
    nodeQuestions,
    nodeInput,
    setNodeInput,
    isAskingNode,
    handleAskNode,
    // General Q&A
    generalQuestions,
    isAskingGeneral,
    showGeneralAskPanel,
    setShowGeneralAskPanel,
    handleAskGeneralDiagram,
  };
}
