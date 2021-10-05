<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
	<textarea name="editor" onkeydown="if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'\t'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}" v-model="message"></textarea>
	<section>{{ message }}</section>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  data() {
		return {
			message: ''
		}
  },
  components: {
    // HelloWorld
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

textarea {
	top: 0;
	left: 0;
	width: 50%;
	padding: 30px 10px;
	background: #fff;
	display: inline-block;
	appearance: auto;
	cursor: text;
	resize: horizontal;
	white-space: pre-wrap;
	word-wrap: break-word;
}

section {
	top: 0;
	left: 50%;
	width: 50%;
	padding: 10px;
	overflow: auto;
	display: inline-block;
}

textarea, section {
	position: absolute;
	box-sizing: border-box;
	height: 100%;
	border: none;
}
</style>
