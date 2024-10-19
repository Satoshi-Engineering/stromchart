<template>
  <div
    class="
      flex items-center justify-center
      rounded-md border-2 border-transparent
    "
    :class="{
      'bg-green-400': price <= -5,
      'bg-green-200': price > -5 && price <= 5,
      'bg-yellow-100': price > 5 && price <= 10,
      'bg-orange-200': price > 10 && price <= 15,
      'bg-red-300': price > 15 && price <= 25,
      'bg-red-500': price > 25,
      '!border-black font-bold': isCurrentHour,
    }"
  >
    {{ price.toFixed(2) }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  price: {
    type: Number,
    required: true,
  },
  isCurrentHour: {
    type: Boolean,
    default: false,
  },
})
</script>
