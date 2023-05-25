import axios from 'axios'
import { ref, onBeforeMount } from 'vue'

import { BACKEND_API_ORIGIN } from '@/constants'

export default function useElectricityPrices() {
  const loading = ref()
  const loadingFailed = ref(false)
  const prices = ref()

  onBeforeMount(async () => {
    loading.value = true
    loadingFailed.value = false
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    try {
      const { data } = await axios.get(`${BACKEND_API_ORIGIN}/api/prices?day=${year}-${month}-${day}`)
      prices.value = data.data
    } catch (error) {
      console.error(error)
      loadingFailed.value = true
    } finally {
      loading.value = false
    }
  })

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

  return { loading, loadingFailed, prices, priceForDate }
}
