<template>
  <div class="flex-1 flex flex-col items-center overflow-hidden">
    <div class="max-w-3xl w-full flex pt-4 justify-center">
      <button
        v-if="type !== 'xs'"
        class="bg-gray-300 hover:enabled:bg-gray-400 text-gray-800 mr-2 py-2 px-4 rounded-l disabled:opacity-50"
        :disabled="!prevDateValid || loadingPrices"
        @click="selectPrevDate"
      >
        {{ $t('components.datepicker.previous') }}
      </button>
      <label class="bg-gray-300 py-2 px-4">
        <input
          type="date"
          class="bg-transparent outline-none"
          :value="currentDateIso"
          :min="(MIN_DATE.toISODate() as string)"
          :max="(MAX_DATE.toISODate() as string)"
          @change="selectDate"
        >
      </label>
      <button
        v-if="type !== 'xs'"
        class="bg-gray-300 hover:enabled:bg-gray-400 text-gray-800 ml-2 py-2 px-4 rounded-r disabled:opacity-50"
        :disabled="!nextDateValid || loadingPrices"
        @click="selectNextDate"
      >
        {{ $t('components.datepicker.next') }}
      </button>
    </div>
    <div v-if="showLoadingAnimation" class="flex-1 grid justify-center content-center">
      <AnimatedLoadingWheel />
    </div>
    <div v-else-if="showContent && loadingFailed" class="flex-1 grid justify-center content-center text-red-600">
      {{ $t('errors.loadingPricesFailed') }}
    </div>
    <div v-else-if="showContent" class="w-full overflow-x-auto">
      <svg
        :width="width + margins.left + margins.right"
        :height="height + margins.top + margins.bottom"
      >
        <g :transform="`translate(${margins.left}, ${margins.top})`">
          <g>
            <g
              v-for="bars in stackedData"
              :key="bars.key"
              :fill="colorsByBarKey[bars.key]"
            >
              <rect
                v-for="bar in bars"
                :key="bars.key + bar.data.group"
                :x="x(String(bar.data.group))"
                :y="y(bar[1])"
                :height="y(bar[0]) - y(bar[1])"
                :width="x.bandwidth()"
              />
            </g>
            <g :fill="ELECTRICITY_PRICE_COLOR">
              <rect
                v-for="bar in negativeBars"
                :key="bar.key"
                :x="x(bar.group)"
                :y="y(0)"
                :height="y(bar.power) - y(0)"
                :width="x.bandwidth()"
              />
            </g>
          </g>
          <g ref="vAxisLeft" />
          <g
            ref="vAxisBottom"
            :transform="`translate(0, ${height})`"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { stack } from 'd3-shape'
import { scaleBand, scaleLinear } from 'd3-scale'
import { computed, watchEffect, ref } from 'vue'
import { useRoute } from 'vue-router'

import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import useDatePicker, { MIN_DATE, MAX_DATE } from '@/modules/useDatePicker'
import useBreakpoints from '@/modules/useBreakpoints'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useElectricityFees from '@/modules/useElectricityFees'
import useElectricityPrices from '@/modules/useElectricityPrices'
import { ELECTRICITY_PRICE_COLOR, ELECTRICITY_TAX_COLOR } from '@/constants'

const route = useRoute()
const { width: clientWidth, height: clientHeight, type } = useBreakpoints()
const {
  currentDate, currentDateIso,
  selectDate, selectPrevDate, selectNextDate,
  prevDateValid, nextDateValid,
} = useDatePicker()
const { loading, showLoadingAnimation, showContent } = useDelayedLoadingAnimation(500, true)
const { feeForDate, feeById } = useElectricityFees()
const { loading: loadingPrices, loadingFailed,  priceForDate, loadForDateIso } = useElectricityPrices()

watchEffect(() => {
  loading.value = loadingPrices.value
})
watchEffect(() => {
  if (currentDateIso.value == null) {
    return
  }
  loadForDateIso(currentDateIso.value)
})

const colorsByBarKey = computed<Record<string, string>>(() => ({
  ...Object.entries(feeById).reduce((accumulator, [key, fee]) => ({
    ...accumulator,
    [key]: fee.color,
  }), {}),
  power: ELECTRICITY_PRICE_COLOR,
  salesTax: ELECTRICITY_TAX_COLOR,
}))

const margins = computed(() => {
  if (type.value === 'xs') {
    return { top: 20, right: 10, bottom: 30, left: 30 }
  }
  if (type.value === 'md') {
    return { top: 20, right: 10, bottom: 30, left: 30 }
  }
  return { top: 100, right: 40, bottom: 100, left: 60 }
})
const width = computed(() => Math.max(800, Math.min(1800, clientWidth.value - margins.value.left - margins.value.right)))
const height = computed(() => clientHeight.value - 70 - margins.value.top - margins.value.bottom)

const excludeFees = computed(() => {
  if (typeof route.query.excludeFees !== 'string') {
    return []
  }
  return route.query.excludeFees.split(',')
})

const negativeBars = computed(() => 
  [...new Array(24).keys()]
    .filter((value) => {
      const usedDate = currentDate.value.set({ hour: value })
      return priceForDate(usedDate) < 0
    })
    .map((value) => {
      const usedDate = currentDate.value.set({ hour: value })
      const power = priceForDate(usedDate)
      const group = `${String(value).padStart(2, '0')}:00`
      return {
        key: `negative_price_${group}`,
        group,
        power: Math.floor(power / 100) / 100,
      }
    }),
)

const data = computed(() => [...new Array(24).keys()].map((value) => {
  const usedDate = currentDate.value.set({ hour: value })
  const values: Record<string, number> = {}

  const power = priceForDate(usedDate)
  values.power = Math.max(power, 0)
  Object.keys(feeById).forEach((feeId) => {
    if (excludeFees.value.includes(feeId)) {
      return
    }
    values[feeId] = feeForDate(feeId, usedDate)
  })
  if (power < 0) {
    const firstKey = Object.keys(feeById)[0]
    values[firstKey] += power
  }

  const salesTax = Math.floor(Object.values(values).reduce((total, current) => total + current, 0) * 0.2)
  const valuesInCents = Object.entries({ ...values, salesTax }).reduce((accumulator, [key, value]) => ({
    ...accumulator,
    [key]: Math.floor(value / 100) / 100,
  }), {})

  return {
    group: `${String(value).padStart(2, '0')}:00`,
    ...valuesInCents,
  }
}))
const subgroups = computed(() => Object.keys(data.value[0]).filter((subgroup) => subgroup !== 'group'))
const groups = computed(() => data.value.map((point) => point.group))
const maxY = computed(() => data.value
  .map((values) => Object.values(values).reduce((total, value) => {
    if (typeof value === 'number') {
      return total + value
    }
    return total
  }, 0))
  .reduce((max, value) => {
    if (value > max) {
      return value
    }
    return max
  }, 0))

const x = computed(() => scaleBand()
  .domain(groups.value)
  .range([0, width.value])
  .padding(0.2))
const y = computed(() => scaleLinear()
  .domain([0, Math.max(35, maxY.value * 1.2)])
  .range([height.value, 0]))

const vAxisLeft = ref<HTMLElement>()
watchEffect(() => {
  if (vAxisLeft.value == null) {
    return
  }
  select(vAxisLeft.value).call(axisLeft(y.value) as any)
})

const vAxisBottom = ref<HTMLElement>()
watchEffect(() => {
  if (vAxisBottom.value == null) {
    return
  }
  select(vAxisBottom.value).call(axisBottom(x.value).tickSizeOuter(0) as any)
})

const stackedData = computed(() => stack().keys(subgroups.value)(data.value as any))
</script>
