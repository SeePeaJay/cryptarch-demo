<template>
  <div id="app">
		<textarea name="editor" onkeydown="if(event.keyCode===9){var v=this.value,s=this.selectionStart,e=this.selectionEnd;this.value=v.substring(0, s)+'\t'+v.substring(e);this.selectionStart=this.selectionEnd=s+1;return false;}" v-model="engram"></textarea>
		<section v-html="engramInHtml"></section>
  </div>
</template>

<script>
const { decrypt } = require('cryptarch');

export default {
  name: 'App',
  data() {
		return {
			engram: '* Title\n\n*_1 Level 1 Subtitle\n\n*_2 Level 2 Subtitle\n\n*_3 Level 3 Subtitle\n\n. Unordered list item a\n. Unordered list item b\n. Unordered list item c\n\n1. Ordered list item 1\n2. Ordered list item 2\n3. Ordered list item 3\n\n---\n\n$http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}\n\nA paragraph.\n\nA paragraph with @@bold@@, //italic//, __underlined__, ==highlighted==, and --strikethrough-- text.\n\nA paragraph with nested styles: @@bold, //italic, __underlined, ==highlighted, and --strikethrough--==__//@@ text.\n\nA paragraph with inline code: </console.log(\'hello world!\')>.\n\nA paragraph with two types of links: autolink ( www.google.com ), and __link alias__(www.google.com).\n\nA paragraph with an inline image: $http://static.wikia.nocookie.net/ninjajojos-bizarre-adventure/images/f/f7/Made_in_Heaven.png/revision/latest/top-crop/width/360/height/450?cb=20210721002513{}.',
		}
  },
	computed: {
		engramInHtml() {
			const html = decrypt(this.engram);
			return html;
		}
	},
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

textarea {
	background: #fff;
	border: none;
	left: 0;
	outline: none;
	padding: 30px 10px;
	resize: none; 
	white-space: pre-wrap;
	word-wrap: break-word;	
}

section {
	background: #f5f6f8;
	display: inline-block;
	left: 50%;
	overflow: auto;
	padding: 10px;
}

textarea, section {
	box-sizing: border-box;
	height: 100%;
	position: absolute;
	top: 0;
	width: 50%;
}
</style>
