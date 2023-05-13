import fees from '@/fees.json'

type FeeValues = {
  validUntil: number | null
  amount: number | {
    validUntil: number
    value: number
  }[]
}

type Fee = {
  id: string
  label: string
  values: FeeValues[]
}

const feeById: Record<string, Fee> = (fees as Fee[]).reduce((accumulator, fee) => ({
  ...accumulator,
  [fee.id]: fee,
}),  {})

const feeForDate = (fee: string, date: Date): number => {
  if (feeById[fee] == null) {
    return 0
  }
  const usedValue = feeById[fee].values.find(({ validUntil }) => validUntil == null || new Date(validUntil * 1000) > date)
  if (typeof usedValue?.amount === 'number') {
    return usedValue.amount
  }
  if (Array.isArray(usedValue?.amount)) {
    const secondsOfDay = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
    const usedValueForDay = usedValue?.amount.find(({ validUntil }) => validUntil > secondsOfDay)
    if (usedValueForDay != null) {
      return usedValueForDay.value
    }
  }
  return 0
}

export default function useElectricityFees() {
  return { fees, feeById, feeForDate }
}
