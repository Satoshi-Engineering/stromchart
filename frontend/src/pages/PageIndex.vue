<template>
  <div class="grid justify-items-center text-center">
    <div class="max-w-3xl w-full p-4">
      <HeadlineDefault level="h1">
        Stromchart
      </HeadlineDefault>
    </div>
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
            v-for="(bars, index) in stackedData"
            :key="bars.key"
            :fill="colors[index]"
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
</template>

<script setup lang="ts">
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { stack } from 'd3-shape'
import { scaleBand, scaleLinear } from 'd3-scale'
import { computed } from 'vue'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import useElectricityFees from '@/modules/useElectricityFees'
import useElectricityPrices from '@/modules/useElectricityPrices'

const { feeForDate } = useElectricityFees()
const { priceForDate } = useElectricityPrices()

const colors = ['#B9D8C2', '#9AC2C9', '#8AA1B1', '#4A5043', '#FFCB47', '#9A998C']
const margins = { top: 100, right: 100, bottom: 50, left: 100 }
const width = document.body.clientWidth - margins.left - margins.right
const height = document.body.clientHeight - 70 - margins.top - margins.bottom

const data = computed(() => [...new Array(24).keys()].map((value) => {
  const usedDate = new Date()
  usedDate.setHours(value)
  const values = {
    infrastructureFee: feeForDate('infrastructureFee', usedDate),
    electricityFee: feeForDate('electricityFee', usedDate),
    gridFee: feeForDate('gridFee', usedDate),
    gridLoss: feeForDate('gridLoss', usedDate),
    power: priceForDate(usedDate),
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
