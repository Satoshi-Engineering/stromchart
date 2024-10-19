<template>
  <div
    class="
      flex items-center justify-center
      rounded-md border-2 border-transparent
    "
    :class="{
      'bg-green-400': price <= addFixedCostsAndVat(-8),
      'bg-green-200': price > addFixedCostsAndVat(-8) && price <= addFixedCostsAndVat(5),
      'bg-yellow-100': price > addFixedCostsAndVat(5) && price <= addFixedCostsAndVat(10),
      'bg-orange-200': price > addFixedCostsAndVat(10) && price <= addFixedCostsAndVat(15),
      'bg-red-300': price > addFixedCostsAndVat(15) && price <= addFixedCostsAndVat(25),
      'bg-red-500': price > addFixedCostsAndVat(25),
      '!border-black font-bold': isCurrentHour,
    }"
  >
    {{ price.toFixed(2) }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  price: {
    type: Number,
    required: true,
  },
  isCurrentHour: {
    type: Boolean,
    default: false,
  },
  addVat: {
    type: Boolean,
    default: false,
  },
  fixedCosts: {
    type: Number,
    required: true,
  },
})

const addFixedCostsAndVat = (price: number) => {
  let priceWithFixedCosts = price
  if (!isNaN(Number(props.fixedCosts))) {
    priceWithFixedCosts += Number(props.fixedCosts)
  }
  if (props.addVat) {
    priceWithFixedCosts *= 1.2
  }
  return priceWithFixedCosts
}
</script>
