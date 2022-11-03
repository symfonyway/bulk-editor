<template>
  <div id="app">
    <h1 class="pb-4 fw-bold text-center">Product Bulk Editor</h1>
    <BulkEditor :app-data="appData" />
  </div>
</template>

<script>
import BulkEditor from './components/bulkEditor/BulkEditor'

export default {
  name: 'App',
  components: {
    BulkEditor
  },
  data() {
    return {
      appData: {
        defaultSiteId: '1'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  height: 100vh;
  padding-top: 50px;
}
</style>
