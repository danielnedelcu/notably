<template>
  <div class="space-y-3">
    <label class="text-xs text-gray-500">Schedule publish</label>

    <!-- Current schedule status -->
    <div v-if="scheduledAt" class="flex items-center justify-between">
      <div
        class="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400"
      >
        <Icon name="lucide:calendar-clock" class="w-3.5 h-3.5" />
        Scheduled for {{ formatScheduled(scheduledAt) }}
      </div>
      <button
        class="text-xs text-gray-400 hover:text-red-500 transition-colors"
        @click="cancelSchedule"
      >
        Cancel
      </button>
    </div>

    <!-- Calendar -->
    <UiCalendar
      v-model="selectedDate"
      class="rounded-md border shadow-sm"
      layout="month-and-year"
      :min-value="minDate"
      :max-value="maxDate"
    />

    <!-- Time picker -->
    <div class="flex flex-col gap-1.5">
      <label class="text-xs text-gray-500 px-1">Time</label>
      <UiInput
        id="time-picker"
        v-model="selectedTime"
        type="time"
        step="60"
        class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>

    <Button
      class="w-full"
      variant="outline"
      :disabled="!selectedDate || scheduling"
      @click="schedule"
    >
      <UiLoader
        v-if="scheduling"
        class="size-4"
        backdrop-class="!inline-flex !min-h-0 !gap-0 !p-0"
        icon="svg-spinners:270-ring-with-bg"
      />
      <CalendarClockIcon v-else class="w-4 h-4" />
      {{ scheduling ? "Scheduling…" : "Schedule Publish" }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import {
  CalendarDate,
  fromDate,
  getLocalTimeZone,
  toCalendarDate,
} from "@internationalized/date";
import { CalendarClockIcon } from "lucide-vue-next";

const props = defineProps<{
  postId: string;
  scheduledAt: string | null;
}>();

const emit = defineEmits<{
  scheduled: [publishAt: string];
  cancelled: [];
}>();

const selectedDate = ref<DateValue>(fromDate(new Date(), getLocalTimeZone()));
const selectedTime = ref("10:00");
const scheduling = ref(false);

const minDate = new CalendarDate(
  new Date().getFullYear(),
  new Date().getMonth() + 1,
  new Date().getDate(),
);
const maxDate = new CalendarDate(2035, 1, 1);

const formatScheduled = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const schedule = async () => {
  if (!selectedDate.value) return;
  scheduling.value = true;

  try {
    const calDate = toCalendarDate(selectedDate.value);
    const [hours, minutes] = selectedTime.value.split(":").map(Number);
    const dateObj = new Date(
      calDate.year,
      calDate.month - 1,
      calDate.day,
      hours,
      minutes,
    );

    const publishAt = dateObj.toISOString();

    await $fetch(`/api/posts/${props.postId}/schedule`, {
      method: "POST",
      credentials: "include",
      body: { publish_at: publishAt },
    });

    emit("scheduled", publishAt);
  } finally {
    scheduling.value = false;
  }
};

const cancelSchedule = async () => {
  await $fetch(`/api/posts/${props.postId}/schedule`, {
    method: "DELETE",
    credentials: "include",
  });
  emit("cancelled");
};
</script>
