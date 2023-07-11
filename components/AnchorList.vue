<script lang="ts" setup>
const { toc } = useContent()
</script>

<template>
  <div v-if="toc && toc.links" class="prose text-sm text-coolGray">
    <div v-for="link in toc.links" :key="link.text">
      <a :href="`#${link.id}`">
        {{ link.text }}
      </a>
      <div v-if="link.children" class="ml-4">
        <a v-for="cLink in link.children" :key="cLink.id" :href="`#${cLink.id}`">{{ cLink.text }}</a>
      </div>
    </div>
  </div>
</template>
