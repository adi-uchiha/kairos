export interface McqBlock {
  type: 'mcq';
  question: string;
  field: string;
  allowMultiple: boolean;
  choices: { label: string; value: string; icon?: string }[];
}

export interface SubjectiveBlock {
  type: 'subjective';
  field: string;
  label: string;
  placeholder?: string;
}

export type InteractiveBlock = McqBlock | SubjectiveBlock;

export interface ParsedMessage {
  textContent: string;
  blocks: InteractiveBlock[];
}

/**
 * Parses :::mcq ... ::: and :::subjective ... ::: blocks from a message's content.
 * Strips these blocks from the textContent and returns the parsed blocks in order.
 * If JSON parsing fails for a block, it is left in the textContent to avoid losing info.
 */
export function parseMcqBlocks(content: string | undefined | null): ParsedMessage {
  if (!content) {
    return { textContent: '', blocks: [] };
  }

  // Regex to match :::blockType \n [JSON] \n :::
  // We make it non-greedy and let it capture the block type and the JSON body
  const blockRegex = /:::(mcq|subjective)\s*\n([\s\S]*?)\n\s*:::/g;
  const tempBlocks: InteractiveBlock[] = [];
  const processedText = content.replace(blockRegex, (rawBlock, blockType, jsonString) => {
    try {
      const parsed = JSON.parse(jsonString.trim());
      // Validate type matches what was declared
      if (parsed && typeof parsed === 'object') {
        parsed.type = blockType;
        tempBlocks.push(parsed as InteractiveBlock);
        return ''; // strip from content
      }
    } catch (e) {
      console.warn('Failed to parse interactive block JSON:', e, rawBlock);
    }
    return rawBlock; // keep raw block on error
  });

  return {
    textContent: processedText.trim(),
    blocks: tempBlocks,
  };
}
