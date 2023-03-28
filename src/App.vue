<template>
  <div id="app">
    <BlocksTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BlocksTable from './components/BlocksTable.vue';

export default defineComponent({
  name: 'App',
  components: {
    BlocksTable
  }
});
</script>

<style lang="scss">
@import '~@/assets/scss/vendors/bootstrap-vue/index';
html {
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', Arial, sans-serif;
  height: 100%;
}

#app {
  height: 100%;
}
</style>
