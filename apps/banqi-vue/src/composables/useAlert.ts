import { createApp, h } from 'vue'
import Alert from '@/components/Alert.vue'

export function useAlert() {
  const showConfirm = (message: string, confirmText = '確定', cancelText = '取消') => new Promise<boolean>((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    let confirmed = false
    const app = createApp({ render: () => h(Alert, { message, confirmText, cancelText, onConfirm: () => { confirmed = true }, onClose: () => { app.unmount(); container.remove(); resolve(confirmed) } }) })
    app.mount(container)
  })
  return { showConfirm }
}
