import { createApp, h } from 'vue'
import Alert from '@/pages/common/Alert.vue'

type AlertType = 'success' | 'error' | 'info' | 'warning'

export function useAlert() {
  const show = (message: string, type: AlertType = 'info') => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      render: () =>
        h(Alert, {
          message,
          type,
          onClose: () => {
            app.unmount()
            container.remove()
          }
        }),
    })

    app.mount(container)
  }

  return { show }
}