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
    setDate(DateTime.fromISO(value).setZone('Europe/Vienna').startOf('day'))
  }
  
  const selectPrevDate = () => {
    setDate(currentDate.value.minus({ days: 1 }))
  }
  
  const selectNextDate = () => {
    setDate(currentDate.value.plus({ days: 1 }))
  }

  const setDate = (date: DateTime) => {
    if (
      !date.isValid
      || date < MIN_DATE
      || date > MAX_DATE
    ) {
      return
    }
    currentDate.value = date
  }

  const prevDateValid = computed(() => currentDate.value.minus({ days: 1 }) >= MIN_DATE)
  const nextDateValid = computed(() => currentDate.value.plus({ days: 1 }) <= MAX_DATE)

  return {
    currentDate,
    currentDateIso,
    currentDateFormatted,
    selectDate,
    selectPrevDate,
    selectNextDate,
    prevDateValid,
    nextDateValid,
  }
}
