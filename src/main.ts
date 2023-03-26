import Vue from 'vue';
import App from './App.vue';

import '@babel/polyfill';
import 'mutationobserver-shim';
import './plugins/bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App)
}).$mount('#app');
