<template>
  <ContentList v-slot="{ list }" path="/posts">
    <div v-for="post in list" :key="post._path">
      <nuxt-link :to="post._path">
        {{ post.title }}
      </nuxt-link>
    </div>
  </ContentList>
</template>
