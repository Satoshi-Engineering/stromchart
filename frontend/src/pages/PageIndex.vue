<template>
  <div class="flex-1 flex flex-col items-center">
    <div class="max-w-3xl w-full p-4 text-center">
      <HeadlineDefault level="h1">
        {{ currentDateFormatted }}
      </HeadlineDefault>
    </div>
    <div v-if="showLoadingAnimation" class="flex-1 grid justify-center content-center">
      <AnimatedLoadingWheel />
    </div>
    <div v-else-if="showContent && loadingFailed" class="flex-1 grid justify-center content-center text-red-600">
      {{ $t('errors.loadingPricesFailed') }}
    </div>
    <div v-else-if="showContent">
      <svg
        :width="width + margins.left + margins.right"
        :height="height + margins.top + margins.bottom"
      >
        <g :transform="`translate(${margins.left}, ${margins.top})`">
          <g v-axis-left />
          <g
            v-axis-bottom
            :transform="`translate(0, ${height})`"
          />
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
          </g>
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
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import useDatePicker from '@/modules/useDatePicker'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useElectricityFees from '@/modules/useElectricityFees'
import useElectricityPrices from '@/modules/useElectricityPrices'
import { ELECTRICITY_PRICE_COLOR, ELECTRICITY_TAX_COLOR } from '@/constants'

const route = useRoute()
const { currentDateFormatted, currentDateIso } = useDatePicker()
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
    [key]: fee.color
  }), {}),
  power: ELECTRICITY_PRICE_COLOR,
  salesTax: ELECTRICITY_TAX_COLOR,
}))

const margins = { top: 100, right: 100, bottom: 50, left: 100 }
const width = document.body.clientWidth - margins.left - margins.right
const height = document.body.clientHeight - 70 - margins.top - margins.bottom

const excludeFees = computed(() => {
  if (typeof route.query.excludeFees !== 'string') {
    return []
  }
  return route.query.excludeFees.split(',')
})

const data = computed(() => [...new Array(24).keys()].map((value) => {
  const usedDate = new Date()
  usedDate.setHours(value)
  const values: Record<string, number> = {}
  Object.keys(feeById).forEach((feeId) => {
    if (excludeFees.value.includes(feeId)) {
      return
    }
    values[feeId] = feeForDate(feeId, usedDate)
  })
  values.power = priceForDate(usedDate)
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
  .range([0, width])
  .padding(0.2))
const y = computed(() => scaleLinear()
  .domain([0, Math.max(35, maxY.value * 1.2)])
  .range([height, 0]))

const vAxisBottom = {
  mounted: (el: HTMLElement) => {
    select(el).call(axisBottom(x.value).tickSizeOuter(0) as any)
  },
}
const vAxisLeft = {
  mounted: (el: HTMLElement) => {
    select(el).call(axisLeft(y.value) as any)
  },
}

const stackedData = computed(() => stack().keys(subgroups.value)(data.value as any))
</script>
