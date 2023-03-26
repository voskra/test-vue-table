<template>
  <div id="app">
    <BlocsTable />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BlocsTable from './components/BlocsTable.vue';

export default Vue.extend({
  name: 'App',
  components: {
    BlocsTable
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
