import axios from 'axios'
import type { DateTime } from 'luxon'
import { ref, reactive } from 'vue'

import { BACKEND_API_ORIGIN } from '@/constants'

export default function useElectricityPrices() {
  const loading = ref<string[]>([])
  const loadingFailed = ref<string[]>([])
  const prices = reactive<Record<string, any[]>>({})

  const loadForDateIso = async (dateIso: string) => {
    if (prices[dateIso] != null || loading.value.includes(dateIso)) {
      return
    }
    loading.value = [...loading.value, dateIso]
    loadingFailed.value = loadingFailed.value.filter((currentDateIso) => currentDateIso !== dateIso)
    try {
      const { data } = await axios.get(`${BACKEND_API_ORIGIN}/api/prices?dateIso=${dateIso}`)
      prices[dateIso] = data.data
    } catch (error) {
      console.error(error)
      loadingFailed.value = [...loadingFailed.value, dateIso]
    } finally {
      loading.value = loading.value.filter((currentDateIso) => currentDateIso !== dateIso)
    }
  }

  const priceForDate = (date: DateTime): number => {
    const dateIso = date.toISODate()
    if (dateIso == null || prices[dateIso] == null) {
      return 0
    }
    const usedPrice = prices[dateIso].find(
      ({ start_timestamp, end_timestamp }: { start_timestamp: number, end_timestamp: number }) => (
        date.toMillis() >= start_timestamp
        && date.toMillis() < end_timestamp
      ),
    )
    if (usedPrice == null) {
      return 0
    }
    // awattar takes 3 % fee in either direction
    // if (usedPrice.marketprice < 0) {
    //  return Math.floor(usedPrice.marketprice * 1000 * 0.97)
    // }
    // return Math.floor(usedPrice.marketprice * 1000 * 1.03)
    // Energie Steiermark adds 1,2 ct/kWh on top of EPEX price
    return usedPrice.marketprice * 1000 + 1.2)
  }

  return { loadForDateIso, loading, loadingFailed, prices, priceForDate }
}
