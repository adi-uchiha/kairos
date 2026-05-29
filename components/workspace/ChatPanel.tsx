'use client';

import React from 'react';
import { type ChatMessage } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  inputMessage: string;
  activeTab: string;
  isGeneratingDiagram: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  hasAutoStarted: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onGenerateDiagram: () => void;
  onBeginDiscovery: () => void;
}

/** The left-side chat pane: message history, typing indicator, and input bar. */
export function ChatPanel({
  messages,
  isLoading,
  inputMessage,
  activeTab,
  isGeneratingDiagram,
  chatEndRef,
  hasAutoStarted,
  onInputChange,
  onSend,
  onGenerateDiagram,
  onBeginDiscovery,
}: ChatPanelProps) {
  const isFollowup = activeTab === 'followup';

  return (
    <div
      className={`flex flex-col overflow-hidden ${isFollowup ? 'w-[40%] border-r border-[var(--border)] bg-[var(--bg)]' : 'flex-1'}`}
    >
      {/* CHAT LOG */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
            <MaterialIcon
              name="auto_awesome"
              size={32}
              className={`text-[#FF5500] ${hasAutoStarted ? 'animate-pulse' : ''}`}
            />
            <h2 className="text-base font-semibold">Welcome to Kairos Architect</h2>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Let&apos;s start by defining your product idea. Answer a few discovery questions to
              construct your stack map.
            </p>
            {hasAutoStarted ? (
              <p className="text-xs text-[#FF5500] font-mono animate-pulse">
                Kairos is thinking...
              </p>
            ) : (
              <button
                onClick={onBeginDiscovery}
                disabled={isLoading}
                style={{
                  background: '#FF5500',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                BEGIN DISCOVERY
              </button>
            )}
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-5 py-3 text-[14px] leading-relaxed border ${
                  isUser
                    ? 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]'
                    : 'bg-[var(--surface)] border-[var(--orange-border)] text-[var(--text-primary)]'
                }`}
                style={{ borderRadius: 0 }}
              >
                {isUser ? (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div
              className="bg-[var(--surface)] border border-[var(--orange-border)] px-5 py-3 text-[14px] leading-relaxed"
              style={{ borderRadius: 0 }}
            >
              <span className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
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
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg)]">
        {activeTab === 'recommendation' ? (
          <div className="flex justify-center p-2">
            <button
              onClick={onGenerateDiagram}
              disabled={isGeneratingDiagram}
              className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center gap-2"
              style={{
                borderRadius: 0,
                background: '#FF5500',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {isGeneratingDiagram ? (
                <>
                  <MaterialIcon name="sync" size={14} className="animate-spin" />
                  <span>Generating Canvas...</span>
                </>
              ) : (
                <>
                  <MaterialIcon name="auto_awesome" size={14} />
                  <span>Generate Visual Architecture Diagram</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSend();
            }}
            className="flex gap-2 items-end"
          >
            <textarea
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder={
                activeTab === 'followup'
                  ? 'Ask follow-up questions about this architecture...'
                  : 'Ask or reply to Kairos... (Shift+Enter for new line)'
              }
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-[14px] focus:outline-none focus:border-[#FF5500] resize-none"
              style={{
                borderRadius: 0,
                minHeight: '48px',
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
              disabled={isLoading}
              className="px-5 border border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] transition-all flex items-center justify-center"
              style={{ borderRadius: 0, cursor: 'pointer', height: '48px', flexShrink: 0 }}
            >
              <MaterialIcon name="send" size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
