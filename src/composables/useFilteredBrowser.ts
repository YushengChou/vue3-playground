import { Capacitor, registerPlugin } from '@capacitor/core'

interface FilteredBrowserPlugin {
  openYouTube(): Promise<void>
}

const FilteredBrowser = registerPlugin<FilteredBrowserPlugin>('FilteredBrowser')

export async function openYouTubeFilterMode() {
  if (Capacitor.isNativePlatform()) {
    await FilteredBrowser.openYouTube()
    return
  }

  window.open('https://m.youtube.com/', '_blank', 'noopener,noreferrer')
}
