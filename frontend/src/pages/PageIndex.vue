<template>
  <div class="flex-1 flex flex-col items-center overflow-hidden">
    <div class="relative w-full flex mt-4 px-2 justify-left md:justify-center">
      <button
        class="bg-gray-300 hover:enabled:bg-gray-400 text-gray-800 mx-2 py-2 px-4 rounded-l disabled:opacity-50"
        :disabled="!prevDateValid || (currentDateIso != null && loadingPrices.includes(currentDateIso))"
        @click="selectPrevDate"
      >
        {{ type === 'xs' ? '<' : $t('components.datepicker.previous') }}
      </button>
      <label class="bg-gray-300 py-2 px-4">
        <input
          type="date"
          class="bg-transparent outline-none"
          :value="currentDateIso"
          :min="(minDate.toISODate() as string)"
          :max="(maxDate.toISODate() as string)"
          @change="selectDate"
        >
      </label>
      <button
        class="bg-gray-300 hover:enabled:bg-gray-400 text-gray-800 mx-2 py-2 px-4 rounded-r disabled:opacity-50"
        :disabled="!nextDateValid || (currentDateIso != null && loadingPrices.includes(currentDateIso))"
        @click="selectNextDate"
      >
        {{ type === 'xs' ? '>' : $t('components.datepicker.next') }}
      </button>
      <button
        class="absolute right-0 h-full bg-gray-300 hover:enabled:bg-gray-400 text-gray-800 mr-2 py-2 px-4 rounded disabled:opacity-50"
        @click="showInfo = !showInfo"
      >
        ?
      </button>
    </div>
    <div v-if="showLoadingAnimation" class="flex-1 grid justify-center content-center">
      <AnimatedLoadingWheel />
    </div>
    <div
      v-else-if="showContent && currentDateIso != null && loadingFailed.includes(currentDateIso)"
      class="flex-1 grid justify-center content-center text-red-600"
    >
      {{ $t('errors.loadingPricesFailed') }}
    </div>
    <div v-else-if="showContent" class="w-full overflow-x-auto">
      <svg
        class="mx-auto"
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
                :height="Math.max(y(bar[0]) - y(bar[1]), 0)"
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
          <g
            :font-size="type === 'xs' ? '10' : '12'"
            font-family="sans-serif"
            text-anchor="middle"
          >
            <text
              v-for="bar in barsTotal"
              :key="bar.key"
              fill="currentColor"
              :y="y(Math.max(bar.value, 0)) - 5"
              :x="(x(bar.group) || -5000) + x.bandwidth() / 2"
            >{{ formatNumber(bar.value, 2) }}</text>
          </g>
        </g>
      </svg>
    </div>

    <div
      v-if="showInfo"
      class="fixed right-0 top-0 mt-2 mr-2 max-w-sm py-2 pl-4 pr-8 bg-white border border-gray-200 rounded shadow"
      @click="showInfo = false"
    >
      <button class="absolute right-0 top-0 py-2 px-3">
        X
      </button>
      <div
        v-for="info in infos"
        :key="info.id"
        class="whitespace-nowrap"
      >
        <span
          class="inline-block h-3 w-3 mr-2 border border-gray-200 rounded"
          :style="{ backgroundColor: info.color }"
        /> {{ info.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { max } from 'd3-array'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { stack } from 'd3-shape'
import { scaleBand, scaleLinear } from 'd3-scale'
import { DateTime } from 'luxon'
import { computed, watchEffect, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import formatNumber from '@/modules/formatNumber'
import useDatePicker from '@/modules/useDatePicker'
import useBreakpoints from '@/modules/useBreakpoints'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useElectricityFees from '@/modules/useElectricityFees'
import useElectricityPrices from '@/modules/useElectricityPrices'
import useDebugInfo from '@/modules/useDebugInfo'
import { ELECTRICITY_PRICE_COLOR, ELECTRICITY_TAX_COLOR } from '@/constants'

const route = useRoute()
const { t } = useI18n()
const { info } = useDebugInfo()

const { width: clientWidth, height: clientHeight, type } = useBreakpoints()
const { loading, showLoadingAnimation, showContent } = useDelayedLoadingAnimation(500, true)
const { feeForDate, feeById } = useElectricityFees()
const { loading: loadingPrices, loadingFailed,  priceForDate, loadForDateIso } = useElectricityPrices()

const electricitySupplier = computed(() => {
  if (
    typeof route.params.electricitySupplier === 'string'
    && route.params.electricitySupplier.length > 0
  ) {
    return route.params.electricitySupplier
  }
  return undefined
})

const minDate = ref(DateTime.fromISO('2023-01-01').setZone('Europe/Vienna').startOf('day'))
const maxDate = computed(() => {
  const dateTomorrow = DateTime.now().setZone('Europe/Vienna').endOf('day').plus({ days: 1 })
  if (priceForDate(dateTomorrow, electricitySupplier.value) === 0) {
    return DateTime.now().setZone('Europe/Vienna').endOf('day')
  }
  return dateTomorrow
})

const {
  currentDate, currentDateIso,
  selectDate, selectPrevDate, selectNextDate,
  prevDateValid, nextDateValid,
} = useDatePicker(minDate, maxDate)

watchEffect(() => {
  if (currentDateIso.value == null) {
    return
  }
  loading.value = loadingPrices.value.includes(currentDateIso.value)
})
watchEffect(() => {
  if (currentDateIso.value == null) {
    return
  }
  loadForDateIso(currentDateIso.value)
  const dateIsoPrev = currentDate.value.minus({ days: 1 }).toISODate()
  if (dateIsoPrev != null) {
    loadForDateIso(dateIsoPrev)
  }
  const dateIsoNext = currentDate.value.plus({ days: 1 }).toISODate()
  if (dateIsoNext != null) {
    loadForDateIso(dateIsoNext)
  }
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
  let margins = { top: 100, right: 40, bottom: 100, left: 60 }
  if (type.value === 'xs') {
    margins = { top: 20, right: 10, bottom: 30, left: 30 }
  }
  if (type.value === 'md') {
    margins = { top: 20, right: 10, bottom: 30, left: 30 }
  }
  const maxNegative = max(negativeBars.value.map((data) => Math.abs(data.power))) || 0
  if (maxNegative > 0) {
    const minMarginBottom = (clientHeight.value - 70 - margins.top) * (maxNegative / (maxNegative + 35))
    margins.bottom = Math.max(minMarginBottom, margins.bottom)
  }
  return margins
})
const width = computed(() => Math.max(800, Math.min(1800, clientWidth.value - margins.value.left - margins.value.right)))
const height = computed(() => clientHeight.value - 70 - margins.value.top - margins.value.bottom)

const excludeFees = computed(() => {
  let excludeFeesLocal: string[] = []
  if (typeof route.query.excludeFees === 'string') {
    excludeFeesLocal = route.query.excludeFees.split(',')
  }
  if (electricitySupplier.value != null) {
    excludeFeesLocal.push('infrastructureFee')
  }
  return excludeFeesLocal
})

const negativeBars = computed(() => 
  [...new Array(24).keys()]
    .filter((value) => {
      const usedDate = currentDate.value.set({ hour: value })
      return priceForDate(usedDate, electricitySupplier.value) < 0
    })
    .map((value) => {
      const usedDate = currentDate.value.set({ hour: value })
      const power = priceForDate(usedDate, electricitySupplier.value)
      const group = `${String(value).padStart(2, '0')}:00`
      return {
        key: `negative_price_${group}`,
        group,
        power: Math.floor(power / 100) / 100,
      }
    }),
)

const data = computed<Record<string, string | number>[]>(() => [...new Array(24).keys()].map((value) => {
  const usedDate = currentDate.value.set({ hour: value })
  const values: Record<string, number> = {}

  info('\n\n\n')
  info(`Calculating value for: ${usedDate.toISOTime()}`)

  const power = priceForDate(usedDate, electricitySupplier.value)
  info(`power: ${power}`)
  values.power = Math.max(power, 0)
  Object.keys(feeById).forEach((feeId) => {
    if (excludeFees.value.includes(feeId)) {
      return
    }
    values[feeId] = feeForDate(feeId, usedDate)
    info(`${feeId}: ${values[feeId]}`)
  })
  if (power < 0) {
    let powerSubtracted = 0
    Object.keys(feeById).forEach((feeId) => {
      if (excludeFees.value.includes(feeId)) {
        return
      }
      const powerToSubtract = Math.min(Math.abs(power) - powerSubtracted, values[feeId])
      powerSubtracted += powerToSubtract
      values[feeId] -= powerToSubtract
    })
    values.power = power + powerSubtracted
  }

  info(`total: ${Object.values(values).reduce((total, current) => total + current, 0)}`)
  const salesTax = Math.floor(Object.values(values).reduce((total, current) => total + current, 0) * 0.2)
  info(`salesTax: ${salesTax}`)
  const valuesInCents = Object.entries({ ...values, salesTax }).reduce((accumulator, [key, value]) => ({
    ...accumulator,
    [key]: value / 10000,
  }), {})
  info(`valuesInCents: ${JSON.stringify(valuesInCents, undefined, '  ')}`)

  return {
    group: `${String(value).padStart(2, '0')}:00`,
    ...valuesInCents,
  }
}))
const subgroups = computed(() => Object.keys(data.value[0]).filter((subgroup) => subgroup !== 'group'))
const groups = computed(() => data.value.map((point) => String(point.group)))
const maxY = computed(() => data.value
  .map((values) => Object.values(values).reduce((total: number, value: string | number) => {
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

const barsTotal = computed(() => data.value.map((values) => {
  const value = Object.entries(values).reduce((total: number, [, value]) => {
    if (typeof value !== 'number') {
      return total
    }
    return total + value
  }, 0)
  return {
    key: `valuesTotal_${values.group}`,
    group: String(values.group),
    value,
  }
}))

const stackedData = computed(() => stack().keys(subgroups.value)(data.value as any))

// info about colors
const showInfo = ref(false)
const infos = computed(() => [
  {
    id: 'electricity_tax',
    color: ELECTRICITY_TAX_COLOR,
    label: t('priceComponents.salesTax'),
  },
  ...Object.values(feeById).filter((fee) => !excludeFees.value.includes(fee.id)).reverse(),
  {
    id: 'electricity_price',
    color: ELECTRICITY_PRICE_COLOR,
    label: t('priceComponents.labelPrice'),
  },
])
</script>
