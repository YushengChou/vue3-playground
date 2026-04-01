const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

const theme = ref<'light' | 'dark'>(savedTheme || systemTheme)

// 如果 localStorage 沒有，就存 system theme
if (!savedTheme) {
  localStorage.setItem('theme', theme.value)
}

// 套用 class
if (theme.value === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

export function useTheme() {

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'

    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localStorage.setItem('theme', theme.value)
  }

  return { theme, toggleTheme }
}