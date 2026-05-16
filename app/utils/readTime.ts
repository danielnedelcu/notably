export const getReadTime = (wordCount: number): number =>
  Math.max(1, Math.round(wordCount / 200));