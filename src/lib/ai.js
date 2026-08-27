/**
 * AI service client for generating prompts and insights.
 */

export const ai = {
  run: async (instruction) => {
    // Return empty so the app's deterministic/AI fallback pipeline gracefully provides a rich prompt
    return { text: '' };
  },
};
