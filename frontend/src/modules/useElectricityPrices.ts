import axios from 'axios'
import { ref } from 'vue'

import { BACKEND_API_ORIGIN } from '@/constants'

export default function useElectricityPrices() {
  const loading = ref()
  const loadingFailed = ref(false)
  const prices = ref()

  const loadForDateIso = async (dateIso: string) => {
    loading.value = true
    loadingFailed.value = false
    try {
      const { data } = await axios.get(`${BACKEND_API_ORIGIN}/api/prices?dateIso=${dateIso}`)
      prices.value = data.data
    } catch (error) {
      console.error(error)
      loadingFailed.value = true
    } finally {
      loading.value = false
    }
  }

  const priceForDate = (date: Date): number => {
    if (prices.value == null) {
      return 0
    }
    const usedPrice = prices.value.find(
      ({ start_timestamp, end_timestamp }: { start_timestamp: number, end_timestamp: number }) => (
        date > new Date(start_timestamp)
        && date < new Date(end_timestamp)
      ),
    )
    if (usedPrice == null) {
      return 0
    }
    return Math.floor(usedPrice.marketprice * 1000 * 1.03)
  }

  return { loadForDateIso, loading, loadingFailed, prices, priceForDate }
}
