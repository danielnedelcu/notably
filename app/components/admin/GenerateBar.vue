<template>
  <ClientOnly>
    <UiInputGroup>
      <UiInputGroupTextarea
        ref="textareaRef"
        v-model="prompt"
        placeholder="Describe the content you want to generate..."
        :disabled="loading"
      />
      <UiInputGroupAddon align="block-end">
        <UiInputGroupText class="ml-auto"
          >{{ charCount }} chars</UiInputGroupText
        >

        <UiSeparator orientation="vertical" class="h-4!" />

        <!-- Mic when empty → arrow = send (same click runs generate). Tooltip clarifies. -->
        <UiInputGroupButton
          variant="default"
          type="button"
          class="rounded-full transition-all duration-200"
          :class="isListening ? 'bg-red-500 hover:bg-red-600' : ''"
          size="icon-xs"
          :disabled="loading"
          :title="
            loading
              ? 'Generating…'
              : hasPrompt
                ? 'Send prompt (or Enter)'
                : isListening
                  ? 'Stop'
                  : 'Voice input'
          "
          @click="hasPrompt ? generate() : toggleVoice()"
        >
          <LoaderCircleIcon v-if="loading" class="size-4 animate-spin" />
          <ArrowUpIcon v-else-if="hasPrompt" class="size-4" />
          <MicOffIcon v-else-if="isListening" class="size-4 animate-pulse" />
          <MicIcon v-else class="size-4" />
          <span class="sr-only">{{
            hasPrompt ? "Send prompt" : isListening ? "Stop" : "Voice input"
          }}</span>
        </UiInputGroupButton>
      </UiInputGroupAddon>
    </UiInputGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  ArrowUpIcon,
  LoaderCircleIcon,
  MicIcon,
  MicOffIcon,
} from "lucide-vue-next";

defineExpose({
  reset: () => {
    prompt.value = "";
  },
});

const emit = defineEmits<{
  generated: [result: { title: string; excerpt: string; blocks: any[] }];
  error: [message: string];
}>();

const prompt = ref("");
const loading = ref(false);
const textareaRef = ref();
const isListening = ref(false);
const charCount = computed(() => prompt.value.length);
const hasPrompt = computed(() => prompt.value.trim().length > 0);

// ── Voice transcription ───────────────────────────────────────────────────────
let recognition: any = null;

const initRecognition = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ??
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    emit("error", "Speech recognition is not supported in this browser.");
    return null;
  }

  const r = new SpeechRecognition();
  r.continuous = true;
  r.interimResults = true;
  r.lang = "en-US";

  let finalTranscript = "";

  r.onstart = () => {
    isListening.value = true;
    finalTranscript = prompt.value; // preserve any existing text
  };

  r.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim = transcript;
      }
    }
    prompt.value = finalTranscript + interim;
  };

  r.onerror = (event: any) => {
    if (event.error !== "aborted") {
      emit("error", `Voice error: ${event.error}`);
    }
    isListening.value = false;
  };

  r.onend = () => {
    isListening.value = false;
  };

  return r;
};

const toggleVoice = () => {
  if (isListening.value) {
    recognition?.stop();
    isListening.value = false;
    return;
  }
  recognition = initRecognition();
  recognition?.start();
};

// Stop listening if the bar is closed
onBeforeUnmount(() => {
  recognition?.stop();
});

// ── Generate ──────────────────────────────────────────────────────────────────
const generate = async () => {
  if (!prompt.value.trim() || loading.value) return;

  // Stop voice if still active
  if (isListening.value) {
    recognition?.stop();
    isListening.value = false;
  }

  loading.value = true;
  try {
    const result = await $fetch<{
      title: string;
      excerpt: string;
      blocks: any[];
    }>("/api/generate-post", {
      method: "POST",
      body: { topic: prompt.value.trim() },
    });
    prompt.value = "";
    emit("generated", result);
  } catch {
    emit("error", "Failed to generate post. Please try again.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const el =
    textareaRef.value?.$el?.querySelector("textarea") ?? textareaRef.value?.$el;
  if (el) {
    el.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        generate();
      }
    });
  }
});
</script>
