<template>
  <div ref="editorRef" class="editorjs-container" />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLElement>();
let editor: any = null;

const parseContent = (value: string) => {
  if (!value) return { blocks: [] };
  try {
    const parsed = JSON.parse(value);
    if (parsed.blocks) return parsed;
  } catch {}
  // If it's HTML or plain text, wrap it in a paragraph block
  return {
    blocks: [{ type: "paragraph", data: { text: value } }],
  };
};

onMounted(async () => {
  // Dynamic import to avoid SSR issues
  const EditorJS = (await import("@editorjs/editorjs")).default;
  const Header = (await import("@editorjs/header")).default;
  const List = (await import("@editorjs/list")).default;
  const Quote = (await import("@editorjs/quote")).default;
  const Code = (await import("@editorjs/code")).default;
  const Delimiter = (await import("@editorjs/delimiter")).default;
  const InlineCode = (await import("@editorjs/inline-code")).default;
  const Image = (await import("@editorjs/image")).default;
  const Table = (await import("@editorjs/table")).default;

  editor = new EditorJS({
    holder: editorRef.value!,
    data: parseContent(props.modelValue),
    placeholder: "Start writing… or press '/' for commands",
    tools: {
      header: {
        class: Header,
        config: {
          levels: [1, 2, 3],
          defaultLevel: 2,
        },
      },
      list: {
        class: List,
        inlineToolbar: true,
        config: {
          defaultStyle: "unordered",
        },
      },
      quote: {
        class: Quote,
        inlineToolbar: true,
      },
      code: Code,
      delimiter: Delimiter,
      inlineCode: {
        class: InlineCode,
        shortcut: "CMD+SHIFT+M",
      },
      image: {
        class: Image,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              // Convert to base64 for now — replace with your upload logic later
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  resolve({
                    success: 1,
                    file: { url: e.target?.result as string },
                  });
                };
                reader.readAsDataURL(file);
              });
            },
            async uploadByUrl(url: string) {
              return { success: 1, file: { url } };
            },
          },
        },
      },
      table: {
        class: Table,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3,
          withHeadings: true,
        },
      },
    },
    onChange: async () => {
      const data = await editor.save();
      emit("update:modelValue", JSON.stringify(data));
    },
  });
});

onBeforeUnmount(() => {
  if (editor && typeof editor.destroy === "function") {
    editor.destroy();
    editor = null;
  }
});
</script>

<style>
.editorjs-container .codex-editor {
  padding: 0;
}

.editorjs-container .ce-block__content,
.editorjs-container .ce-toolbar__content {
  max-width: 100%;
}

.editorjs-container .cdx-block {
  padding: 0.25rem 0;
}

.editorjs-container .ce-paragraph {
  line-height: 1.75;
  color: #1f2937;
}

.dark .editorjs-container .ce-paragraph {
  color: #e5e7eb;
}

.editorjs-container h1.ce-header {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.editorjs-container h2.ce-header {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.editorjs-container h3.ce-header {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem;
}

.editorjs-container .cdx-quote {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  font-style: italic;
  color: #6b7280;
}

.editorjs-container .ce-code__textarea {
  background: #1f2937;
  color: #e5e7eb;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  padding: 1rem;
  border: none;
  width: 100%;
  min-height: 80px;
  resize: vertical;
}

.editorjs-container .cdx-list {
  padding-left: 1.5rem;
}

.editorjs-container .cdx-list__item {
  margin: 0.25rem 0;
  line-height: 1.75;
}

.editorjs-container .ce-delimiter {
  text-align: center;
  color: #9ca3af;
  margin: 1rem 0;
}

.editorjs-container .ce-toolbar__plus,
.editorjs-container .ce-toolbar__settings-btn {
  color: #6b7280;
}

.editorjs-container .ce-toolbar__plus:hover,
.editorjs-container .ce-toolbar__settings-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
</style>
