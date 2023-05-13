import axios from 'axios'
import { ref, onBeforeMount } from 'vue'

export default function useElectricityPrices() {
  const prices = ref()

  onBeforeMount(async () => {
    const start = + new Date() - (1000 * 60 * 60 * 24)
    const end = + new Date() + (1000 * 60 * 60 * 24)
    const { data } = await axios.get(`https://api.awattar.at/v1/marketdata?start=${start}&end=${end}`)
    prices.value = data.data
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
    return Math.floor(usedPrice.marketprice * 1000)
  }

  return { prices, priceForDate }
}
