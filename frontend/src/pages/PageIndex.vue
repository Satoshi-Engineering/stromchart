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
        <g ref="yAxis" />
        <g
          ref="xAxis"
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
import { onMounted, ref } from 'vue'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

const colors = ['#B9D8C2', '#9AC2C9', '#8AA1B1', '#4A5043', '#FFCB47', '#9A998C']
const margins = { top: 100, right: 100, bottom: 50, left: 100 }
const width = document.body.clientWidth - margins.left - margins.right
const height = document.body.clientHeight - 70 - margins.top - margins.bottom
const data = [...new Array(24).keys()].map((value) => {
  const values = {
    infrastructureFee: 40000,
    electricityFee: 15000,
    gridFee: 68900,
    gridLoss: 3870,
    power: Math.floor(Math.random() * 40000),
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
})
const subgroups = Object.keys(data[0]).filter((subgroup) => subgroup !== 'group')
const groups = data.map((point) => point.group)

const x = scaleBand()
  .domain(groups)
  .range([0, width])
  .padding(0.2)
const y = scaleLinear()
  .domain([0, 60])
  .range([height, 0])

const xAxis = ref<HTMLElement | null>(null)
const yAxis = ref<HTMLElement | null>(null)
onMounted(() => {
  if (xAxis.value == null || yAxis.value == null) {
    return
  }
  select(xAxis.value).call(axisBottom(x).tickSizeOuter(0) as any)
  select(yAxis.value).call(axisLeft(y) as any)
})

const stackedData = stack()
  .keys(subgroups)(data as any)

</script>
