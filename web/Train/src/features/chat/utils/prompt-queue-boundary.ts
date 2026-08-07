export const PROMPT_QUEUE_STOP_EVENT = "train:prompt-queue-stop";

export function requestPromptQueueStop() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(PROMPT_QUEUE_STOP_EVENT));
}
