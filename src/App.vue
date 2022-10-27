<template>
  <div id="app">
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
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
