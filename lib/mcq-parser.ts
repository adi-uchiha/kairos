export interface McqBlock {
  type: 'mcq';
  question: string;
  field: string;
  allowMultiple: boolean;
  choices: { label: string; value: string; materialIcon?: string; techIcon?: string }[];
}

export interface SubjectiveBlock {
  type: 'subjective';
  field: string;
  label: string;
  placeholder?: string;
}

export interface TransitionBlock {
  type: 'transition';
  next_phase: string;
}

export type InteractiveBlock = McqBlock | SubjectiveBlock;

export interface ParsedMessage {
  textContent: string;
  blocks: InteractiveBlock[];
  /** If the LLM signalled a phase transition via :::transition, this holds the target phase. */
  requestedPhase?: string;
}

/**
 * Parses :::mcq, :::subjective, and :::transition blocks from a message.
 * Strips interactive blocks from textContent and returns them separately.
 * On parse failure a block is left in the text to avoid losing info.
 */
export function parseMcqBlocks(content: string | undefined | null): ParsedMessage {
  if (!content) {
    return { textContent: '', blocks: [] };
  }

  const blockRegex = /:::(mcq|subjective|transition)\s*\n([\s\S]*?)\n\s*:::/g;
  const tempBlocks: InteractiveBlock[] = [];
  let requestedPhase: string | undefined;

  const processedText = content.replace(blockRegex, (rawBlock, blockType, jsonString) => {
    try {
      const parsed = JSON.parse(jsonString.trim());
      if (parsed && typeof parsed === 'object') {
        if (blockType === 'transition') {
          // Not an interactive block — just extract the phase signal
          requestedPhase = parsed.next_phase as string;
          return ''; // strip from content
        }
        parsed.type = blockType;
        tempBlocks.push(parsed as InteractiveBlock);
        return '';
      }
    } catch (e) {
      console.warn('Failed to parse interactive block JSON:', e, rawBlock);
    }
    return rawBlock;
  });

  return {
    textContent: processedText.trim(),
    blocks: tempBlocks,
    requestedPhase,
  };
}
