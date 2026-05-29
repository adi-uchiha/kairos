'use client';

import React from 'react';
import { type ChatMessage } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';
import { HybridMessage } from './HybridMessage';
import { parseMcqBlocks } from '@/lib/mcq-parser';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  inputMessage: string;
  currentPhase: string;
  isGeneratingDiagram: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  hasAutoStarted: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onGenerateDiagram: () => void;
  onBeginDiscovery: () => void;
  onMcqSelect: (value: string, label: string, field: string) => void;
  onSubjectiveSubmit: (text: string, field: string) => void;
  hasDiagram: boolean;
}

/** The left-side chat pane: message history, typing indicator, and input bar. */
export function ChatPanel({
  messages,
  isLoading,
  inputMessage,
  currentPhase,
  isGeneratingDiagram,
  chatEndRef,
  hasAutoStarted,
  onInputChange,
  onSend,
  onGenerateDiagram,
  onBeginDiscovery,
  onMcqSelect,
  onSubjectiveSubmit,
  hasDiagram,
}: ChatPanelProps) {
  const isFollowup = hasDiagram;

  // Check if the latest message has interactive blocks
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const isLatestAssistant = latestMessage && latestMessage.role === 'assistant';
  
  const { blocks = [] } = isLatestAssistant 
    ? parseMcqBlocks(latestMessage.content) 
    : { blocks: [] };

  const hasInteractiveBlocks = blocks.length > 0;
  
  // Hide default input bar if in MCQ-hybrid phases and there are interactive blocks in the latest message
  const isFreeTextPhase = ['project_discovery', 'recommendation', 'diagram', 'followup'].includes(currentPhase);
  const shouldHideInputBar = hasInteractiveBlocks && !isFreeTextPhase;



  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isFollowup
          ? 'w-full md:w-[40%] border-b md:border-b-0 md:border-r border-[var(--border)] bg-[var(--bg)] max-h-[45vh] md:max-h-none'
          : 'flex-1'
      }`}
    >
      {/* CHAT LOG */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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
          const isLatest = index === messages.length - 1;

          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-4 md:px-5 py-3 text-[13px] md:text-[14px] leading-relaxed border ${
                  isUser
                    ? 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]'
                    : 'bg-[var(--surface)] border-[var(--orange-border)] text-[var(--text-primary)]'
                }`}
                style={{ borderRadius: 0, width: isUser ? 'auto' : '100%' }}
              >
                <HybridMessage
                  message={msg}
                  isLatest={isLatest}
                  onMcqSelect={onMcqSelect}
                  onSubjectiveSubmit={onSubjectiveSubmit}
                  disabled={isLoading}
                />
              </div>
            </div>
          );
        })}



        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      {!shouldHideInputBar && (
        <div className="p-3 md:p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg)]">
          {currentPhase === 'recommendation' && !hasDiagram ? (
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
              <div className="flex-1 relative">
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
                    isLoading
                      ? 'Waiting for response...'
                      : hasDiagram
                      ? 'Ask follow-up questions or changes about this architecture...'
                      : 'Ask or reply to Kairos... (Shift+Enter for new line)'
                  }
                  disabled={isLoading}
                  rows={1}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-[13px] md:text-[14px] focus:outline-none focus:border-[#FF5500] resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{
                    borderRadius: 0,
                    minHeight: '44px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    lineHeight: '1.5',
                    height: 'auto',
                  }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 md:px-5 border border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderRadius: 0, cursor: 'pointer', height: '44px', flexShrink: 0 }}
              >
                {isLoading ? (
                  <MaterialIcon name="sync" size={15} className="animate-spin text-[#FF5500]" />
                ) : (
                  <MaterialIcon name="send" size={15} />
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
