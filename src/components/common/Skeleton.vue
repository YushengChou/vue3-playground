<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  variant?: 'rect' | 'circle' | 'text'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '20px',
  variant: 'rect',
  animated: true
})

const skeletonClass = computed(() => {
  return [
    'bg-gray-200 dark:bg-gray-700',
    props.animated ? 'animate-pulse' : '',
    props.variant === 'circle' ? 'rounded-full' : 'rounded-md',
    props.variant === 'text' ? 'h-[1em] mb-2 last:mb-0 last:w-[60%]' : ''
  ]
})

const style = computed(() => ({
  width: props.width,
  height: props.variant === 'text' ? undefined : props.height
}))
</script>

<template>
  <div :class="skeletonClass" :style="style"></div>
</template>
