'use client';

import React, { useState } from 'react';
import { type McqBlock } from '@/lib/mcq-parser';
import { getIconUrl } from '@/lib/icon-registry';

type McqChoice = McqBlock['choices'][number];

/** Renders the icon for a MCQ choice pill.
 *  Priority: techIcon (tech SVG from registry) > materialIcon (Material Symbols Sharp) > nothing.
 */
function ChoiceIcon({ choice }: { choice: McqChoice }) {
  const [imgError, setImgError] = useState(false);

  if (choice.techIcon) {
    const url = getIconUrl(choice.techIcon);
    if (url && !imgError) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url}
          alt={choice.techIcon}
          width={14}
          height={14}
          style={{ objectFit: 'contain', flexShrink: 0 }}
          onError={() => setImgError(true)}
        />
      );
    }
  }

  if (choice.materialIcon) {
    return (
      <span
        className="material-symbols-sharp"
        style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, color: 'inherit' }}
      >
        {choice.materialIcon}
      </span>
    );
  }

  return null;
}

interface McqChoicesProps {
  block: McqBlock;
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
  selectedValue?: string;
}

export function McqChoices({ block, onSelect, disabled = false, selectedValue }: McqChoicesProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleSingleClick = (value: string, label: string) => {
    if (disabled) return;
    onSelect(value, label);
  };

  const handleToggleValue = (value: string) => {
    if (disabled) return;
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleConfirm = () => {
    if (disabled || selectedValues.length === 0) return;

    // Create a combined label from the selected choices
    const selectedChoices = block.choices.filter((c) => selectedValues.includes(c.value));
    const combinedLabel = selectedChoices.map((c) => c.label).join(', ');
    const combinedValue = selectedValues.join(',');

    onSelect(combinedValue, combinedLabel);
  };

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border)]">
      <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2.5 uppercase tracking-wider font-mono">
        {block.question}
      </p>

      <div className="flex flex-wrap gap-2">
        {block.choices.map((choice) => {
          const isSelected = block.allowMultiple
            ? selectedValues.includes(choice.value)
            : selectedValue === choice.value;

          return (
            <button
              key={choice.value}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (block.allowMultiple) {
                  handleToggleValue(choice.value);
                } else {
                  handleSingleClick(choice.value, choice.label);
                }
              }}
              className={`px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 border font-medium ${
                disabled
                  ? 'opacity-50 cursor-not-allowed border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]'
                  : isSelected
                    ? 'border-[#FF5500] bg-[var(--orange-wash)] text-[#FF5500] hover:bg-[var(--orange-wash)] cursor-pointer'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[#FF5500] hover:bg-[var(--surface-hover)] cursor-pointer'
              }`}
              style={{ borderRadius: 0 }}
            >
              <ChoiceIcon choice={choice} />
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>

      {block.allowMultiple && (
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            disabled={disabled || selectedValues.length === 0}
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all ${
              disabled || selectedValues.length === 0
                ? 'bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[#FF5500] hover:bg-[#E04B00] cursor-pointer'
            }`}
            style={{ borderRadius: 0 }}
          >
            Confirm Selection ({selectedValues.length})
          </button>
        </div>
      )}
    </div>
  );
}
