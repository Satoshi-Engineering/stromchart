import { DateTime } from 'luxon'
import { computed, ref } from 'vue'

export const MIN_DATE = DateTime.fromISO('2023-01-01').setZone('Europe/Vienna').startOf('day')
export const MAX_DATE = DateTime.now().setZone('Europe/Vienna').endOf('day').plus({ days: 1 })

export default () => {
  const currentDate = ref(DateTime.now().setZone('Europe/Vienna').startOf('day'))
  const currentDateIso = computed(() => currentDate.value.toISODate())
  const currentDateFormatted = computed(() => currentDate.value.setLocale('de').toLocaleString(DateTime.DATE_MED))

  const selectDate = (event: Event) => {
    if (event.target == null) {
      return
    }
    const { value } = (event.target as HTMLInputElement)
    const newDate = DateTime.fromISO(value).setZone('Europe/Vienna').startOf('day')
    if (
      !newDate.isValid
      || newDate < MIN_DATE
      || newDate > MAX_DATE
    ) {
      return
    }
    currentDate.value = newDate
  }

  return {
    currentDate,
    currentDateIso,
    currentDateFormatted,
    selectDate,
  }
}
