// TODO: Replace with a real AI client wrapper (Anthropic SDK) as projects require it.
export const PACKAGE_NAME = '@product-engineer/shared-ai';

export interface PromptParts {
  system?: string;
  user: string;
}

export function buildPrompt(parts: PromptParts): string {
  return [parts.system, parts.user].filter(Boolean).join('\n\n');
}
