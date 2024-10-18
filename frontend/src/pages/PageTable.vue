<template>
  <div class="flex-1 flex flex-col items-center overflow-hidden">
    <div v-if="showLoadingAnimation" class="flex-1 grid justify-center content-center">
      <AnimatedLoadingWheel />
    </div>
    <div
      v-else-if="showContent && currentDateIso != null && loadingFailed.includes(currentDateIso)"
      class="flex-1 grid justify-center content-center text-red-600"
    >
      {{ $t('errors.loadingPricesFailed') }}
    </div>
    <div
      v-else-if="showContent"
      class="
        w-full max-w-lg mx-auto
        h-screen min-h-[550px] max-h-[800px]
        py-1 pr-2
        grid grid-cols-[40px_1fr_1fr_1fr] gap-0.5 text-sm
      "
    >
      <div />
      <div class="flex items-center justify-center font-bold">
        {{ currentDate.minus({ days: 1 }).toFormat('dd. LL.') }}
      </div>
      <div class="flex items-center justify-center font-bold">
        {{ currentDate.toFormat('dd. LL.') }}
      </div>
      <div class="flex items-center justify-center font-bold">
        {{ currentDate.plus({ days: 1 }).toFormat('dd. LL.') }}
      </div>
      <template
        v-for="(price, index) in prices"
        :key="index"
      >
        <div class="flex items-center justify-end pr-3 text-right">
          {{ String(price.hour).padStart(2, '0') }}
        </div>
        <div
          class="flex items-center justify-center rounded-md text-center"
          :class="{
            'bg-green-400': price.pricePrev <= -5,
            'bg-green-200': price.pricePrev > -5 && price.pricePrev <= 5,
            'bg-yellow-100': price.pricePrev > 5 && price.pricePrev <= 10,
            'bg-orange-200': price.pricePrev > 10 && price.pricePrev <= 15,
            'bg-red-300': price.pricePrev > 15 && price.pricePrev <= 25,
            'bg-red-500': price.pricePrev > 25,
            'border-4': currentDate.minus({ days: 1 }).toISODate() === DateTime.now().toISODate()
              && DateTime.now().toFormat('H') === String(price.hour),
            'font-bold': currentDate.minus({ days: 1 }).toISODate() === DateTime.now().toISODate()
              && DateTime.now().toFormat('H') === String(price.hour),
          }"
        >
          {{ price.pricePrev.toFixed(2) }}
        </div>
        <div
          class="flex items-center justify-center rounded-md text-center"
          :class="{
            'bg-green-400': price.price <= -5,
            'bg-green-200': price.price > -5 && price.price <= 5,
            'bg-yellow-100': price.price > 5 && price.price <= 10,
            'bg-orange-200': price.price > 10 && price.price <= 15,
            'bg-red-300': price.price > 15 && price.price <= 25,
            'bg-red-500': price.price > 25,
            'border-2 font-bold': currentDate.toISODate() === DateTime.now().toISODate()
              && DateTime.now().toFormat('H') === String(price.hour),
          }"
        >
          {{ price.price.toFixed(2) }}
        </div>
        <div
          v-if="currentDate.plus({ days: 1 }) <= maxDate"
          class="flex items-center justify-center rounded-md text-center"
          :class="{
            'bg-green-400': price.priceNext <= -5,
            'bg-green-200': price.priceNext > -5 && price.priceNext <= 5,
            'bg-yellow-100': price.priceNext > 5 && price.priceNext <= 10,
            'bg-orange-200': price.priceNext > 10 && price.priceNext <= 15,
            'bg-red-300': price.priceNext > 15 && price.priceNext <= 25,
            'bg-red-500': price.priceNext > 25,
            'border-4': currentDate.plus({ days: 1 }).toISODate() === DateTime.now().toISODate()
              && DateTime.now().toFormat('H') === String(price.hour),
            'font-bold': currentDate.plus({ days: 1 }).toISODate() === DateTime.now().toISODate()
              && DateTime.now().toFormat('H') === String(price.hour),
          }"
        >
          {{ price.priceNext.toFixed(2) }}
        </div>
        <div v-else />
      </template>
    </div>
    <div class="relative w-full flex my-4 px-2 justify-center">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { computed, watchEffect, ref } from 'vue'

import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'
import useDatePicker from '@/modules/useDatePicker'
import useBreakpoints from '@/modules/useBreakpoints'
import useDelayedLoadingAnimation from '@/modules/useDelayedLoadingAnimation'
import useElectricityPrices from '@/modules/useElectricityPrices'

const { type } = useBreakpoints()
const { loading, showLoadingAnimation, showContent } = useDelayedLoadingAnimation(500, true)
const {
  loadForDateIso, loading: loadingPrices, loadingFailed,
  priceForDate,
} = useElectricityPrices()

const minDate = ref(DateTime.fromISO('2023-01-01').startOf('day'))
const maxDate = computed(() => {
  const dateTomorrow = DateTime.now().endOf('day').plus({ days: 1 })
  if (priceForDate(dateTomorrow, 'EPEX') === 0) {
    return DateTime.now().endOf('day')
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

const prices = computed(() => {
  const prices = []
  for (let hour = 0; hour < 24; hour++) {
    prices.push({
      hour,
      pricePrev: priceForDate(currentDate.value.minus({ days: 1 }).set({ hour }), 'EPEX'),
      price: priceForDate(currentDate.value.set({ hour }), 'EPEX'),
      priceNext: priceForDate(currentDate.value.plus({ days: 1 }).set({ hour }), 'EPEX'),
    })
  }
  return prices
})
</script>
