import { computed, onMounted, onUnmounted, ref } from 'vue'

export default () => {
  const clientWidth = ref(document.body.clientWidth)
  const clientHeight = ref(
    window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight,
  )

  const onResize = async () => {
    clientWidth.value = document.body.clientWidth
    clientHeight.value
      = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight
  }
  onMounted(() => {
    onResize()
    window.addEventListener('resize', onResize)
    screen.orientation.addEventListener('change', onResize)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)  
    screen.orientation.removeEventListener('change', onResize)
  })
  
  const type = computed(() => {
    if (clientWidth.value < 550) {
      return 'xs'
    }
    if (clientWidth.value >= 550 && clientWidth.value < 1200) {
      return 'md'
    }
    else return 'lg'
  })

  const width = computed(() => clientWidth.value)
  const height = computed(() => clientHeight.value)

  return { width, height, type }
}
