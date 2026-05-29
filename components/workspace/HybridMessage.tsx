'use client';

import React, { useState } from 'react';
import { type ChatMessage } from '@/types/blueprint';
import { parseMcqBlocks } from '@/lib/mcq-parser';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { McqChoices } from './McqChoices';
import { SubjectiveInputPanel } from './SubjectiveInputPanel';

interface HybridMessageProps {
  message: ChatMessage;
  isLatest: boolean;
  onMcqSelect: (value: string, label: string, field: string) => void;
  onSubjectiveSubmit: (text: string, field: string) => void;
  disabled?: boolean;
}

export function HybridMessage({
  message,
  isLatest,
  onMcqSelect,
  onSubjectiveSubmit,
  disabled = false,
}: HybridMessageProps) {
  const isUser = message.role === 'user';

  // Track selections for multi-block messages locally
  const [selections, setSelections] = useState<Record<string, { value: string; label: string }>>(
    {}
  );

  if (isUser) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>;
  }

  // Render a temporary "Thinking..." response while waiting for stream data
  if (message.content === '') {
    return (
      <div className="flex items-center gap-2 py-1">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
        <span className="text-[var(--text-muted)] text-xs font-mono ml-1">Thinking...</span>
      </div>
    );
  }

  // Parse assistant message content
  const { textContent, blocks } = parseMcqBlocks(message.content);

  // If there is only a single block and it's MCQ, auto-submit on click (original quick behavior)
  const isSingleMcq = blocks.length === 1 && blocks[0].type === 'mcq';

  const handleMcqChoiceSelect = (field: string, value: string, label: string) => {
    if (isSingleMcq) {
      onMcqSelect(value, label, field);
    } else {
      setSelections((prev) => ({
        ...prev,
        [field]: { value, label },
      }));
    }
  };

  const handleSubjectiveTextSubmit = (field: string, text: string) => {
    if (text === '') {
      // Edit/clear selection
      setSelections((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } else {
      setSelections((prev) => ({
        ...prev,
        [field]: { value: text, label: text },
      }));
    }
  };

  const handleSubmitAll = () => {
    if (disabled) return;

    // Build the combined response
    const lines = Object.entries(selections).map(([field, item]) => {
      const block = blocks.find((b) => b.field === field);
      const question = block
        ? block.type === 'mcq'
          ? block.question.replace(/\?$/, '')
          : block.label.replace(/\?$/, '')
        : field;
      return `${question}: ${item.label}`;
    });

    if (lines.length === 0) return;

    // Call onSubjectiveSubmit to send the combined text to the AI
    onSubjectiveSubmit(lines.join('\n'), 'multi-block');
  };

  // Only show the confirm button if we are in a multi-block message and have selections
  const showConfirmButton =
    isLatest && !isSingleMcq && blocks.length > 0 && Object.keys(selections).length > 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Human conversational text */}
      <MarkdownRenderer content={textContent} />

      {/* Render interactive blocks */}
      {blocks.map((block, idx) => {
        const value = selections[block.field];

        if (block.type === 'mcq') {
          return (
            <McqChoices
              key={`${block.field}-${idx}`}
              block={block}
              disabled={!isLatest || disabled}
              selectedValue={value?.value}
              onSelect={(val, lab) => handleMcqChoiceSelect(block.field, val, lab)}
            />
          );
        } else if (block.type === 'subjective') {
          return (
            <SubjectiveInputPanel
              key={`${block.field}-${idx}`}
              block={block}
              disabled={!isLatest || disabled}
              selectedValue={value?.value}
              onSubmit={(text) => handleSubjectiveTextSubmit(block.field, text)}
            />
          );
        }
        return null;
      })}

      {/* Unified submit button for multi-block messages */}
      {showConfirmButton && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={handleSubmitAll}
            disabled={disabled}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#FF5500] hover:bg-[#E04B00] transition-all flex items-center gap-2 cursor-pointer border-none uppercase tracking-wider font-mono"
            style={{ borderRadius: 0 }}
          >
            <span>Confirm Selections</span>
          </button>
        </div>
      )}
    </div>
  );
}
