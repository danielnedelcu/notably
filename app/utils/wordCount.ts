export const getWordCount = (content: string): number => {
  try {
    const parsed = JSON.parse(content);
    const text =
      parsed.blocks?.map((b: any) => b.data?.text ?? "").join(" ") ?? "";
    return text.split(/\s+/).filter(Boolean).length;
  } catch {
    return content.split(/\s+/).filter(Boolean).length;
  }
};
