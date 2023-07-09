<template>
  <nav class="border flex justify-between">
    <nuxt-link to="/" class="logo">home</nuxt-link>
    <div>
      <a href="https://github.com/13ruceYu" target="_blank" title="GitHub" class="lt-md:hidden">
        <icon name="mdi:github"/>
      </a>
    </div>
  </nav>
  <nuxt-page />
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
