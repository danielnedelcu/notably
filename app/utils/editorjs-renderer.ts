interface EditorJSBlock {
  type: string;
  data: Record<string, any>;
}

interface EditorJSData {
  blocks: EditorJSBlock[];
}

export const renderEditorJS = (content: string): string => {
  if (!content) return "";

  let data: EditorJSData;
  try {
    data = JSON.parse(content);
    if (!data.blocks) return `<p>${content}</p>`;
  } catch {
    // Not JSON — return as-is (handles legacy HTML content)
    return content;
  }

  return data.blocks.map((block) => renderBlock(block)).join("\n");
};

const renderBlock = (block: EditorJSBlock): string => {
  const { type, data } = block;

  switch (type) {
    case "paragraph":
      return `<p>${data.text ?? ""}</p>`;

    case "header":
      return `<h${data.level}>${data.text ?? ""}</h${data.level}>`;

    case "list": {
      const tag = data.style === "ordered" ? "ol" : "ul";
      const items = (data.items ?? [])
        .map((item: string | { content: string }) => {
          const text = typeof item === "string" ? item : item.content;
          return `<li>${text}</li>`;
        })
        .join("\n");
      return `<${tag}>${items}</${tag}>`;
    }

    case "quote":
      return `<blockquote><p>${data.text ?? ""}</p>${data.caption ? `<cite>${data.caption}</cite>` : ""}</blockquote>`;

    case "code":
      return `<pre><code>${escapeHtml(data.code ?? "")}</code></pre>`;

    case "delimiter":
      return "<hr />";

    case "image":
      return `<figure>
          <img src="${data.file?.url ?? data.url ?? ""}" alt="${data.caption ?? ""}" class="rounded-lg w-full" />
          ${data.caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${data.caption}</figcaption>` : ""}
        </figure>`;

    case "table": {
      const rows = data.content ?? [];
      const hasHeadings = data.withHeadings && rows.length > 0;
      const headerRow = hasHeadings ? rows[0] : null;
      const bodyRows = hasHeadings ? rows.slice(1) : rows;

      const thead = headerRow
        ? `<thead><tr>${headerRow.map((cell: string) => `<th>${cell}</th>`).join("")}</tr></thead>`
        : "";

      const tbody = `<tbody>${bodyRows
        .map(
          (row: string[]) =>
            `<tr>${row.map((cell: string) => `<td>${cell}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody>`;

      return `<div class="overflow-x-auto"><table>${thead}${tbody}</table></div>`;
    }

    default:
      return "";
  }
};

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
