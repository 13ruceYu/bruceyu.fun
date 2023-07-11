<script lang="ts" setup>
const route = useRoute()
</script>

<template>
  <div>
    <AnchorList class="anchor-list" />
    <div class="prose m-auto">
      <ContentDoc>
        <template #not-found>
          <h1>404</h1>
        </template>
      </ContentDoc>
      <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 slide-enter animate-delay-500">
        <NuxtLink
          :to="route.path.split('/').slice(0, -1).join('/') || '/'"
          class="font-mono op50 hover:op75"
        >
          > cd ..
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anchor-list {
  position: fixed;
  left: 10px;
  top: 150px;
}
</style>
