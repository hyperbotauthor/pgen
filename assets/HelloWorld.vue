<script lang="ts">
import { defineComponent, h, reactive, onMounted } from "vue";

import { api } from "../index";

async function getReqCnt(react: any) {
  const json = await api("reqcnt", { dummy: "dummy" });

  react.reqCnt = json.reqCnt;
}

export default defineComponent({
  name: "AppComponent",
  props: {},
  setup(props, context) {
    const react = reactive({
      reqCnt: 0,
    });

    onMounted(() => getReqCnt(react));

    const renderFunction = () => {
      return h(
        "div",
        { class: "helloworld" },
        h("div", { class: "reqcnt" }, react.reqCnt)
      );
    };

    return renderFunction;
  },
});
</script>

<style lang="scss">
.helloworld {
  .reqcnt {
    font-family: monospace;
    color: #007;
    font-weight: bold;
    font-size: 20px;
  }
}
</style>