<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="grid grid-cols-2 max-w-md w-full m-auto mt-0 mb-0 print:hidden"
    >
      <BackLink
        v-if="backlink != null"
        class="p-4"
        :to="backlink.to"
        :only-internal-referrer="backlink.onlyInternalReferrer"
      />
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'

import { setLocale, type LocaleCode } from '@/modules/initI18n'
import BackLink from '@/components/BackLink.vue'
import { useSeoHelpers } from '@/modules/seoHelpers'

const router = useRouter()
const route = useRoute()
const { setDocumentTitle, setHeaderSeo } = useSeoHelpers()

router.afterEach(async () => {
  if (route?.params.lang != null && route?.params.lang !== '') {
    setLocale(route.params.lang as LocaleCode)
  }
  await nextTick()
  setHeaderSeo()
  setDocumentTitle()
})

const backlink = computed(() => {
  if (route.meta.backlink === true) {
    return {
      to: undefined,
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  if (typeof route.meta.backlink === 'string') {
    return {
      to: { name: route.meta.backlink },
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  if (typeof route.meta.backlink === 'function') {
    return {
      to: route.meta.backlink(route),
      onlyInternalReferrer: !!route.meta.backlinkOnlyInternalReferrer,
    }
  }
  return null
})
</script>
