import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastMessage {
  id: number
  text: string
}

export var useToastStore = defineStore('toast', () => {
  var messages = ref<ToastMessage[]>([])
  var counter = 0

  function show(text: string, durationMs = 3500): void {
    var id = ++counter
    messages.value.push({ id, text })
    setTimeout(() => {
      messages.value = messages.value.filter((message) => message.id !== id)
    }, durationMs)
  }

  return { messages, show }
})
