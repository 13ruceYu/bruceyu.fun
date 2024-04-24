<template>
  <nav class="flex justify-between p-6">
    <nuxt-link to="/" class="logo">
      <icon size="1.5rem" name="🏚️" />
    </nuxt-link>
    <div class="grid gap-4 grid-flow-col">
      <nuxt-link to="/arts">
        ARTS
      </nuxt-link>
      <nuxt-link to="/posts">
        Posts
      </nuxt-link>
      <a href="https://github.com/13ruceYu" target="_blank" title="GitHub" class="lt-md:hidden">
        <icon size="1.5rem" name="carbon:logo-github" />
      </a>
      <a @click="$colorMode.preference === 'dark' ? $colorMode.preference = 'light' : $colorMode.preference = 'dark'">
        <icon size="1.5rem" :name="$colorMode.preference === 'dark' ? 'carbon:moon' : 'carbon:sun'" />
      </a>
    </div>
  </nav>
</template>

<style scoped>
nav a {
  cursor: pointer;
}
</style>
