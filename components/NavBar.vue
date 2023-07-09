<template>
  <nav class="border flex justify-between p-6">
    <nuxt-link to="/" class="logo">
      <icon size="1.5rem" name="🏚️" />
    </nuxt-link>
    <div class="grid gap-4 grid-flow-col">
      <nuxt-link to="/posts">
        Posts
      </nuxt-link>
      <a href="https://github.com/13ruceYu" target="_blank" title="GitHub" class="lt-md:hidden">
        <icon size="1.5rem" name="mdi:github" />
      </a>
    </div>
  </nav>
</template>
