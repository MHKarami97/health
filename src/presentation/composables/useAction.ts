import { useToastStore } from '@application/stores/toastStore'

export function useAction() {
  var toast = useToastStore()

  async function run(action: () => unknown, successMessage?: string): Promise<boolean> {
    try {
      await action()
      if (successMessage) toast.show(successMessage)
      return true
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'خطای ناشناخته')
      return false
    }
  }

  return { run }
}
