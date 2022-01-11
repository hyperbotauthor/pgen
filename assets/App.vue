<template>
  <AppComponent />
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import { AppComponent } from "../dist/index.js";

const data = {
  reqCnt: 0,
};

@Options({
  components: {
    AppComponent,
  },
  data() {
    return data;
  },
  mounted() {},
})
export default class App extends Vue {}
</script>

<style>
#app {
  text-align: center;
}
</style>