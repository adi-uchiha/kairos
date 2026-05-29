'use client';

import React, { useState, useRef } from 'react';
import { type SubjectiveBlock } from '@/lib/mcq-parser';
import { MaterialIcon } from './MaterialIcon';

interface SubjectiveInputPanelProps {
  block: SubjectiveBlock;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  selectedValue?: string;
}

export function SubjectiveInputPanel({
  block,
  onSubmit,
  disabled = false,
  selectedValue,
}: SubjectiveInputPanelProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  if (selectedValue) {
    return (
      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider font-mono">
          {block.label}
        </p>
        <div className="flex justify-between items-center bg-[var(--surface-hover)] border border-[var(--border)] px-4 py-2.5">
          <span className="text-xs text-[var(--text-primary)]">{selectedValue}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSubmit('')}
            className="text-[10px] text-[#FF5500] hover:underline uppercase font-semibold font-mono cursor-pointer border-none bg-transparent"
          >
            [ Edit ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border)]">
      <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider font-mono">
        {block.label}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end mt-1.5">
        <textarea
          ref={textareaRef}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={block.placeholder || 'Type your reply here... (Shift+Enter for new line)'}
          rows={2}
          className="flex-1 bg-[var(--surface)] border border-[var(--border)] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#FF5500] resize-none text-[var(--text-primary)]"
          style={{
            borderRadius: 0,
            minHeight: '60px',
            maxHeight: '160px',
            overflowY: 'auto',
            lineHeight: '1.5',
            height: 'auto',
          }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
          }}
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={`px-4 border transition-all flex items-center justify-center ${
            disabled || !text.trim()
              ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] cursor-not-allowed'
              : 'border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] cursor-pointer'
          }`}
          style={{ borderRadius: 0, height: '48px', flexShrink: 0 }}
        >
          <MaterialIcon name="send" size={14} />
        </button>
      </form>
    </div>
  );
}
