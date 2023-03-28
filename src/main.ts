import Vue, { createApp } from 'vue';
import App from './App.vue';

import '@babel/polyfill';
import 'mutationobserver-shim';
import './plugins/bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.config.productionTip = false;
createApp(App).mount('#app');
