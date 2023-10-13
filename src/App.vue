<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="40" height="40" />

    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/surface">Surface</RouterLink>
        <RouterLink to="/volume">Volume</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped lang="less">
header {
  display: flex;
  flex-direction: column;
  width: 80px;
  height: 100vh;
  img {
    width: 80px;
    height: 80px;
  }
}

.logo {
  display: block;
  margin: 0 auto 1rem;
}

.wrapper{
  display: flex;
  height: calc(~'100vh - 80px');
  flex-direction: column;
}
nav {
  width: 100%;
  font-size: 14px;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 10px 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
